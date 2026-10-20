type ApiRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  end: () => void;
};

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}

async function getKrogerToken(): Promise<string> {
  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Kroger credentials are not configured");

  const credentials = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const response = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + credentials,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "product.compact" })
  });
  if (!response.ok) throw new Error("Kroger authentication failed");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Kroger returned no access token");
  return data.access_token;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const configured = Boolean(process.env.KROGER_CLIENT_ID && process.env.KROGER_CLIENT_SECRET);
  if (queryValue(req.query?.action) === "status") {
    res.status(200).json({ configured, provider: configured ? "Kroger" : null, mode: configured ? "live-available" : "estimate" });
    return;
  }
  if (!configured) {
    res.status(503).json({
      configured: false,
      mode: "estimate",
      error: "Live retail prices are not configured. Add server-side Kroger API credentials to enable them."
    });
    return;
  }

  const zip = queryValue(req.query?.zip).trim();
  if (!/^\d{5}$/.test(zip)) {
    res.status(400).json({ error: "Enter a valid 5-digit ZIP code." });
    return;
  }
  const terms = queryValue(req.query?.terms).split(",").map((term) => term.trim()).filter(Boolean).slice(0, 10);
  if (!terms.length) {
    res.status(400).json({ error: "At least one product term is required." });
    return;
  }

  try {
    const token = await getKrogerToken();
    const locationUrl = new URL("https://api.kroger.com/v1/locations");
    locationUrl.searchParams.set("filter.zipCode.near", zip);
    locationUrl.searchParams.set("filter.radiusInMiles", "10");
    locationUrl.searchParams.set("filter.limit", "5");
    const locationsResponse = await fetch(locationUrl, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
    if (!locationsResponse.ok) throw new Error("Unable to retrieve nearby Kroger locations");
    const locationsData = await locationsResponse.json() as { data?: Array<{ locationId?: string; name?: string; address?: { addressLine1?: string; city?: string; state?: string; zipCode?: string } }> };
    const locations = locationsData.data || [];
    const location = locations.find((item) => item.locationId);
    if (!location?.locationId) {
      res.status(200).json({ configured: true, source: "Kroger", items: [], location: null, retrievedAt: new Date().toISOString(), message: "No participating Kroger locations were found near this ZIP code." });
      return;
    }

    const results = await Promise.all(terms.map(async (term) => {
      const productUrl = new URL("https://api.kroger.com/v1/products");
      productUrl.searchParams.set("filter.term", term);
      productUrl.searchParams.set("filter.locationId", location.locationId!);
      productUrl.searchParams.set("filter.limit", "5");
      const response = await fetch(productUrl, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
      if (!response.ok) return null;
      const payload = await response.json() as { data?: Array<{ productId?: string; description?: string; brand?: string; items?: Array<{ price?: { regular?: number; promo?: number }; size?: string; itemId?: string }> }> };
      const products = payload.data || [];
      const product = products.find((item) => item.items?.some((entry) => typeof entry.price?.regular === "number"));
      if (!product) return null;
      const item = product.items?.find((entry) => typeof entry.price?.regular === "number");
      if (!item || typeof item.price?.regular !== "number") return null;
      return {
        query: term,
        name: product.description || term,
        brand: product.brand,
        price: item.price.regular,
        promoPrice: typeof item.price.promo === "number" && item.price.promo > 0 ? item.price.promo : null,
        size: item.size,
        productId: product.productId || item.itemId,
        source: "Kroger"
      };
    }));

    const address = location.address;
    res.status(200).json({
      configured: true,
      source: "Kroger",
      location: {
        id: location.locationId,
        name: location.name || "Nearby Kroger store",
        address: [address?.addressLine1, address?.city, address?.state, address?.zipCode].filter(Boolean).join(", ")
      },
      retrievedAt: new Date().toISOString(),
      items: results.filter((item) => item !== null)
    });
  } catch {
    res.status(502).json({
      configured: true,
      error: "The live price check could not be completed. Please try again; your estimated basket is unchanged."
    });
  }
}