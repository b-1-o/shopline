import { createRemoteJWKSet, jwtVerify } from "jose";

type ApiRequest = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
  body?: unknown;
};
type ApiResponse = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  end: () => void;
};
type SettingsRecord = {
  preferences: Record<string, unknown>;
  quizAnswers: Record<string, unknown>;
  updatedAt?: string;
};
type Auth0Config = { domain: string; issuer: string; audience: string };

const DIETS = ["all", "vegetarian", "vegan", "dairy-free", "high-protein", "pescatarian", "keto"];
const MODES = ["store", "pickup", "delivery"];
const GROUPS = ["food", "paper", "cleaning", "personal-care", "baby-pet"];
const ALLERGIES = ["dairy", "eggs", "gluten", "peanuts", "soy", "sesame"];
const MEALS = ["breakfast", "lunch", "dinner", "snack"];

let jwksIssuer = "";
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;
let managementToken = "";
let managementTokenExpiresAt = 0;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
function queryValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? String(value[0] || "") : String(value || "");
}
function authConfig(): Auth0Config | null {
  const rawDomain = (process.env.AUTH0_DOMAIN || "").trim();
  const domain = rawDomain.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
  const audience = (process.env.AUTH0_AUDIENCE || "").trim();
  if (!domain || !audience || !process.env.AUTH0_MANAGEMENT_CLIENT_ID || !process.env.AUTH0_MANAGEMENT_CLIENT_SECRET) return null;
  return { domain, issuer: "https://" + domain + "/", audience };
}
function getJwks(issuer: string) {
  if (!jwks || jwksIssuer !== issuer) {
    jwks = createRemoteJWKSet(new URL(".well-known/jwks.json", issuer));
    jwksIssuer = issuer;
  }
  return jwks;
}
function bearerToken(req: ApiRequest): string {
  const raw = queryValue(req.headers?.authorization ?? req.headers?.Authorization);
  const match = raw.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}
