import { createContext } from "react";
import { content } from "./content";
import type { Locale } from "./content";

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof content)[Locale];
}

export const LanguageContext = createContext<LanguageContextValue | null>(null);
