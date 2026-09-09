import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { content } from "./content";
import type { Locale } from "./content";

const STORAGE_KEY = "bora-de-xracing-language";
function initialLocale(): Locale {
  const requested = new URLSearchParams(window.location.search).get("lang");
  if (requested === "en" || requested === "pt-BR") return requested;
  try {
    if (localStorage.getItem(STORAGE_KEY) === "en") return "en";
  } catch {
    /* Language selection also works without browser storage. */
  }
  return "pt-BR";
}

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (typeof content)[Locale];
} | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = content[locale];
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t.metaTitle;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", t.metaDescription);
    for (const property of ["og:title", "twitter:title"]) {
      document
        .querySelector(`meta[property="${property}"]`)
        ?.setAttribute("content", t.metaTitle);
    }
    for (const property of ["og:description", "twitter:description"]) {
      document
        .querySelector(`meta[property="${property}"]`)
        ?.setAttribute("content", t.metaDescription);
    }
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", locale === "en" ? "en_US" : "pt_BR");
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* Optional persistence. */
    }
  }, [locale, t]);

  function changeLocale(next: Locale) {
    setLocale(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url);
  }
  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires LanguageProvider");
  return value;
}
