import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { Language } from "@/lib/translations";
import { Globe, ChevronDown } from "lucide-react";

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
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLang = languages.find((l) => l.code === lang);

  const switchTo = (code: Language) => {
    if (code === lang) {
      setOpen(false);
      return;
    }
    const browserPath = window.location.pathname;
    const basePath = stripLangPrefix(browserPath);
    const newPath = code === "pt" ? basePath : `/${code}${basePath}`;
    window.location.href = newPath;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-[#2f3252] border border-[#2f3252]"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang?.label}</span>
        <ChevronDown
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-32 bg-[#242642] border border-[#2f3252] rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => switchTo(l.code)}
              className={`w-full text-left px-4 py-2.5 text-xs font-bold transition-colors flex items-center gap-2 ${
                lang === l.code
                  ? "bg-purple-600 text-white"
                  : "text-slate-400 hover:text-white hover:bg-[#2f3252]"
              }`}
            >
              {l.label}
              {lang === l.code && (
                <span className="ml-auto text-[10px]">&#10003;</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
