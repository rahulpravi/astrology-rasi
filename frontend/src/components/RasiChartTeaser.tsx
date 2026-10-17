"use client";

import { Sun } from "lucide-react";

export default function RasiChartTeaser() {
  return (
    <div className="relative w-full max-w-md aspect-square rounded-2xl border border-slate-700/80 bg-cosmic-900/30 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl">
      <div className="absolute inset-0 bg-gold-glow pointer-events-none rounded-2xl" />
      
      {/* 12-House Grid Representation */}
      <div className="w-full h-full grid grid-cols-4 grid-rows-4 border border-celestial-gold/40 text-center font-mono text-[11px] text-slate-300">
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">12</span>
          <span className="text-[10px] text-slate-400">Meena</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">1</span>
          <span className="text-[10px] text-celestial-gold font-semibold">Lagna (Aries)</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">2</span>
          <span className="text-[10px] text-slate-400">Chandra</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">3</span>
          <span className="text-[10px] text-slate-400">Mithuna</span>
        </div>

        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">11</span>
          <span className="text-[10px] text-slate-400">Kumbha</span>
        </div>
        <div className="col-span-2 row-span-2 border border-celestial-gold/40 flex flex-col items-center justify-center bg-cosmic-950/70 p-4">
          <Sun className="w-8 h-8 text-celestial-gold mb-1 animate-pulse" />
          <span className="font-serif text-sm font-semibold tracking-wider text-white">RASI CHAKRA</span>
          <span className="text-[10px] text-mystic-cyan font-mono mt-1">South Indian Format</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">4</span>
          <span className="text-[10px] text-slate-400">Karkata</span>
        </div>

        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">10</span>
          <span className="text-[10px] text-slate-400">Surya</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">5</span>
          <span className="text-[10px] text-slate-400">Guru</span>
        </div>

        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">9</span>
          <span className="text-[10px] text-slate-400">Shani</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">8</span>
          <span className="text-[10px] text-slate-400">Vrischika</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">7</span>
          <span className="text-[10px] text-slate-400">Thula</span>
        </div>
        <div className="border border-celestial-gold/30 p-2 flex flex-col justify-center items-center bg-slate-900/40">
          <span className="text-celestial-gold font-bold">6</span>
          <span className="text-[10px] text-slate-400">Kanya</span>
        </div>
      </div>
    </div>
  );
}
