"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import { Sparkles, Menu, X, Compass } from "lucide-react";

export default function Navbar() {
  const t = useTranslations("nav");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/60 bg-cosmic-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Mystic Celestial Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-mystic-purple to-celestial-gold p-[1px] shadow-lg shadow-mystic-purple/20">
            <div className="w-full h-full bg-cosmic-950 rounded-[7px] flex items-center justify-center group-hover:bg-cosmic-900 transition-colors">
              <Compass className="w-5 h-5 text-celestial-gold animate-[spin_12s_linear_infinite]" />
            </div>
          </div>
          <div>
            <span className="font-serif tracking-wider font-bold text-lg bg-gradient-to-r from-slate-100 via-celestial-light to-celestial-gold bg-clip-text text-transparent">
              {t("title")}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-mystic-cyan/80 ml-2 uppercase tracking-widest font-mono">
              Vedic Engine
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="#features" className="hover:text-celestial-gold transition-colors">
            {t("features")}
          </Link>
          <Link href="#about" className="hover:text-celestial-gold transition-colors">
            {t("about")}
          </Link>
          <Link 
            href="#generate"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-mystic-purple/30 to-amber-500/20 border border-celestial-gold/40 text-celestial-gold hover:border-celestial-gold hover:shadow-lg hover:shadow-celestial-gold/10 transition-all text-xs font-semibold uppercase tracking-wider"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t("generate")}
          </Link>
        </nav>

        {/* Right Action: Language Switcher & Mobile Menu Trigger */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-slate-900/60 border border-slate-700/60 text-slate-300 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-cosmic-950/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-3">
          <Link
            href="#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            {t("features")}
          </Link>
          <Link
            href="#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            {t("about")}
          </Link>
          <Link
            href="#generate"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-center px-4 py-2 rounded-lg bg-gradient-to-r from-mystic-purple to-celestial-amber text-black font-semibold text-sm shadow-md"
          >
            {t("generate")}
          </Link>
        </div>
      )}
    </header>
  );
}
