import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/lib/translations";
import { Globe } from "lucide-react";

/**
 * Strips the language prefix (/en or /es) from a browser path.
 */
function stripLangPrefix(path: string): string {
  const match = path.match(/^\/(en|es)(\/.*)?$/);
  if (match) return match[2] || "/";
  return path;
}

export function LanguageSwitcher() {
  const { lang, languages } = useLanguage();

  const switchTo = (code: Language) => {
    if (code === lang) return;
    // Always read the real browser path to avoid wouter nest-relative issues
    const browserPath = window.location.pathname;
    const basePath = stripLangPrefix(browserPath);
    const newPath = code === "pt" ? basePath : `/${code}${basePath}`;
    // Use full page navigation to ensure clean URL
    window.location.href = newPath;
  };

  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-slate-400" />
      {languages.map((l) => (
        <button
          key={l.code}
          onClick={() => switchTo(l.code)}
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            lang === l.code
              ? "bg-purple-600 text-white"
              : "text-slate-400 hover:text-white hover:bg-[#2f3252]"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
