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
type ShoppingItemQuery = { id: string; term: string };
type StorePoint = { id: string; name: string; address: string; latitude?: number; longitude?: number; distance?: number };
type Offer = {
  ingredientId: string; query: string; name: string; brand?: string; price: number; promoPrice: number | null;
  size?: string; productId?: string; imageUrl?: string; source: string; store: StorePoint;
};

function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}
function numberValue(value: unknown): number | undefined {
  const result = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(result) ? result : undefined;
}
function parseItems(raw: string): ShoppingItemQuery[] {
  if (raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as Array<{ id?: unknown; term?: unknown; name?: unknown }>;
      return parsed
        .filter((item) => typeof item.id === "string" && typeof (item.term ?? item.name) === "string")
        .map((item) => ({ id: String(item.id), term: String(item.term ?? item.name).trim() }))
        .filter((item) => item.term.length > 0)
        .slice(0, 24);
    } catch {
      return [];
    }
  }
  return raw.split(",").map((term, index) => ({ id: "product-" + index, term: term.trim() })).filter((item) => item.term).slice(0, 24);
}

async function getKrogerToken(): Promise<string> {
  const clientId = process.env.CLIENT_ID || process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.CLIENT_SECRET || process.env.KROGER_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error("Kroger credentials are not configured");
  const credentials = Buffer.from(clientId + ":" + clientSecret).toString("base64");
  const response = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
    method: "POST",
    headers: { Authorization: "Basic " + credentials, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "product.compact" })
  });
  if (!response.ok) throw new Error("Kroger authentication failed");
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Kroger returned no access token");
  return data.access_token;
}
async function mapLimit<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) break;
      results[index] = await worker(items[index]);
    }
  });
  await Promise.all(runners);
  return results;
}

