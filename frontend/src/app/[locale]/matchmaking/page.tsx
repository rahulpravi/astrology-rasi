"use client";

import React, { useState, useEffect } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations, useLocale } from "next-intl";
import {
  Heart,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Compass,
  Moon,
  Sun,
  ShieldCheck,
  Scale,
  Users,
  Printer,
  ChevronRight,
  Flame,
  Star,
  Info,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import LocationAutocomplete from "@/components/LocationAutocomplete";
import TimeInput12Hour from "@/components/TimeInput12Hour";
import {
  calculateMatchmaking,
  MatchData,
  PersonBirthDetails,
  PoruthamItem,
} from "@/lib/api";
import { useAstrologyStore, MatchPersonData } from "@/store/useAstrologyStore";
import { useAstroTranslation } from "@/lib/translations";

const SAMPLE_BOY: MatchPersonData = {
  name: "Arjun Raman",
  dob: "1995-05-14",
  tob: "07:30",
  pob: "Chennai, Tamil Nadu, India",
  latitude: 13.0827,
  longitude: 80.2707,
};

const SAMPLE_GIRL: MatchPersonData = {
  name: "Kavya Menon",
  dob: "1997-08-22",
  tob: "10:15",
  pob: "Kozhikode, Kerala, India",
  latitude: 11.2588,
  longitude: 75.7804,
};

export default function MatchmakingPage() {
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();

  // Zustand persistent store bindings - prevents state loss on language switch
  const boy = useAstrologyStore((state) => state.matchBoy);
  const setBoy = useAstrologyStore((state) => state.setMatchBoy);
  const girl = useAstrologyStore((state) => state.matchGirl);
  const setGirl = useAstrologyStore((state) => state.setMatchGirl);
  const matchResult = useAstrologyStore((state) => state.matchResult);
  const setMatchResult = useAstrologyStore((state) => state.setMatchResult);
  const isLoading = useAstrologyStore((state) => state.matchLoading);
  const setIsLoading = useAstrologyStore((state) => state.setMatchLoading);
  const errorMessage = useAstrologyStore((state) => state.matchError);
  const setErrorMessage = useAstrologyStore((state) => state.setMatchError);
  const poruthamFilter = useAstrologyStore((state) => state.poruthamFilter);
  const setPoruthamFilter = useAstrologyStore((state) => state.setPoruthamFilter);
  const resetMatchmaking = useAstrologyStore((state) => state.resetMatchmaking);

  // Deep Translations for Astrological Terms
  const {
    translatePlanet,
    translateSign,
    translateNakshatra,
    translateGana,
    translateRajju,
    translateLord,
  } = useAstroTranslation();

  const tMatch = useTranslations("matchmaking_page");
  const tNav = useTranslations("nav");
  const tUI = useTranslations("astrology.ui");
  const tForm = useTranslations("form_preview");

  useEffect(() => {
    setMounted(true);
    document.title = tMatch("page_title");
  }, [tMatch]);

  const handleQuickSample = () => {
    setBoy(SAMPLE_BOY);
    setGirl(SAMPLE_GIRL);
    setErrorMessage(null);
  };

  const handleReset = () => {
    resetMatchmaking();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!boy.dob) {
      setErrorMessage(tMatch("error_boy_dob"));
      return;
    }
    if (!girl.dob) {
      setErrorMessage(tMatch("error_girl_dob"));
      return;
    }

    setIsLoading(true);

    try {
      const data = await calculateMatchmaking({
        boy: {
          name: boy.name.trim() || "Boy",
          dob: boy.dob,
          tob: boy.tob || "07:30",
          pob: boy.pob.trim() || "Chennai",
          latitude: boy.latitude,
          longitude: boy.longitude,
        },
        girl: {
          name: girl.name.trim() || "Girl",
          dob: girl.dob,
          tob: girl.tob || "10:15",
          pob: girl.pob.trim() || "Kozhikode",
          latitude: girl.latitude,
          longitude: girl.longitude,
        },
      });

      // Persist in Zustand so language switching doesn't lose the result
      setMatchResult(data);

      setTimeout(() => {
        const resultsEl = document.getElementById("match-results-section");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to calculate Vedic matchmaking. Please verify the birth details and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPoruthams = matchResult?.poruthams.filter((item) => {
    if (poruthamFilter === "match") return item.status === "Match";
    if (poruthamFilter === "no_match") return item.status !== "Match";
    return true;
  });

  const matchedCount = matchResult?.poruthams.filter((p) => p.status === "Match").length ?? 0;
  const isRajjuMatched = matchResult?.poruthams.find((p) => p.id === "rajju")?.status === "Match";

  const boyPobPlaceholder =
    locale === "ml"
      ? "ഉദാ: ചെന്നൈ, മധുര, ദില്ലി"
      : locale === "ta"
      ? "எ.கா: சென்னை, மதுரை, புது தில்லி"
      : locale === "hi"
      ? "उदा: चेन्नई, मदुरै, नई दिल्ली"
      : "e.g. Chennai, Madurai, or New Delhi";

  const girlPobPlaceholder =
    locale === "ml"
      ? "ഉദാ: കോഴിക്കോട്, കൊച്ചി, ബംഗളൂരു"
      : locale === "ta"
      ? "எ.கா: கோழிக்கோடு, கொச்சி, பெங்களூரு"
      : locale === "hi"
      ? "उदा: कोझिकोड, कोच्चि, बेंगलुरु"
      : "e.g. Kozhikode, Kochi, or Bengaluru";

  // Prevent SSR hydration mismatch for persisted localStorage states
  if (!mounted) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-celestial-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative isolate px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-10 lg:py-14">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/10 backdrop-blur-md mb-4 shadow-sm">
          <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400/40 animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-pink-300 font-mono">
            {tMatch("badge")}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
          {tMatch("headline")}
        </h1>

        <p className="mt-4 text-base sm:text-lg text-slate-300 font-light leading-relaxed">
          {tMatch("subheadline")}
        </p>

        {/* Quick Sample Button */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleQuickSample}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-cosmic-900/80 border border-slate-700/80 hover:border-celestial-gold text-slate-300 hover:text-celestial-gold text-xs font-medium transition-all cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-celestial-gold" />
            <span>{tMatch("load_sample")}</span>
          </button>
          {matchResult && (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cosmic-900/80 border border-slate-700/80 hover:border-red-400 text-slate-400 hover:text-red-300 text-xs font-medium transition-all cursor-pointer shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{tMatch("reset")}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-xl bg-red-950/70 border border-red-800/80 text-red-200 text-sm flex items-start gap-3 animate-in fade-in duration-200 shadow-xl">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-red-300">{tMatch("calc_error_title")}</h4>
            <p className="mt-0.5 text-xs text-red-200/90 leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Dual Form Section */}
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ================= Boy's Details Card ================= */}
          <div className="relative rounded-2xl bg-gradient-to-b from-cosmic-900/70 via-cosmic-950/90 to-cosmic-950/90 border border-indigo-500/30 backdrop-blur-xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950 border border-indigo-500/50 text-indigo-300 text-xs font-semibold tracking-wider uppercase shadow-md">
              <Sun className="w-3.5 h-3.5 text-indigo-400" />
              <span>{tMatch("boy_badge")}</span>
            </div>

            <div className="space-y-4 pt-3">
              {/* Boy's Full Name */}
              <div>
                <label
                  htmlFor="boy-name"
                  className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                >
                  {tForm("name")}
                </label>
                <input
                  id="boy-name"
                  type="text"
                  value={boy.name}
                  onChange={(e) => setBoy({ name: e.target.value })}
                  placeholder="e.g. Arjun Raman"
                  className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/90 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              {/* DOB & TOB Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="boy-dob"
                    className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                  >
                    {tForm("dob")} <span className="text-celestial-gold">*</span>
                  </label>
                  <input
                    id="boy-dob"
                    type="date"
                    required
                    value={boy.dob}
                    onChange={(e) => setBoy({ dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/90 border border-slate-700 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none text-sm text-white transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="boy-tob"
                    className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                  >
                    {tForm("tob")} <span className="text-celestial-gold">*</span>
                  </label>
                  <TimeInput12Hour
                    id="boy-tob"
                    value={boy.tob}
                    onChange={(tob) => setBoy({ tob })}
                  />
                </div>
              </div>

              {/* Boy's Place of Birth */}
              <div>
                <label
                  htmlFor="boy-pob"
                  className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                >
                  {tForm("pob")}
                </label>
                <LocationAutocomplete
                  id="boy-pob"
                  value={boy.pob}
                  onChange={(pob, coords) =>
                    setBoy({
                      pob,
                      latitude: coords?.lat,
                      longitude: coords?.lon,
                    })
                  }
                  placeholder={boyPobPlaceholder}
                />
                <span className="block mt-1 text-[11px] text-slate-500">
                  {tMatch("city_hint")}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-indigo-300/80 font-mono">
              <span>{tMatch("boy_chart_label")}</span>
              <span>{tMatch("primary_node")}</span>
            </div>
          </div>

          {/* ================= Girl's Details Card ================= */}
          <div className="relative rounded-2xl bg-gradient-to-b from-cosmic-900/70 via-cosmic-950/90 to-cosmic-950/90 border border-pink-500/30 backdrop-blur-xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-950 border border-pink-500/50 text-pink-300 text-xs font-semibold tracking-wider uppercase shadow-md">
              <Moon className="w-3.5 h-3.5 text-pink-400" />
              <span>{tMatch("girl_badge")}</span>
            </div>

            <div className="space-y-4 pt-3">
              {/* Girl's Full Name */}
              <div>
                <label
                  htmlFor="girl-name"
                  className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                >
                  {tForm("name")}
                </label>
                <input
                  id="girl-name"
                  type="text"
                  value={girl.name}
                  onChange={(e) => setGirl({ name: e.target.value })}
                  placeholder="e.g. Kavya Menon"
                  className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/90 border border-slate-700 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none text-sm text-white placeholder-slate-500 transition-colors"
                />
              </div>

              {/* DOB & TOB Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="girl-dob"
                    className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                  >
                    {tForm("dob")} <span className="text-celestial-gold">*</span>
                  </label>
                  <input
                    id="girl-dob"
                    type="date"
                    required
                    value={girl.dob}
                    onChange={(e) => setGirl({ dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/90 border border-slate-700 focus:border-pink-400 focus:ring-1 focus:ring-pink-400 outline-none text-sm text-white transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="girl-tob"
                    className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                  >
                    {tForm("tob")} <span className="text-celestial-gold">*</span>
                  </label>
                  <TimeInput12Hour
                    id="girl-tob"
                    value={girl.tob}
                    onChange={(tob) => setGirl({ tob })}
                  />
                </div>
              </div>

              {/* Girl's Place of Birth */}
              <div>
                <label
                  htmlFor="girl-pob"
                  className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5"
                >
                  {tForm("pob")}
                </label>
                <LocationAutocomplete
                  id="girl-pob"
                  value={girl.pob}
                  onChange={(pob, coords) =>
                    setGirl({
                      pob,
                      latitude: coords?.lat,
                      longitude: coords?.lon,
                    })
                  }
                  placeholder={girlPobPlaceholder}
                />
                <span className="block mt-1 text-[11px] text-slate-500">
                  {tMatch("city_hint")}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-pink-300/80 font-mono">
              <span>{tMatch("girl_chart_label")}</span>
              <span>{tMatch("reflected_node")}</span>
            </div>
          </div>
        </div>

        {/* Calculate Match CTA */}
        <div className="mt-8 text-center">
          <button
            type="submit"
            id="calculate-match-btn"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-mystic-purple via-pink-600 to-celestial-amber hover:from-mystic-purple hover:to-celestial-gold text-white font-bold text-base tracking-wide shadow-xl shadow-mystic-purple/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 text-celestial-gold animate-spin" />
                <span>{tMatch("evaluating")}</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5 text-pink-200 fill-pink-200/50" />
                <span>{tMatch("calculate_btn")}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* ================= Results Section ================= */}
      {matchResult && (
        <div id="match-results-section" className="mt-16 scroll-mt-24 space-y-10">
          {/* Main Visual Scorecard Card */}
          <div className="rounded-3xl bg-gradient-to-b from-cosmic-900/90 via-cosmic-950/90 to-cosmic-950/95 border border-slate-700/80 backdrop-blur-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-mystic-purple/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-celestial-gold/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-celestial-gold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{tMatch("verdict_badge")}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                    {tMatch("scorecard_title")}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cosmic-950 border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tUI("download_pdf")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cosmic-950 border border-slate-700 hover:border-celestial-gold text-slate-300 hover:text-celestial-gold text-xs font-medium transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{tUI("generate_another")}</span>
                  </button>
                </div>
              </div>

              {/* Scorecard Hero: Gauge + Verdict Banner */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-8">
                {/* Radial Meter / Visual Score (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-cosmic-950/70 border border-slate-800 shadow-inner">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    {/* SVG Radial Meter */}
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        className="stroke-slate-800"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke={
                          matchResult.verdict === "Uthamam"
                            ? "#10b981"
                            : matchResult.verdict === "Madhyamam"
                            ? "#f59e0b"
                            : "#f43f5e"
                        }
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * matchResult.score) / 10}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>

                    {/* Centered Big Score */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-4xl font-serif font-black text-white tracking-tight">
                        {matchResult.score.toFixed(1)}
                        <span className="text-xl text-slate-400 font-sans font-normal"> / 10</span>
                      </span>
                      <span className="text-xs font-mono uppercase tracking-wider text-celestial-gold font-semibold mt-0.5">
                        {matchResult.percentage}% {tMatch("compatible")}
                      </span>
                    </div>
                  </div>

                  {/* Porutham count pill */}
                  <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>
                      <strong>{matchedCount}</strong> / <strong>10</strong> {tMatch("matches_count")}
                    </span>
                  </div>
                </div>

                {/* Classical Verdict Details & Rajju Focus (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Verdict Badge */}
                  <div
                    className={`p-5 rounded-2xl border backdrop-blur-md ${
                      matchResult.verdict === "Uthamam"
                        ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-100"
                        : matchResult.verdict === "Madhyamam"
                        ? "bg-amber-950/40 border-amber-500/40 text-amber-100"
                        : "bg-rose-950/40 border-rose-500/40 text-rose-100"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {matchResult.verdict === "Uthamam" ? (
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      ) : matchResult.verdict === "Madhyamam" ? (
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                          <XCircle className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest opacity-80">
                          {tMatch("verdict_badge")}
                        </span>
                        <h3 className="text-xl font-bold tracking-tight">
                          {matchResult.verdict_label}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed opacity-90 pl-11">
                      {matchResult.summary}
                    </p>
                  </div>

                  {/* Cardinal Rajju Porutham Callout */}
                  <div
                    className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                      isRajjuMatched
                        ? "bg-slate-900/60 border-emerald-500/30 text-emerald-200"
                        : "bg-red-950/50 border-red-500/50 text-red-200"
                    }`}
                  >
                    <ShieldCheck
                      className={`w-5 h-5 shrink-0 mt-0.5 ${
                        isRajjuMatched ? "text-emerald-400" : "text-red-400"
                      }`}
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-sm">
                          {tMatch("rajju_label")}
                        </strong>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            isRajjuMatched
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border border-red-500/40"
                          }`}
                        >
                          {isRajjuMatched ? tMatch("rajju_satisfied") : tMatch("rajju_dosha")}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-300 leading-relaxed">
                        {isRajjuMatched ? tMatch("rajju_desc_satisfied") : tMatch("rajju_desc_dosha")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-side Moon & Nakshatra Profile Snapshot with Deep Translations */}
              <div className="mt-8 pt-8 border-t border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <Compass className="w-4 h-4 text-celestial-gold" />
                  <h4 className="text-sm font-serif font-semibold text-slate-200 uppercase tracking-wider">
                    {tMatch("comparison_title")}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Boy's Celestial Snapshot */}
                  <div className="p-4 rounded-xl bg-cosmic-950/80 border border-indigo-500/30">
                    <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Sun className="w-4 h-4 text-indigo-400" />
                        <span className="font-semibold text-white text-sm">
                          {boy.name || matchResult.boy.name} ({tMatch("groom")})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-indigo-300 uppercase">
                        {translateSign(matchResult.boy.rasi_english || matchResult.boy.rasi)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400">{tUI("moon_card")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateSign(matchResult.boy.rasi_english || matchResult.boy.rasi)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("rasi_lord")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateLord(matchResult.boy.lord)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tUI("nakshatra_card")}:</span>{" "}
                        <strong className="text-celestial-gold">
                          {translateNakshatra(matchResult.boy.nakshatra)} ({tUI("pada")} {matchResult.boy.pada})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("gana")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateGana(matchResult.boy.gana)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("yoni")}:</span>{" "}
                        <strong className="text-slate-100">
                          {matchResult.boy.yoni_animal} ({matchResult.boy.yoni_gender})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("rajju")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateRajju(matchResult.boy.rajju)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Girl's Celestial Snapshot */}
                  <div className="p-4 rounded-xl bg-cosmic-950/80 border border-pink-500/30">
                    <div className="flex items-center justify-between border-b border-pink-500/20 pb-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-pink-400" />
                        <span className="font-semibold text-white text-sm">
                          {girl.name || matchResult.girl.name} ({tMatch("bride")})
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-pink-300 uppercase">
                        {translateSign(matchResult.girl.rasi_english || matchResult.girl.rasi)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                      <div>
                        <span className="text-slate-400">{tUI("moon_card")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateSign(matchResult.girl.rasi_english || matchResult.girl.rasi)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("rasi_lord")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateLord(matchResult.girl.lord)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tUI("nakshatra_card")}:</span>{" "}
                        <strong className="text-celestial-gold">
                          {translateNakshatra(matchResult.girl.nakshatra)} ({tUI("pada")} {matchResult.girl.pada})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("gana")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateGana(matchResult.girl.gana)}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("yoni")}:</span>{" "}
                        <strong className="text-slate-100">
                          {matchResult.girl.yoni_animal} ({matchResult.girl.yoni_gender})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">{tMatch("rajju")}:</span>{" "}
                        <strong className="text-slate-100">
                          {translateRajju(matchResult.girl.rajju)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= Detailed 10 Poruthams Breakdown ================= */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-white">
                  {tMatch("breakdown_title")}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  {tMatch("breakdown_subtitle")}
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cosmic-900 border border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setPoruthamFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    poruthamFilter === "all"
                      ? "bg-slate-800 text-celestial-gold shadow-sm font-semibold"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {tMatch("filter_all")}
                </button>
                <button
                  type="button"
                  onClick={() => setPoruthamFilter("match")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    poruthamFilter === "match"
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-semibold"
                      : "text-slate-400 hover:text-emerald-300"
                  }`}
                >
                  {tMatch("filter_matched")} ({matchedCount})
                </button>
                <button
                  type="button"
                  onClick={() => setPoruthamFilter("no_match")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    poruthamFilter === "no_match"
                      ? "bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold"
                      : "text-slate-400 hover:text-rose-300"
                  }`}
                >
                  {tMatch("filter_unmatched")} ({10 - matchedCount})
                </button>
              </div>
            </div>

            {/* Porutham Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPoruthams?.map((p) => {
                const isMatched = p.status === "Match";
                const isRajju = p.id === "rajju";

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-5 border backdrop-blur-md transition-all duration-200 hover:shadow-lg ${
                      isRajju
                        ? isMatched
                          ? "bg-emerald-950/20 border-emerald-500/50 shadow-emerald-500/10"
                          : "bg-rose-950/25 border-rose-500/60 shadow-rose-500/10"
                        : isMatched
                        ? "bg-cosmic-900/60 border-slate-700/80 hover:border-emerald-500/40"
                        : "bg-cosmic-950/80 border-slate-800/80 hover:border-rose-500/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isMatched
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-slate-800/80 text-slate-500"
                          }`}
                        >
                          {isMatched ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-rose-400/80" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold text-white">
                              {p.name} {tMatch("porutham_suffix")}
                            </h4>
                            {isRajju && (
                              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-celestial-gold border border-amber-500/40">
                                {tMatch("cardinal")}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{p.sanskrit_name}</span>
                        </div>
                      </div>

                      {/* Status & Score Pill */}
                      <div className="flex flex-col items-end shrink-0">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase ${
                            isMatched
                              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {isMatched ? tMatch("match_status") : tMatch("no_match_status")}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 mt-1">
                          {tMatch("score_label")}: {p.score.toFixed(1)} / {p.max_score.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Meaning Badge */}
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cosmic-950/70 text-[11px] font-medium text-celestial-gold border border-slate-800">
                      <Sparkles className="w-3 h-3 text-celestial-gold/80" />
                      <span>{p.meaning}</span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-xs text-slate-300 leading-relaxed font-light">
                      {p.description}
                    </p>

                    {/* Calculation Details */}
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-xs font-mono text-slate-400">
                      <Info className="w-3.5 h-3.5 text-mystic-cyan shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-tight">{p.details}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="p-8 rounded-2xl bg-cosmic-900/40 border border-slate-800 text-center space-y-4">
            <h4 className="text-lg font-serif font-bold text-white">
              {tMatch("footer_title")}
            </h4>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              {tMatch("footer_desc")}
            </p>
            <div className="pt-2">
              <Link
                href="/#generate"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cosmic-950 border border-celestial-gold/40 text-celestial-gold hover:border-celestial-gold hover:bg-slate-900 transition-colors text-xs font-semibold uppercase tracking-wider shadow-md"
              >
                <Compass className="w-4 h-4 text-celestial-gold" />
                <span>{tMatch("open_kundali_btn")}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
