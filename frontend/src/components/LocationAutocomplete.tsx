"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2, X, Search } from "lucide-react";

interface Suggestion {
  display_name: string;
  short_name: string;
  lat: number;
  lon: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (cityName: string, coords?: { lat: number; lon: number }) => void;
  placeholder?: string;
  id?: string;
}

// Offline fallback for fast suggestions
const POPULAR_LOCATIONS: Suggestion[] = [
  { display_name: "Kozhikode, Kerala, India", short_name: "Kozhikode", lat: 11.2588, lon: 75.7804 },
  { display_name: "Chennai, Tamil Nadu, India", short_name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { display_name: "New Delhi, Delhi, India", short_name: "New Delhi", lat: 28.6139, lon: 77.2090 },
  { display_name: "Mumbai, Maharashtra, India", short_name: "Mumbai", lat: 19.0760, lon: 72.8777 },
  { display_name: "Bengaluru, Karnataka, India", short_name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { display_name: "Kochi, Kerala, India", short_name: "Kochi", lat: 9.9312, lon: 76.2673 },
  { display_name: "Thiruvananthapuram, Kerala, India", short_name: "Thiruvananthapuram", lat: 8.5241, lon: 76.9366 },
  { display_name: "Varanasi, Uttar Pradesh, India", short_name: "Varanasi", lat: 25.3176, lon: 82.9739 },
  { display_name: "Hyderabad, Telangana, India", short_name: "Hyderabad", lat: 17.3850, lon: 78.4867 },
  { display_name: "Madurai, Tamil Nadu, India", short_name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { display_name: "Kolkata, West Bengal, India", short_name: "Kolkata", lat: 22.5726, lon: 88.3639 },
];

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = "e.g. Kozhikode, Chennai, or Varanasi",
  id,
}: LocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Click outside listener to dismiss suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search to OpenStreetMap Nominatim API
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          trimmed
        )}&limit=5&addressdetails=1`;

        const res = await fetch(url, {
          headers: {
            "Accept-Language": "en",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const items: Suggestion[] = data.map((item: any) => {
            const city =
              item.address?.city ||
              item.address?.town ||
              item.address?.village ||
              item.address?.county ||
              item.name;

            const state = item.address?.state;
            const country = item.address?.country;

            const short = [city, state].filter(Boolean).join(", ");
            const full = [city, state, country].filter(Boolean).join(", ") || item.display_name;

            return {
              display_name: full,
              short_name: short || city || item.display_name,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          });

          setSuggestions(items);
          setIsOpen(items.length > 0);
        } else {
          // Fallback to offline filtered popular cities
          const matches = POPULAR_LOCATIONS.filter((loc) =>
            loc.display_name.toLowerCase().includes(trimmed.toLowerCase())
          );
          setSuggestions(matches);
          setIsOpen(matches.length > 0);
        }
      } catch {
        // Network failure fallback
        const matches = POPULAR_LOCATIONS.filter((loc) =>
          loc.display_name.toLowerCase().includes(trimmed.toLowerCase())
        );
        setSuggestions(matches);
        setIsOpen(matches.length > 0);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item: Suggestion) => {
    setQuery(item.short_name);
    onChange(item.short_name, { lat: item.lat, lon: item.lon });
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery("");
    onChange("");
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative flex items-center">
        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />

        <input
          id={id}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 rounded-lg bg-cosmic-950/80 border border-slate-700 focus:border-celestial-gold focus:ring-1 focus:ring-celestial-gold outline-none text-sm text-white placeholder-slate-500 transition-colors"
        />

        <div className="absolute right-3 flex items-center gap-1">
          {isLoading && <Loader2 className="w-3.5 h-3.5 text-celestial-gold animate-spin" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggestion Dropdown List */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-1.5 rounded-xl bg-cosmic-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl py-1 z-50 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          {suggestions.map((item, idx) => (
            <button
              key={`${item.display_name}-${idx}`}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full flex items-start gap-2.5 px-3.5 py-2 text-left hover:bg-slate-800/60 transition-colors text-xs text-slate-200 hover:text-white group"
            >
              <Search className="w-3.5 h-3.5 text-celestial-gold shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
              <div className="flex-1 truncate">
                <div className="font-semibold text-slate-100 truncate">{item.short_name}</div>
                <div className="text-[10px] text-slate-400 truncate">{item.display_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
