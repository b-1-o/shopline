import { ru } from "./ru";
import { en } from "./en";
import { readStored, writeStored } from "../lib/storage";

export type TranslationKey = keyof typeof ru;
export type Translations = Record<TranslationKey, string>;

const dicts: Record<string, Translations> = { ru: ru as Translations, en: en as Translations };

let currentLang: "ru" | "en" = (readStored<"ru" | "en">("lang", "ru") || "ru");

export function getLang(): "ru" | "en" {
  return currentLang;
}

export function setLang(lang: "ru" | "en") {
  currentLang = lang;
  writeStored("lang", lang);
  if (typeof document !== "undefined") {
    document.documentElement.lang = lang;
  }
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const dict = dicts[currentLang] || ru;
  let text: string = dict[key] ?? String(key);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\{${k}\}`, "g"), String(v));
    });
  }
  return text;
}
