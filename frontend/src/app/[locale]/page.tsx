"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Moon,
  Star,
  Compass,
  ArrowRight,
  Loader2,
  AlertCircle,
  History,
  Trash2,
  X,
} from "lucide-react";
import { calculateRasiChart } from "@/lib/api";
import { useAstrologyStore } from "@/store/useAstrologyStore";
import ChartDisplay from "@/components/ChartDisplay";
import RasiChartTeaser from "@/components/RasiChartTeaser";
import TimeInput12Hour from "@/components/TimeInput12Hour";
import LocationAutocomplete from "@/components/LocationAutocomplete";

export default function HomePage() {
  const tHero = useTranslations("hero");
  const tForm = useTranslations("form_preview");
  const tUI = useTranslations("astrology.ui");

  // Read and mutate global persisted state from Zustand
  const formData = useAstrologyStore((state) => state.formData);
  const setFormData = useAstrologyStore((state) => state.setFormData);
  const recentProfiles = useAstrologyStore((state) => state.recentProfiles);
  const addRecentProfile = useAstrologyStore((state) => state.addRecentProfile);
  const removeRecentProfile = useAstrologyStore((state) => state.removeRecentProfile);
  const clearRecentProfiles = useAstrologyStore((state) => state.clearRecentProfiles);
  const loadProfile = useAstrologyStore((state) => state.loadProfile);
  const chartData = useAstrologyStore((state) => state.chartData);
  const setChartData = useAstrologyStore((state) => state.setChartData);
  const isLoading = useAstrologyStore((state) => state.isLoading);
  const setIsLoading = useAstrologyStore((state) => state.setIsLoading);
  const errorMessage = useAstrologyStore((state) => state.errorMessage);
  const setErrorMessage = useAstrologyStore((state) => state.setErrorMessage);
  const reset = useAstrologyStore((state) => state.reset);

  // Handle Form Inputs for standard text/date fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ [name]: value });
  };

  // Submit Handler calling the FastAPI backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const tob = formData.tob || "06:30";

    // Form validation
    if (!formData.dob) {
      setErrorMessage("Please specify the Date of Birth.");
      return;
    }

    setIsLoading(true);

    const seekerName = formData.name.trim() || "Seeker";
    const seekerPob = formData.pob.trim() || "Chennai";

    try {
      const data = await calculateRasiChart({
        name: seekerName,
        dob: formData.dob,
        tob: tob,
        pob: seekerPob,
      });

      // Persist calculated chart in Zustand
      setChartData(data);

      // Save to Recent Profiles cache (persisted in localStorage via Zustand)
      addRecentProfile({
        name: seekerName,
        dob: formData.dob,
        tob: tob,
        pob: seekerPob,
      });

      // Smoothly scroll to the chart results
      setTimeout(() => {
        const resultsEl = document.getElementById("chart-results");
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to calculate Rasi Chart. Please check your details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 lg:py-16">
      
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-celestial-gold/30 bg-celestial-gold/5 backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-celestial-gold animate-pulse" />
          <span className="text-xs uppercase tracking-widest text-celestial-gold font-mono">
            {tHero("badge")}
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
          {tHero("headline")}
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-light">
          {tHero("subheadline")}
        </p>

        {!chartData && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#generate"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-celestial-amber via-celestial-gold to-yellow-200 text-cosmic-950 font-bold text-sm tracking-wide shadow-lg shadow-celestial-amber/20 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <span>{tHero("cta_primary")}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#features"
              className="px-6 py-3.5 rounded-xl bg-cosmic-900/60 border border-slate-700/80 hover:border-slate-500 text-slate-200 font-medium text-sm transition-colors flex items-center justify-center"
            >
              {tHero("cta_secondary")}
            </a>
          </div>
        )}
      </div>

      {/* Main Dynamic View Area */}
      <div id="generate" className="mt-14 lg:mt-20 scroll-mt-20">
        {chartData ? (
          // Display Chart and Planetary Data (Persisted across language changes)
          <div id="chart-results">
            <ChartDisplay data={chartData} onReset={reset} />
          </div>
        ) : (
          // Interactive Form & Sacred Geometry Teaser Grid
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Form Card (Glassmorphic) */}
            <div className="lg:col-span-6 rounded-2xl bg-cosmic-900/40 border border-slate-700/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-5">
                <Compass className="w-5 h-5 text-celestial-gold" />
                <h2 className="text-xl font-serif font-semibold text-slate-100">
                  {tForm("title")}
                </h2>
              </div>

              {/* Recent Profiles (Zustand Cache Memory) */}
              {recentProfiles.length > 0 && (
                <div className="mb-5 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-celestial-gold">
                      <History className="w-3.5 h-3.5" />
                      <span>{tForm("recent_profiles")}</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearRecentProfiles}
                      className="text-[11px] text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Clear all recent profiles"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{tForm("clear_recent")}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 no-scrollbar">
                    {recentProfiles.map((p) => (
                      <div
                        key={p.id}
                        className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-950/70 hover:bg-slate-800/80 border border-slate-700/80 hover:border-celestial-gold/60 transition-all shrink-0 cursor-pointer shadow-sm"
                        onClick={() => loadProfile(p)}
                        title={`Click to auto-fill: ${p.name} (${p.dob}, ${p.tob}, ${p.pob})`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="text-xs font-medium text-slate-100 group-hover:text-celestial-gold transition-colors leading-tight truncate max-w-[120px]">
                            {p.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono leading-tight">
                            {p.pob} • {p.dob}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentProfile(p.id);
                          }}
                          className="p-1 rounded-full text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Remove from history"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Alert Banner */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{errorMessage}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="name-input" className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {tForm("name")}
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Arjun Raman"
                    className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/80 border border-slate-700 focus:border-celestial-gold focus:ring-1 focus:ring-celestial-gold outline-none text-sm text-white placeholder-slate-500 transition-colors"
                  />
                </div>

                {/* DOB & TOB Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="dob-input" className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                      {tForm("dob")} <span className="text-celestial-gold">*</span>
                    </label>
                    <input
                      id="dob-input"
                      type="date"
                      name="dob"
                      required
                      value={formData.dob}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg bg-cosmic-950/80 border border-slate-700 focus:border-celestial-gold focus:ring-1 focus:ring-celestial-gold outline-none text-sm text-white transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="tob-input" className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                      {tForm("tob")} <span className="text-celestial-gold">*</span>
                    </label>
                    <TimeInput12Hour
                      id="tob-input"
                      value={formData.tob || "06:30"}
                      onChange={(tob) => setFormData({ tob })}
                    />
                  </div>
                </div>

                {/* Place of Birth (Nominatim OpenStreetMap Autocomplete) */}
                <div>
                  <label htmlFor="pob-input" className="block text-xs uppercase tracking-wider text-slate-400 font-medium mb-1.5">
                    {tForm("pob")}
                  </label>
                  <LocationAutocomplete
                    id="pob-input"
                    value={formData.pob}
                    onChange={(pob, coords) =>
                      setFormData({
                        pob,
                        latitude: coords?.lat,
                        longitude: coords?.lon,
                      })
                    }
                    placeholder="e.g. Kozhikode, Chennai, New Delhi, or Varanasi"
                  />
                  <span className="block mt-1 text-[11px] text-slate-500">
                    Live city search with automatic coordinate & timezone calculation.
                  </span>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-4 py-3 rounded-lg bg-gradient-to-r from-mystic-purple to-indigo-600 hover:from-mystic-purple hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-mystic-purple/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 text-celestial-gold animate-spin" />
                      <span>{tUI("calculating_ephemeris")}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-celestial-gold" />
                      <span>{tForm("button")}</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Visual Sacred Geometry Teaser Grid */}
            <div className="lg:col-span-6 flex justify-center">
              <RasiChartTeaser />
            </div>

          </div>
        )}
      </div>

      {/* Feature Highlights */}
      <div id="features" className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-cosmic-900/30 border border-slate-800 backdrop-blur-sm">
          <Moon className="w-6 h-6 text-celestial-gold mb-3" />
          <h3 className="font-serif font-semibold text-white text-base">Accurate Nakshatra & Pada</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Precise calculation of 27 lunar mansions (Nakshatras) and 108 padas based on Swiss Ephemeris Sidereal Lahiri algorithms.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-cosmic-900/30 border border-slate-800 backdrop-blur-sm">
          <Star className="w-6 h-6 text-mystic-purple mb-3" />
          <h3 className="font-serif font-semibold text-white text-base">South Indian Geometry</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Fixed 4x4 perimeter signs clockwise from Pisces (Meena) with dynamic Graha, Lagna, and Navamsa mapping.
          </p>
        </div>
        <div className="p-6 rounded-xl bg-cosmic-900/30 border border-slate-800 backdrop-blur-sm">
          <Compass className="w-6 h-6 text-mystic-cyan mb-3" />
          <h3 className="font-serif font-semibold text-white text-base">Vernacular Support</h3>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Full native multilingual support in English, Malayalam (മലയാളം), Tamil (தமிழ்), and Hindi (हिन्दी).
          </p>
        </div>
      </div>

    </div>
  );
}