export default async function handler(req: ApiRequest, res: ApiResponse): Promise<void> {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const configured = Boolean(
    (process.env.CLIENT_ID || process.env.KROGER_CLIENT_ID) &&
    (process.env.CLIENT_SECRET || process.env.KROGER_CLIENT_SECRET)
  );
  if (queryValue(req.query?.action) === "status") {
    res.status(200).json({ configured, provider: configured ? "Kroger" : null, mode: configured ? "live-available" : "estimate" });
    return;
  }
  if (!configured) {
    res.status(503).json({ configured: false, mode: "estimate", error: "Live retailer prices are not configured. Add server-side Kroger API credentials." });
    return;
  }
  const zip = queryValue(req.query?.zip).trim();
  if (!/^\d{5}$/.test(zip)) {
    res.status(400).json({ error: "Enter a valid 5-digit ZIP code." });
    return;
  }
  const action = queryValue(req.query?.action);
  const locationsOnly = action === "locations";
  const rawItems = queryValue(req.query?.items);
  const items = parseItems(rawItems || queryValue(req.query?.terms));
  if (!items.length && !locationsOnly) {
    res.status(400).json({ error: "Add at least one item to look up." });
    return;
  }

  try {
    const token = await getKrogerToken();
    const locationUrl = new URL("https://api.kroger.com/v1/locations");
    locationUrl.searchParams.set("filter.zipCode.near", zip);
    locationUrl.searchParams.set("filter.radiusInMiles", "25");
    locationUrl.searchParams.set("filter.limit", "5");
    const locationsResponse = await fetch(locationUrl, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
    if (!locationsResponse.ok) throw new Error("Unable to retrieve nearby Kroger locations");
    const locationsData = await locationsResponse.json() as {
      data?: Array<{
        locationId?: string; name?: string; distance?: number;
        address?: { addressLine1?: string; city?: string; state?: string; zipCode?: string };
        geolocation?: { latitude?: number | string; longitude?: number | string; lat?: number | string; lon?: number | string };
      }>
    };
    const locationRows = (locationsData.data || []).filter((location) => location.locationId).slice(0, 4);
    const stores: StorePoint[] = locationRows.map((location) => {
      const geo = location.geolocation;
      const address = location.address;
      return {
        id: String(location.locationId),
        name: location.name || "Kroger grocery store",
        address: [address?.addressLine1, address?.city, address?.state, address?.zipCode].filter(Boolean).join(", "),
        latitude: numberValue(geo?.latitude ?? geo?.lat),
        longitude: numberValue(geo?.longitude ?? geo?.lon),
        distance: numberValue(location.distance)
      };
    });
    if (!stores.length) {
      res.status(200).json({ configured: true, source: "Kroger", stores: [], assignments: [], unmatched: items.map((item) => item.id), retrievedAt: new Date().toISOString(), message: "No Kroger locations were found within 25 miles of this ZIP code." });
      return;
    }

    if (locationsOnly) {
      res.status(200).json({
        configured: true,
        source: "Kroger",
        stores,
        assignments: [],
        unmatched: [],
        retrievedAt: new Date().toISOString(),
        message: "Nearby Kroger locations found. Add items to compare product prices."
      });
      return;
    }

    type ProductPayload = { data?: Array<{ productId?: string; description?: string; brand?: string; images?: Array<{ perspective?: string; sizes?: Array<{ size?: string; url?: string }> }>; items?: Array<{ price?: { regular?: number; promo?: number }; size?: string; itemId?: string }> }> };
    const jobs = stores.flatMap((store) => items.map((item) => ({ store, item })));
    const offers = (await mapLimit(jobs, 5, async ({ store, item }): Promise<Offer | null> => {
      const productUrl = new URL("https://api.kroger.com/v1/products");
      productUrl.searchParams.set("filter.term", item.term);
      productUrl.searchParams.set("filter.locationId", store.id);
      productUrl.searchParams.set("filter.limit", "5");
      try {
        const response = await fetch(productUrl, { headers: { Authorization: "Bearer " + token, Accept: "application/json" } });
        if (!response.ok) return null;
        const payload = await response.json() as ProductPayload;
        const products = payload.data || [];
        const product = products.find((candidate) => candidate.items?.some((entry) => typeof entry.price?.regular === "number"));
        const itemRecord = product?.items?.find((entry) => typeof entry.price?.regular === "number");
        if (!product || !itemRecord || typeof itemRecord.price?.regular !== "number") return null;
        return {
          ingredientId: item.id,
          query: item.term,
          name: product.description || item.term,
          brand: product.brand,
          price: itemRecord.price.regular,
          promoPrice: typeof itemRecord.price.promo === "number" && itemRecord.price.promo > 0 ? itemRecord.price.promo : null,
          size: itemRecord.size,
          productId: product.productId || itemRecord.itemId,
          imageUrl: product.images?.find((image) => image.perspective === "front")?.sizes?.find((image) => image.size === "medium")?.url || product.images?.find((image) => image.perspective === "front")?.sizes?.find((image) => image.size === "small")?.url || product.images?.[0]?.sizes?.find((image) => image.size === "medium")?.url || product.images?.[0]?.sizes?.find((image) => image.size === "small")?.url,
          source: "Kroger",
          store
        };
      } catch {
        return null;
      }
    })).filter((offer): offer is Offer => offer !== null);

    const storeScores = stores.map((store) => {
      const matching = offers.filter((offer) => offer.store.id === store.id);
      const bestByIngredient = new Map<string, Offer>();
      matching.forEach((offer) => {
        const old = bestByIngredient.get(offer.ingredientId);
        const currentPrice = offer.promoPrice && offer.promoPrice > 0 ? offer.promoPrice : offer.price;
        const oldPrice = old ? (old.promoPrice && old.promoPrice > 0 ? old.promoPrice : old.price) : Number.POSITIVE_INFINITY;
        if (currentPrice < oldPrice) bestByIngredient.set(offer.ingredientId, offer);
      });
      const estimatedTotal = Array.from(bestByIngredient.values()).reduce((sum, offer) => sum + (offer.promoPrice && offer.promoPrice > 0 ? offer.promoPrice : offer.price), 0);
      return { store, coverage: bestByIngredient.size, estimatedTotal };
    }).sort((a, b) => b.coverage - a.coverage || a.estimatedTotal - b.estimatedTotal);
    const primaryStoreId = storeScores[0]?.store.id;
    const assignments: Offer[] = [];
    const unmatched: string[] = [];
    items.forEach((item) => {
      const forItem = offers.filter((offer) => offer.ingredientId === item.id);
      if (!forItem.length) {
        unmatched.push(item.id);
        return;
      }
      const primary = forItem.find((offer) => offer.store.id === primaryStoreId);
      const chosen = primary || forItem.slice().sort((a, b) =>
        (a.promoPrice && a.promoPrice > 0 ? a.promoPrice : a.price) - (b.promoPrice && b.promoPrice > 0 ? b.promoPrice : b.price) ||
        (a.store.distance ?? Number.POSITIVE_INFINITY) - (b.store.distance ?? Number.POSITIVE_INFINITY)
      )[0];
      assignments.push(chosen);
    });

    res.status(200).json({
      configured: true,
      source: "Kroger",
      retrievedAt: new Date().toISOString(),
      stores,
      assignments,
      unmatched,
      searchedItems: items.length,
      limited: rawItems.length > 0 && (() => {
        try { return (JSON.parse(rawItems) as unknown[]).length > 24; } catch { return false; }
      })(),
      message: assignments.length
        ? (unmatched.length ? "Some products were not matched at nearby Kroger stores. Their basket rows keep the indicative estimate." : "")
        : "Kroger returned no priced matches for these searches. The basket retains indicative estimates."
    });
  } catch {
    res.status(502).json({ configured: true, error: "The live store search failed. Please try again; the local basket has been kept unchanged." });
  }
}