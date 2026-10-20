type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
};
type RoutePoint = { label?: string; latitude: number; longitude: number };

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}
function validPoint(point: unknown): point is RoutePoint {
  if (!point || typeof point !== "object") return false;
  const value = point as Record<string, unknown>;
  return typeof value.latitude === "number" && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90 &&
    typeof value.longitude === "number" && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180;
}
export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=300");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  let points: RoutePoint[];
  try {
    const parsed = JSON.parse(queryValue(req.query?.points)) as unknown;
    if (!Array.isArray(parsed) || !parsed.every(validPoint)) throw new Error("Invalid route points");
    points = parsed.slice(0, 9);
  } catch {
    res.status(400).json({ error: "Route points must include valid latitude and longitude coordinates." });
    return;
  }
  if (points.length < 2) {
    res.status(200).json({
      route: { coordinates: points.map((point) => [point.latitude, point.longitude]), distanceMeters: 0, durationSeconds: 0, source: "Store location" }
    });
    return;
  }
  const coordinatePath = points.map((point) => String(point.longitude) + "," + String(point.latitude)).join(";");
  try {
    const routeUrl = new URL("https://router.project-osrm.org/route/v1/driving/" + coordinatePath);
    routeUrl.searchParams.set("overview", "full");
    routeUrl.searchParams.set("geometries", "geojson");
    routeUrl.searchParams.set("steps", "false");
    const response = await fetch(routeUrl, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error("Routing service failed");
    const payload = await response.json() as {
      code?: string;
      routes?: Array<{ distance?: number; duration?: number; geometry?: { coordinates?: Array<[number, number]> } }>
    };
    const route = payload.routes?.[0];
    if (payload.code !== "Ok" || !route?.geometry?.coordinates?.length) throw new Error("No driving route returned");
    res.status(200).json({
      route: {
        coordinates: route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude]),
        distanceMeters: route.distance || 0,
        durationSeconds: route.duration || 0,
        source: "OpenStreetMap + OSRM"
      }
    });
  } catch {
    res.status(502).json({ error: "The road-routing service is temporarily unavailable." });
  }
}