import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useLocation } from "wouter";
import { type Language, getTranslation } from "@/lib/translations";

interface LanguageContextValue {
  lang: Language;
  t: (path: string, defaultValue?: string) => string;
  /** Returns an absolute path prefixed with the language segment (no prefix for pt) */
  langPath: (path: string) => string;
  /** All available languages */
  languages: { code: Language; label: string }[];
}

const LANGUAGES: { code: Language; label: string }[] = [
  { code: "pt", label: "PT-BR" },
  { code: "en", label: "EN" },
  { code: "es", label: "ESP" },
];

const LanguageContext = createContext<LanguageContextValue | null>(null);

/** Detect language from the real browser URL */
function detectLanguage(): Language {
  const segments = window.location.pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first === "en" || first === "es") return first;
  return "pt";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Subscribe to wouter location changes so we re-render on navigation
  const [location] = useLocation();

  // Detect from the real browser path (not wouter's potentially relative path)
  const lang = detectLanguage();

  const value = useMemo<LanguageContextValue>(() => {
    const t = (path: string, defaultValue?: string): string => {
      const result = getTranslation(lang, path);
      return result !== path ? result : defaultValue ?? path;
    };

    const langPath = (path: string): string => {
      if (lang === "pt") return path;
      return `/${lang}${path}`;
    };

    return { lang, t, langPath, languages: LANGUAGES };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
