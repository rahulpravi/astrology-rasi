"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { useTransition, useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "ml", name: "Malayalam", native: "മലയാളം" },
  { code: "ta", name: "Tamil", native: "தமிழ்" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
];

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeLang = languages.find((lang) => lang.code === currentLocale) || languages[0];

  const handleSelect = (code: string) => {
    setIsOpen(false);
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cosmic-900/70 border border-slate-700/60 hover:border-celestial-gold/50 backdrop-blur-md text-xs sm:text-sm font-medium text-slate-200 hover:text-white transition-all duration-200 shadow-sm"
        aria-label="Change Language"
      >
        <Globe className="w-3.5 h-3.5 text-celestial-gold" />
        <span>{activeLang.native}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl bg-cosmic-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
          {languages.map((lang) => {
            const isSelected = lang.code === currentLocale;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm transition-colors text-left ${
                  isSelected
                    ? "bg-mystic-purple/20 text-celestial-gold font-medium"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                }`}
              >
                <div>
                  <div className="font-sans">{lang.native}</div>
                  <div className="text-[10px] text-slate-400">{lang.name}</div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-celestial-gold" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
