import type { Preferences, QuizAnswers, PlanState } from "../types";

const PREFIX = "shopline.v2.";

export function readStored<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(PREFIX + key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // The app remains usable when storage is blocked or full.
  }
}

export function getAnonymousSessionId(): string {
  const key = PREFIX + "session-id";
  try {
    const current = localStorage.getItem(key);
    if (current) return current;
    const created =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(key, created);
    return created;
  } catch {
    return "anonymous-local-session";
  }
}

export const DEFAULT_PREFERENCES: Preferences = {
  zip: "",
  budget: 100,
  days: 5,
  servings: 2,
  diet: "all",
  mode: "store",
};

export const DEFAULT_QUIZ_ANSWERS: QuizAnswers = {
  zip: "",
  budget: 100,
  days: 5,
  servings: 2,
  diet: "all",
  mode: "store",
  groups: ["food"],
  allergies: [],
  alreadyHave: [],
  hasKids: false,
  hasPets: false,
  profileMode: "ask",
  meals: ["breakfast", "lunch", "dinner"],
  maxCookMinutes: 45,
  excludedProducts: [],
};

export function savePlanHistory(plan: PlanState) {
  const history = readStored<PlanState[]>("plan-history", []);
  const next = [plan, ...history.filter((p) => p.createdAt !== plan.createdAt)].slice(0, 10);
  writeStored("plan-history", next);
}

export function getPlanHistory(): PlanState[] {
  return readStored<PlanState[]>("plan-history", []);
}
