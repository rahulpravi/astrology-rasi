"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimeInput12HourProps {
  value: string; // 24-hour format string: "HH:MM" (e.g. "06:30" or "18:45")
  onChange: (val24: string) => void;
  id?: string;
}

/**
 * Converts 12-hour time (hour 1-12, minute 0-59, AM/PM) into standard 24-hour format "HH:MM"
 */
function to24Hour(hour12: number, minute: number, ampm: "AM" | "PM"): string {
  let h = hour12;
  if (ampm === "AM") {
    if (h === 12) h = 0;
  } else {
    // PM
    if (h < 12) h += 12;
  }
  const hStr = h.toString().padStart(2, "0");
  const mStr = minute.toString().padStart(2, "0");
  return `${hStr}:${mStr}`;
}

/**
 * Parses a 24-hour time string "HH:MM" into 12-hour components
 */
function parse24Hour(val24: string): { hour: number; minute: number; ampm: "AM" | "PM" } {
  if (!val24 || !val24.includes(":")) {
    return { hour: 6, minute: 30, ampm: "AM" };
  }
  const [hStr, mStr] = val24.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;
  if (isNaN(h)) h = 6;

  const ampm: "AM" | "PM" = h >= 12 ? "PM" : "AM";
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return { hour: hour12, minute: m, ampm };
}

export default function TimeInput12Hour({ value, onChange, id }: TimeInput12HourProps) {
  const parsed = parse24Hour(value);
  const [hour, setHour] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);
  const [ampm, setAmpm] = useState<"AM" | "PM">(parsed.ampm);

  // Sync internal state if external value changes (e.g. loading a profile)
  useEffect(() => {
    if (value) {
      const p = parse24Hour(value);
      setHour(p.hour);
      setMinute(p.minute);
      setAmpm(p.ampm);
    }
  }, [value]);

  const updateTime = (newHour: number, newMin: number, newAmpm: "AM" | "PM") => {
    setHour(newHour);
    setMinute(newMin);
    setAmpm(newAmpm);
    const val24 = to24Hour(newHour, newMin, newAmpm);
    onChange(val24);
  };

  return (
    <div
      id={id}
      className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-cosmic-950/80 border border-slate-700 focus-within:border-celestial-gold focus-within:ring-1 focus-within:ring-celestial-gold transition-colors"
    >
      <div className="flex items-center gap-1 sm:gap-2">
        <Clock className="w-4 h-4 text-slate-400 shrink-0" />

        {/* Hour Select (1-12) */}
        <select
          value={hour}
          onChange={(e) => updateTime(parseInt(e.target.value, 10), minute, ampm)}
          aria-label="Hour (1-12)"
          className="bg-transparent text-white font-mono text-sm focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-800/60"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h} className="bg-cosmic-950 text-white">
              {h.toString().padStart(2, "0")}
            </option>
          ))}
        </select>

        <span className="text-celestial-gold font-bold text-sm">:</span>

        {/* Minute Select (00-59) */}
        <select
          value={minute}
          onChange={(e) => updateTime(hour, parseInt(e.target.value, 10), ampm)}
          aria-label="Minute (00-59)"
          className="bg-transparent text-white font-mono text-sm focus:outline-none cursor-pointer py-1 px-1 rounded hover:bg-slate-800/60"
        >
          {Array.from({ length: 60 }, (_, i) => i).map((m) => (
            <option key={m} value={m} className="bg-cosmic-950 text-white">
              {m.toString().padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>

      {/* AM / PM Segmented Switch */}
      <div className="flex items-center p-0.5 rounded-md bg-slate-900 border border-slate-700/80">
        <button
          type="button"
          onClick={() => updateTime(hour, minute, "AM")}
          className={`px-2 py-0.5 rounded text-xs font-semibold font-mono transition-all cursor-pointer ${
            ampm === "AM"
              ? "bg-gradient-to-r from-amber-500 to-celestial-gold text-cosmic-950 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          AM
        </button>
        <button
          type="button"
          onClick={() => updateTime(hour, minute, "PM")}
          className={`px-2 py-0.5 rounded text-xs font-semibold font-mono transition-all cursor-pointer ${
            ampm === "PM"
              ? "bg-gradient-to-r from-mystic-purple to-indigo-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          PM
        </button>
      </div>
    </div>
  );
}
