"use client";

import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { useTranslations } from "next-intl";
import { useAstrologyStore } from "@/store/useAstrologyStore";
import { ChartData, PlanetData } from "@/lib/api";
import {
  Compass,
  Sparkles,
  RotateCcw,
  Sun,
  Moon,
  Calendar,
  Clock,
  MapPin,
  Award,
  Layers,
  Download,
} from "lucide-react";

interface ChartDisplayProps {
  data: ChartData;
  onReset: () => void;
}

interface SignBoxDefinition {
  id: string;
  index: number;
  sanskrit: string;
  english: string;
  gridArea: string;
  element: "Fire" | "Earth" | "Air" | "Water";
}

const SOUTH_INDIAN_SIGNS: SignBoxDefinition[] = [
  // Top Row (Left to Right)
  { id: "pisces", index: 12, sanskrit: "Meena", english: "Pisces", gridArea: "pisces", element: "Water" },
  { id: "aries", index: 1, sanskrit: "Mesha", english: "Aries", gridArea: "aries", element: "Fire" },
  { id: "taurus", index: 2, sanskrit: "Vrishabha", english: "Taurus", gridArea: "taurus", element: "Earth" },
  { id: "gemini", index: 3, sanskrit: "Mithuna", english: "Gemini", gridArea: "gemini", element: "Air" },

  // Right Column (Top to Bottom)
  { id: "cancer", index: 4, sanskrit: "Karkata", english: "Cancer", gridArea: "cancer", element: "Water" },
  { id: "leo", index: 5, sanskrit: "Simha", english: "Leo", gridArea: "leo", element: "Fire" },
  { id: "virgo", index: 6, sanskrit: "Kanya", english: "Virgo", gridArea: "virgo", element: "Earth" },

  // Bottom Row (Right to Left)
  { id: "libra", index: 7, sanskrit: "Thula", english: "Libra", gridArea: "libra", element: "Air" },
  { id: "scorpio", index: 8, sanskrit: "Vrischika", english: "Scorpio", gridArea: "scorpio", element: "Water" },
  { id: "sagittarius", index: 9, sanskrit: "Dhanu", english: "Sagittarius", gridArea: "sagittarius", element: "Fire" },

  // Left Column (Bottom to Top)
  { id: "capricorn", index: 10, sanskrit: "Makara", english: "Capricorn", gridArea: "capricorn", element: "Earth" },
  { id: "aquarius", index: 11, sanskrit: "Kumbha", english: "Aquarius", gridArea: "aquarius", element: "Air" },
];

function getPlanetAbbrev(name: string): string {
  switch (name.toLowerCase()) {
    case "sun": return "Su";
    case "moon": return "Mo";
    case "mars": return "Ma";
    case "mercury": return "Me";
    case "jupiter": return "Ju";
    case "venus": return "Ve";
    case "saturn": return "Sa";
    case "rahu": return "Ra";
    case "ketu": return "Ke";
    default: return name.slice(0, 2);
  }
}

function formatDMS(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}° ${m.toString().padStart(2, "0")}'`;
}

