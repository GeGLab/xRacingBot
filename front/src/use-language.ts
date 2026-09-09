import { useContext } from "react";
import { LanguageContext } from "./language-context";

export function useLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useLanguage requires LanguageProvider");
  return value;
}
