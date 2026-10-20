type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};
type Coordinates = { latitude: number; longitude: number };
type ShoppingPlace = {
  id: string; name: string; address: string; latitude: number; longitude: number; distance?: number;
  category?: string; source: "OpenStreetMap";
};

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}
function numeric(value: unknown): number | undefined {
  if (typeof value === "string" && !value.trim()) return undefined;
  const result = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(result) ? result : undefined;
}
function distanceMiles(a: Coordinates, b: Coordinates): number {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}
async function geocodeZip(zip: string): Promise<Coordinates | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("postalcode", zip);
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  const response = await fetch(url, {
    headers: { "User-Agent": "Shopline/0.2 (nearby grocery discovery)", "Accept-Language": "en-US,en;q=0.8" },
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) return null;
  const data = await response.json() as Array<{ lat?: string; lon?: string }>;
  const latitude = numeric(data[0]?.lat);
  const longitude = numeric(data[0]?.lon);
  return latitude !== undefined && longitude !== undefined ? { latitude, longitude } : null;
}
async function queryOverpass(center: Coordinates): Promise<unknown[]> {
  const around = "around:12000," + center.latitude + "," + center.longitude;
  const query = [
    "[out:json][timeout:18];(",
    'node["shop"~"^(supermarket|grocery|convenience|department_store|wholesale)$"](' + around + ");",
    'way["shop"~"^(supermarket|grocery|convenience|department_store|wholesale)$"](' + around + ");",
    'relation["shop"~"^(supermarket|grocery|convenience|department_store|wholesale)$"](' + around + ");",
    'node["name"~"Walmart|Target|Costco|Walgreens|CVS|Ralphs|Vons|Pavilions|Trader Joe|Whole Foods|Sprouts|Albertsons|Food 4 Less|Aldi|Bristol Farms|Smart & Final",i](' + around + ");",
    'way["name"~"Walmart|Target|Costco|Walgreens|CVS|Ralphs|Vons|Pavilions|Trader Joe|Whole Foods|Sprouts|Albertsons|Food 4 Less|Aldi|Bristol Farms|Smart & Final",i](' + around + ");",
    ");out center tags;"
  ].join("");
  for (const endpoint of ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": "Shopline/0.2 (nearby grocery discovery)" },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(19000)
      });
      if (!response.ok) continue;
      const payload = await response.json() as { elements?: unknown[] };
      if (Array.isArray(payload.elements)) return payload.elements;
    } catch {
      // Retry using the secondary public Overpass instance.
    }
  }
  return [];
}
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const zip = queryValue(req.query?.zip).trim();
  if (!/^\d{5}$/.test(zip)) {
    res.status(400).json({ error: "Enter a valid 5-digit ZIP code." });
    return;
  }
  const inputLat = numeric(queryValue(req.query?.lat));
  const inputLon = numeric(queryValue(req.query?.lon));
  const hasInputCoordinates = inputLat !== undefined && inputLon !== undefined &&
    inputLat >= -90 && inputLat <= 90 && inputLon >= -180 && inputLon <= 180;
  try {
    const center = hasInputCoordinates ? { latitude: inputLat!, longitude: inputLon! } : await geocodeZip(zip);
    if (!center) {
      res.status(200).json({ source: "OpenStreetMap", places: [], center: null, message: "That ZIP code could not be located. Try another ZIP or use your browser's location permission." });
      return;
    }
    const elements = await queryOverpass(center) as Array<{
      type?: string; id?: number; lat?: number; lon?: number; center?: { lat?: number; lon?: number };
      tags?: Record<string, string | undefined>;
    }>;
    const seen = new Set<string>();
    const places: ShoppingPlace[] = [];
    for (const element of elements) {
      const latitude = numeric(element.lat ?? element.center?.lat);
      const longitude = numeric(element.lon ?? element.center?.lon);
      const tags = element.tags || {};
      const name = (tags.name || tags.brand || "").trim();
      if (!name || latitude === undefined || longitude === undefined) continue;
      const id = "osm-" + (element.type || "place") + "-" + String(element.id || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
      if (seen.has(id)) continue;
      seen.add(id);
      const street = [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" ");
      const locality = [tags["addr:city"] || tags["addr:town"] || tags["addr:suburb"], tags["addr:state"], tags["addr:postcode"]].filter(Boolean).join(", ");
      const distance = distanceMiles(center, { latitude, longitude });
      places.push({
        id, name, latitude, longitude, distance: Math.round(distance * 10) / 10,
        address: [street, locality].filter(Boolean).join(", "),
        category: tags.shop || (tags.amenity === "marketplace" ? "market" : "retail"),
        source: "OpenStreetMap"
      });
    }
    places.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    res.status(200).json({
      source: "OpenStreetMap", center, places: places.slice(0, 36), retrievedAt: new Date().toISOString(),
      message: places.length
        ? places.length + " nearby shopping locations found."
        : "No grocery stores were returned in the OpenStreetMap data for this area. Try sharing precise location or another ZIP code."
    });
  } catch {
    res.status(200).json({ source: "OpenStreetMap", places: [], center: null, message: "Nearby store lookup is temporarily unavailable. Your shopping list still works." });
  }
}