export default function ChartDisplay({ data, onReset }: ChartDisplayProps) {
  // Deep Translations from next-intl dictionaries
  const tPlanets = useTranslations("astrology.planets");
  const tSigns = useTranslations("astrology.signs");
  const tNakshatras = useTranslations("astrology.nakshatras");
  const tElements = useTranslations("astrology.elements");
  const tUI = useTranslations("astrology.ui");

  // Read active chart type (D1 vs D9) from global Zustand store
  const chartType = useAstrologyStore((state) => state.chartType);
  const setChartType = useAstrologyStore((state) => state.setChartType);

  // Printable Report Container Reference
  const printableRef = useRef<HTMLDivElement>(null);

  /**
   * PDF Generation Hook via react-to-print:
   * Uses browser native vector printing, enforcing exact page margins,
   * CSS Grid preservation, and high-fidelity color adjustment.
   */
  const handlePrint = useReactToPrint({
    contentRef: printableRef,
    documentTitle: `${(data.seeker || "Seeker").replace(/\s+/g, "_")}_Vedic_Kundali_Report`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          background-color: #060714 !important;
          color: #f8fafc !important;
        }
        .print-hidden, .no-print {
          display: none !important;
        }
        .page-break-avoid {
          break-inside: avoid !important;
          page-break-inside: avoid !important;
        }
      }
    `,
  });

  // Helper Translation Lookups with Fallbacks
  const translatePlanet = (name: string): string => {
    const key = name.toLowerCase().replace(/\s+/g, "_");
    try {
      return tPlanets(key as any);
    } catch {
      return name;
    }
  };

  const translateSign = (sign: string): string => {
    const key = sign.toLowerCase().replace(/\s+/g, "_");
    try {
      return tSigns(key as any);
    } catch {
      return sign;
    }
  };

  const translateNakshatra = (nak: string): string => {
    const key = nak.toLowerCase().replace(/\s+/g, "_");
    try {
      return tNakshatras(key as any);
    } catch {
      return nak;
    }
  };

  const translateElement = (elem: string): string => {
    const key = elem.toLowerCase();
    try {
      return tElements(key as any);
    } catch {
      return elem;
    }
  };

  // D1 Lagna Sign Index
  const d1LagnaSignObj = SOUTH_INDIAN_SIGNS.find(
    (s) =>
      s.sanskrit.toLowerCase() === data.ascendant.sign.toLowerCase() ||
      s.english.toLowerCase() === data.ascendant.sign_english.toLowerCase()
  );
  const d1LagnaSignIndex = d1LagnaSignObj ? d1LagnaSignObj.index : 1;

  // D9 Navamsa Lagna Sign Index
  const d9LagnaSignObj = SOUTH_INDIAN_SIGNS.find(
    (s) =>
      s.sanskrit.toLowerCase() === (data.ascendant.navamsa_sign || "").toLowerCase() ||
      s.english.toLowerCase() === (data.ascendant.navamsa_sign_english || "").toLowerCase()
  );
  const d9LagnaSignIndex = d9LagnaSignObj ? d9LagnaSignObj.index : d1LagnaSignIndex;

  // Active Lagna Index based on selected Chart Mode
  const activeLagnaSignIndex = chartType === "D1" ? d1LagnaSignIndex : d9LagnaSignIndex;

  // Formatted date and time strings
  const formattedDate = (() => {
    try {
      return new Date(data.datetime).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return data.datetime;
    }
  })();

  const formattedTime = (() => {
    try {
      return new Date(data.datetime).toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  })();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-in fade-in zoom-in-95 duration-300">
      
      {/* Top Header: Seeker Details & Action Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-cosmic-900/40 border border-slate-700/60 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-celestial-gold" />
            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">
              {data.seeker}&apos;s Vedic Kundali
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formattedTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {data.place_of_birth || `${data.coordinates.latitude.toFixed(2)}°, ${data.coordinates.longitude.toFixed(2)}°`}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700 text-celestial-amber font-mono text-[11px]">
              {data.ayanamsa}
            </span>
          </div>
        </div>

        {/* Action Buttons: Download PDF & Generate Another */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Download PDF Button */}
          <button
            onClick={() => handlePrint()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-celestial-amber via-celestial-gold to-yellow-200 text-cosmic-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-celestial-amber/20 hover:scale-105 active:scale-95 cursor-pointer"
            title={tUI("download_pdf")}
          >
            <Download className="w-4 h-4" />
            <span>{tUI("download_pdf")}</span>
          </button>

          {/* Reset / Generate Another Button */}
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-cosmic-950/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-medium text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            title={tUI("generate_another")}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">{tUI("generate_another")}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Wrapper (Targeted by react-to-print ref) */}
      <div ref={printableRef} className="space-y-8 p-1 sm:p-2">
        
        {/* Customized PDF Formal Header: Visible ONLY in the downloaded PDF */}
        <div className="hidden print:block border-b-2 border-celestial-gold/60 pb-5 mb-6 text-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-celestial-gold" />
                <h1 className="text-2xl font-serif font-bold text-white tracking-widest uppercase">
                  Vedic Astrology & Kundali Report
                </h1>
              </div>
              <p className="text-xs text-celestial-gold/90 font-mono mt-1">
                Precision Astronomical Ephemeris &bull; Lahiri (Chitra Paksha) Ayanamsa
              </p>
            </div>
            <div className="text-right text-[10px] text-slate-300 font-mono">
              <div className="font-semibold text-slate-200">
                Seeker: {data.seeker.toUpperCase()}
              </div>
              <div>Generated: {new Date().toLocaleDateString()}</div>
              <div>Swiss Ephemeris Engine</div>
            </div>
          </div>

          {/* Seeker Information Grid inside PDF Header */}
          <div className="mt-4 grid grid-cols-4 gap-2.5 p-3 rounded-xl bg-cosmic-900/90 border border-slate-700 text-xs">
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Seeker Name</span>
              <span className="font-semibold text-white">{data.seeker}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Date & Time</span>
              <span className="font-semibold text-white">{formattedDate} ({formattedTime})</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Place of Birth</span>
              <span className="font-semibold text-white truncate">{data.place_of_birth}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 font-mono block">Ayanamsa & Coord</span>
              <span className="font-semibold text-white truncate">
                {data.coordinates.latitude.toFixed(2)}°N, {data.coordinates.longitude.toFixed(2)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Quick-Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 page-break-avoid">
          {/* Lagna (Ascendant) */}
          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-celestial-gold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>{tUI("ascendant_card")}</span>
            </div>
            <div className="mt-1 text-lg font-serif font-semibold text-white">
              {translateSign(data.ascendant.sign_english)}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              D1: {formatDMS(data.ascendant.degree)} &bull; D9: {translateSign(data.ascendant.navamsa_sign_english)}
            </div>
          </div>

          {/* Moon Sign (Janma Rasi) */}
          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-mystic-cyan flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5" />
              <span>{tUI("moon_card")}</span>
            </div>
            <div className="mt-1 text-lg font-serif font-semibold text-white">
              {translateSign(data.moon.sign_english)}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              D1: {formatDMS(data.moon.degree)} &bull; D9: {translateSign(data.moon.navamsa_sign_english)}
            </div>
          </div>

          {/* Birth Star (Nakshatra) */}
          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-mystic-violet flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{tUI("nakshatra_card")}</span>
            </div>
            <div className="mt-1 text-lg font-serif font-semibold text-white">
              {translateNakshatra(data.moon.nakshatra)}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              {tUI("pada")} {data.moon.pada} &bull; Navamsa #{data.moon.navamsa_division}
            </div>
          </div>

          {/* Sun Sign (Surya) */}
          <div className="p-4 rounded-xl bg-cosmic-900/30 border border-slate-800/80 backdrop-blur-sm">
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5" />
              <span>{tUI("sun_card")}</span>
            </div>
            <div className="mt-1 text-lg font-serif font-semibold text-white">
              {translateSign(data.sun.sign_english)}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              D1: {formatDMS(data.sun.degree)} &bull; D9: {translateSign(data.sun.navamsa_sign_english)}
            </div>
          </div>
        </div>

        {/* Chart Switcher Controls & Subtitle */}
        <div className="flex flex-col items-center space-y-3">
          {/* Toggle Switch: Hidden in the printed PDF */}
          <div className="print:hidden inline-flex p-1.5 rounded-2xl bg-cosmic-900/80 border border-slate-700/80 backdrop-blur-xl shadow-lg shadow-black/40">
            <button
              onClick={() => setChartType("D1")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                chartType === "D1"
                  ? "bg-gradient-to-r from-celestial-amber via-celestial-gold to-yellow-200 text-cosmic-950 shadow-md shadow-celestial-amber/20 scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{tUI("rasi_chart_d1")}</span>
            </button>

            <button
              onClick={() => setChartType("D9")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                chartType === "D9"
                  ? "bg-gradient-to-r from-mystic-purple via-indigo-600 to-mystic-violet text-white shadow-md shadow-mystic-purple/30 scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Layers className="w-4 h-4 text-celestial-gold" />
              <span>{tUI("navamsa_chart_d9")}</span>
            </button>
          </div>

          {/* Contextual Description */}
          <div className="text-center max-w-lg">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
              {chartType === "D1" ? tUI("rasi_chart_d1") : tUI("navamsa_chart_d9")}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {chartType === "D1" ? tUI("d1_subtitle") : tUI("d9_subtitle")}
            </p>
          </div>
        </div>

        {/* 4x4 South Indian Kundali Grid */}
        <div className="flex flex-col items-center page-break-avoid">
          <div className="w-full max-w-2xl aspect-square p-2 sm:p-4 rounded-3xl bg-cosmic-900/30 border border-slate-700/80 backdrop-blur-xl shadow-2xl relative">
            
            <div
              className="w-full h-full grid grid-cols-4 grid-rows-4 border-2 border-celestial-gold/50 rounded-2xl overflow-hidden transition-all duration-300"
              style={{
                gridTemplateAreas: `
                  "pisces      aries       taurus     gemini"
                  "aquarius    center      center     cancer"
                  "capricorn   center      center     leo"
                  "sagittarius scorpio     libra      virgo"
                `,
              }}
            >
              {/* Render 12 Perimeter Sign Boxes */}
              {SOUTH_INDIAN_SIGNS.map((sign) => {
                const isLagnaHere =
                  chartType === "D1"
                    ? data.ascendant.sign.toLowerCase() === sign.sanskrit.toLowerCase() ||
                      data.ascendant.sign_english.toLowerCase() === sign.english.toLowerCase()
                    : (data.ascendant.navamsa_sign || "").toLowerCase() === sign.sanskrit.toLowerCase() ||
                      (data.ascendant.navamsa_sign_english || "").toLowerCase() === sign.english.toLowerCase();

                const planetsHere = data.planets.filter((p) => {
                  if (chartType === "D1") {
                    return (
                      p.sign.toLowerCase() === sign.sanskrit.toLowerCase() ||
                      p.sign_english.toLowerCase() === sign.english.toLowerCase()
                    );
                  } else {
                    return (
                      (p.navamsa_sign || "").toLowerCase() === sign.sanskrit.toLowerCase() ||
                      (p.navamsa_sign_english || "").toLowerCase() === sign.english.toLowerCase()
                    );
                  }
                });

                const houseNumber = ((sign.index - activeLagnaSignIndex + 12) % 12) + 1;

                return (
                  <div
                    key={sign.id}
                    style={{ gridArea: sign.gridArea }}
                    className={`border border-celestial-gold/30 p-1.5 sm:p-2 flex flex-col justify-between transition-all duration-200 relative group ${
                      isLagnaHere
                        ? chartType === "D1"
                          ? "bg-gradient-to-br from-celestial-gold/15 via-slate-900/80 to-cosmic-950/90 shadow-inner"
                          : "bg-gradient-to-br from-mystic-purple/25 via-slate-900/80 to-cosmic-950/90 shadow-inner"
                        : "bg-cosmic-950/60 hover:bg-slate-900/50"
                    }`}
                  >
                    {/* Top: Translated Sign & Relative House */}
                    <div className="flex items-center justify-between text-[10px] sm:text-xs">
                      <div className="flex items-baseline gap-1">
                        <span className="font-semibold text-slate-200">
                          {translateSign(sign.sanskrit)}
                        </span>
                        <span className="text-[9px] text-slate-400 hidden sm:inline">
                          ({sign.sanskrit})
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 bg-slate-800/60 px-1 rounded">
                        {tUI("house").slice(0, 1)}{houseNumber}
                      </span>
                    </div>

                    {/* Middle: Lagna Badge and Occupying Planets */}
                    <div className="my-1 flex flex-col gap-1 overflow-y-auto max-h-24 pr-0.5">
                      {isLagnaHere && (
                        <div
                          className={`flex items-center justify-between px-1.5 py-0.5 rounded border shadow-sm ${
                            chartType === "D1"
                              ? "bg-celestial-gold/20 border-celestial-gold/60 text-celestial-gold"
                              : "bg-mystic-purple/30 border-mystic-purple/70 text-amber-200"
                          }`}
                        >
                          <span className="font-bold text-[9px] sm:text-[10px] tracking-wide">
                            {chartType === "D1" ? `LAGNA (D1)` : `LAGNA (D9)`}
                          </span>
                          <span className="font-mono text-[8px] sm:text-[9px]">
                            {formatDMS(
                              chartType === "D1"
                                ? data.ascendant.degree
                                : data.ascendant.navamsa_degree
                            )}
                          </span>
                        </div>
                      )}

                      {planetsHere.map((p) => {
                        const displayDegree = chartType === "D1" ? p.degree : p.navamsa_degree;
                        return (
                          <div
                            key={p.name}
                            className={`flex items-center justify-between px-1.5 py-0.5 rounded border text-[9px] sm:text-[11px] font-medium transition-colors ${
                              p.name === "Sun"
                                ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                                : p.name === "Moon"
                                ? "bg-sky-500/15 border-sky-500/40 text-sky-200"
                                : p.name === "Mars"
                                ? "bg-red-500/15 border-red-500/40 text-red-300"
                                : p.name === "Jupiter"
                                ? "bg-yellow-500/15 border-yellow-500/40 text-yellow-200"
                                : p.name === "Venus"
                                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                                : p.name === "Saturn"
                                ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                                : "bg-slate-800/60 border-slate-700 text-slate-200"
                            }`}
                          >
                            <div className="flex items-center gap-1">
                              <span className="font-bold">{getPlanetAbbrev(p.name)}</span>
                              <span className="hidden sm:inline text-[9px] text-slate-300 truncate max-w-[70px]">
                                {translatePlanet(p.name)}
                              </span>
                              {p.retrograde && (
                                <span className="text-[8px] font-bold text-red-400 bg-red-950/60 px-0.5 rounded" title={tUI("retrograde")}>
                                  R
                                </span>
                              )}
                              {p.is_vargottama && (
                                <span className="text-[8px] text-celestial-gold" title={`${tUI("vargottama")} (Same sign in D1 & D9)`}>
                                  ★
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[8px] sm:text-[10px] text-slate-300">
                              {formatDMS(displayDegree)}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom: Triplicity & Natural Index */}
                    <div className="flex items-center justify-between text-[8px] sm:text-[9px] text-slate-400 pt-0.5 border-t border-slate-800/40">
                      <span>{translateElement(sign.element)}</span>
                      <span className="font-mono font-bold text-slate-400">#{sign.index}</span>
                    </div>
                  </div>
                );
              })}

              {/* Central Sacred Geometry Area */}
              <div
                style={{ gridArea: "center" }}
                className="border-2 border-celestial-gold/40 bg-cosmic-950/90 backdrop-blur-md p-3 sm:p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-celestial-gold/40 flex items-center justify-center mb-2 shadow-lg shadow-celestial-gold/10">
                  {chartType === "D1" ? (
                    <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-celestial-gold animate-[spin_30s_linear_infinite]" />
                  ) : (
                    <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-mystic-violet animate-pulse" />
                  )}
                </div>

                <h4 className="font-serif text-sm sm:text-base font-bold tracking-widest text-white uppercase">
                  {chartType === "D1" ? tUI("rasi_chart_d1") : tUI("navamsa_chart_d9")}
                </h4>
                <p className="text-[10px] sm:text-xs text-celestial-gold font-mono tracking-wider">
                  {chartType === "D1" ? tUI("south_indian_format") : tUI("navamsa_harmonic_format")}
                </p>

                <div className="mt-2 pt-2 border-t border-slate-800/80 w-full max-w-[210px] text-[10px] sm:text-[11px] text-slate-300 space-y-0.5 font-sans">
                  <div className="font-semibold text-slate-100 truncate">{data.seeker}</div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 truncate">
                    {chartType === "D1" ? (
                      <>{tUI("ascendant_card")}: {translateSign(data.ascendant.sign_english)} ({formatDMS(data.ascendant.degree)})</>
                    ) : (
                      <>D9 {tUI("ascendant_card")}: {translateSign(data.ascendant.navamsa_sign_english)} ({formatDMS(data.ascendant.navamsa_degree)})</>
                    )}
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-mystic-cyan truncate">
                    {chartType === "D1" ? (
                      <>{translatePlanet("Moon")}: {translateNakshatra(data.moon.nakshatra)} ({data.moon.pada})</>
                    ) : (
                      <>D9 {translatePlanet("Moon")}: {translateSign(data.moon.navamsa_sign_english)} ({tUI("house")} {data.moon.navamsa_house})</>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Detailed Planetary Positions Data Table */}
        <div className="rounded-2xl bg-cosmic-900/40 border border-slate-700/60 backdrop-blur-xl p-6 shadow-2xl overflow-hidden page-break-avoid">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-celestial-gold" />
                <span>{tUI("table_title")}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {tUI("table_subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-celestial-gold font-mono bg-celestial-gold/10 px-2.5 py-1 rounded-full border border-celestial-gold/30">
                ★ {tUI("vargottama")}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider font-mono text-[10px] sm:text-xs">
                  <th className="py-3 px-3">{tUI("col_body")}</th>
                  <th className="py-3 px-3">{tUI("col_d1_sign")}</th>
                  <th className="py-3 px-3">{tUI("col_d1_house")}</th>
                  <th className="py-3 px-3">{tUI("col_degree")}</th>
                  <th className="py-3 px-3">{tUI("col_nakshatra")}</th>
                  <th className="py-3 px-3">{tUI("col_d9_sign")}</th>
                  <th className="py-3 px-3">{tUI("col_d9_house")}</th>
                  <th className="py-3 px-3 text-right">{tUI("col_motion")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                
                {/* Ascendant (Lagna) Row */}
                <tr className="bg-celestial-gold/5 font-medium hover:bg-celestial-gold/10 transition-colors">
                  <td className="py-3.5 px-3 flex items-center gap-2 font-serif text-celestial-gold font-bold">
                    <Compass className="w-4 h-4" />
                    <span>{translatePlanet("Ascendant")}</span>
                    {data.ascendant.is_vargottama && (
                      <span className="text-[10px] text-celestial-gold bg-celestial-gold/20 px-1.5 py-0.2 rounded font-sans font-normal border border-celestial-gold/40">
                        {tUI("vargottama")} ★
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-slate-200">
                    {translateSign(data.ascendant.sign_english)} <span className="text-slate-400 text-xs font-normal">({data.ascendant.sign})</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono font-semibold text-celestial-gold">
                    {tUI("house")} 1
                  </td>
                  <td className="py-3.5 px-3 font-mono text-white">
                    {formatDMS(data.ascendant.degree)}
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    {translateNakshatra(data.ascendant.nakshatra)} <span className="text-slate-400 text-xs">({tUI("pada")} {data.ascendant.pada})</span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-mystic-violet">
                    {translateSign(data.ascendant.navamsa_sign_english)} <span className="text-slate-400 text-xs font-normal">({data.ascendant.navamsa_sign})</span>
                  </td>
                  <td className="py-3.5 px-3 font-mono text-mystic-cyan">
                    {tUI("house")} 1
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {tUI("direct")}
                    </span>
                  </td>
                </tr>

                {/* 9 Planetary Rows */}
                {data.planets.map((planet: PlanetData) => (
                  <tr
                    key={planet.name}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[10px] text-celestial-gold">
                        {getPlanetAbbrev(planet.name)}
                      </span>
                      <span>{translatePlanet(planet.name)}</span>
                      {planet.is_vargottama && (
                        <span className="text-[10px] text-celestial-gold bg-celestial-gold/15 px-1.5 py-0.2 rounded font-sans font-normal border border-celestial-gold/30">
                          {tUI("vargottama")} ★
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {translateSign(planet.sign_english)} <span className="text-slate-400 text-xs">({planet.sign})</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {tUI("house")} {planet.house}
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-200">
                      {formatDMS(planet.degree)}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {translateNakshatra(planet.nakshatra)} <span className="text-slate-400 text-xs">({tUI("pada")} {planet.pada})</span>
                    </td>
                    <td className="py-3 px-3 font-medium text-amber-200">
                      {translateSign(planet.navamsa_sign_english)} <span className="text-slate-400 text-xs font-normal">({planet.navamsa_sign})</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-mystic-cyan">
                      {tUI("house")} {planet.navamsa_house}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {planet.retrograde ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-950/80 border border-red-800/60 text-red-300 font-mono">
                          {tUI("retrograde")} (R)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800/60 text-slate-400 font-mono">
                          {tUI("direct")} (D)
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customized PDF Formal Footer: Visible ONLY in the downloaded PDF */}
        <div className="hidden print:flex items-center justify-between pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono">
          <span>Astrology Rasi Chart Generator &bull; Swiss Ephemeris Computation Engine</span>
          <span>Parashari Vedic Astrology &bull; Lahiri Ayanamsa</span>
        </div>

      </div>

    </div>
  );
}