function safeStringList(value: unknown, allowed: string[], max: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && allowed.includes(item)))].slice(0, max);
}
function safeIds(value: unknown, max: number): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((item): item is string => typeof item === "string" && /^[a-z0-9][a-z0-9-]{0,79}$/i.test(item)))].slice(0, max);
}
function boundedNumber(value: unknown, fallback: number, min: number, max: number): number {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.round(number))) : fallback;
}
function allowedValue(value: unknown, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}
function normalizeSettings(value: unknown): SettingsRecord | null {
  if (!isRecord(value) || !isRecord(value.preferences) || !isRecord(value.quizAnswers)) return null;
  const p = value.preferences;
  const q = value.quizAnswers;
  const daysRaw = boundedNumber(p.days, 5, 3, 7);
  const days = ([3, 5, 7].includes(daysRaw) ? daysRaw : 5);
  const preferences = {
    zip: typeof p.zip === "string" && /^\d{5}$/.test(p.zip.trim()) ? p.zip.trim() : "",
    budget: boundedNumber(p.budget, 100, 25, 2000),
    days,
    servings: boundedNumber(p.servings, 2, 1, 12),
    diet: allowedValue(p.diet, DIETS, "all"),
    mode: allowedValue(p.mode, MODES, "store"),
  };
  const quizDaysRaw = boundedNumber(q.days, days, 3, 7);
  const quizAnswers = {
    zip: typeof q.zip === "string" && /^\d{5}$/.test(q.zip.trim()) ? q.zip.trim() : preferences.zip,
    budget: boundedNumber(q.budget, preferences.budget, 25, 2000),
    days: ([3, 5, 7].includes(quizDaysRaw) ? quizDaysRaw : days),
    servings: boundedNumber(q.servings, preferences.servings, 1, 12),
    diet: allowedValue(q.diet, DIETS, preferences.diet),
    mode: allowedValue(q.mode, MODES, preferences.mode),
    groups: safeStringList(q.groups, GROUPS, GROUPS.length),
    allergies: safeStringList(q.allergies, ALLERGIES, ALLERGIES.length),
    alreadyHave: safeIds(q.alreadyHave, 200),
    hasKids: q.hasKids === true,
    hasPets: q.hasPets === true,
    profileMode: allowedValue(q.profileMode, ["remember", "ask"], "ask"),
    meals: safeStringList(q.meals, MEALS, MEALS.length),
    maxCookMinutes: boundedNumber(q.maxCookMinutes, 45, 10, 180),
    excludedProducts: safeIds(q.excludedProducts, 200),
  };
  return { preferences, quizAnswers, updatedAt: new Date().toISOString() };
}
async function getManagementAccessToken(config: Auth0Config): Promise<string> {
  if (managementToken && Date.now() < managementTokenExpiresAt - 30_000) return managementToken;
  const response = await fetch(config.issuer + "oauth/token", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
      audience: config.issuer + "api/v2/",
      scope: "read:users update:users",
    }),
  });
  const data = await response.json() as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "Auth0 Management API access is not configured. Check the machine-to-machine grant and scopes.");
  }
  managementToken = data.access_token;
  managementTokenExpiresAt = Date.now() + Math.max(60, Number(data.expires_in) || 3600) * 1000;
  return managementToken;
}
async function readAuth0User(config: Auth0Config, sub: string): Promise<{ user_metadata?: Record<string, unknown> }> {
  const token = await getManagementAccessToken(config);
  const response = await fetch(config.issuer + "api/v2/users/" + encodeURIComponent(sub) + "?fields=user_metadata&include_fields=true", {
    headers: { authorization: "Bearer " + token },
  });
  if (!response.ok) throw new Error("Auth0 could not read this account's preferences.");
  return await response.json() as { user_metadata?: Record<string, unknown> };
}
async function writeAuth0UserMetadata(config: Auth0Config, sub: string, settings: SettingsRecord): Promise<void> {
  const user = await readAuth0User(config, sub);
  const token = await getManagementAccessToken(config);
  const userMetadata = { ...(user.user_metadata || {}), shoplineSettings: settings };
  const response = await fetch(config.issuer + "api/v2/users/" + encodeURIComponent(sub), {
    method: "PATCH",
    headers: { authorization: "Bearer " + token, "content-type": "application/json" },
    body: JSON.stringify({ user_metadata: userMetadata }),
  });
  if (!response.ok) throw new Error("Auth0 could not save this account's preferences.");
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Vary", "Authorization");
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    res.status(204).end();
    return;
  }
  if (req.method !== "GET" && req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const config = authConfig();
  if (!config) {
    res.status(503).json({ error: "Auth0 preference sync is not configured on the server yet." });
    return;
  }
  const token = bearerToken(req);
  if (!token) {
    res.status(401).json({ error: "Sign in to sync account preferences." });
    return;
  }

  let sub: string;
  try {
    const verified = await jwtVerify(token, getJwks(config.issuer), {
      issuer: config.issuer,
      audience: config.audience,
    });
    if (typeof verified.payload.sub !== "string" || !verified.payload.sub) {
      res.status(401).json({ error: "The access token does not identify a user." });
      return;
    }
    sub = verified.payload.sub;
  } catch {
    res.status(401).json({ error: "The session token is invalid or expired. Please sign in again." });
    return;
  }

  try {
    if (req.method === "GET") {
      const user = await readAuth0User(config, sub);
      const saved = user.user_metadata?.shoplineSettings;
      const settings = normalizeSettings(saved);
      res.status(200).json({ settings });
      return;
    }

    const body = isRecord(req.body) ? req.body : {};
    const settings = normalizeSettings(body.settings);
    if (!settings) {
      res.status(400).json({ error: "Valid preferences and quiz answers are required." });
      return;
    }
    await writeAuth0UserMetadata(config, sub, settings);
    res.status(200).json({ saved: true, updatedAt: settings.updatedAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sync account preferences.";
    res.status(502).json({ error: message });
  }
}
