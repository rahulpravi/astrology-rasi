import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChartData, MatchData } from "@/lib/api";

export interface BirthFormData {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  latitude?: number;
  longitude?: number;
}

export interface MatchPersonData {
  name: string;
  dob: string;
  tob: string;
  pob: string;
  latitude?: number;
  longitude?: number;
}

export interface RecentProfile {
  id: string;
  name: string;
  dob: string;
  tob: string;
  pob: string;
  timestamp: number;
}

interface AstrologyStoreState {
  // --- Kundali (Rasi & Navamsa) State ---
  formData: BirthFormData;
  recentProfiles: RecentProfile[];
  chartData: ChartData | null;
  isLoading: boolean;
  errorMessage: string | null;
  chartType: "D1" | "D9";

  // --- Matchmaking (Jathaka Porutham) State ---
  matchBoy: MatchPersonData;
  matchGirl: MatchPersonData;
  matchResult: MatchData | null;
  matchLoading: boolean;
  matchError: string | null;
  poruthamFilter: "all" | "match" | "no_match";

  // --- Kundali Actions ---
  setFormData: (data: Partial<BirthFormData>) => void;
  addRecentProfile: (profile: Omit<RecentProfile, "id" | "timestamp">) => void;
  removeRecentProfile: (id: string) => void;
  clearRecentProfiles: () => void;
  loadProfile: (profile: RecentProfile) => void;
  setChartData: (data: ChartData | null) => void;
  setIsLoading: (loading: boolean) => void;
  setErrorMessage: (msg: string | null) => void;
  setChartType: (type: "D1" | "D9") => void;
  reset: () => void;

  // --- Matchmaking Actions ---
  setMatchBoy: (data: Partial<MatchPersonData>) => void;
  setMatchGirl: (data: Partial<MatchPersonData>) => void;
  setMatchResult: (data: MatchData | null) => void;
  setMatchLoading: (loading: boolean) => void;
  setMatchError: (msg: string | null) => void;
  setPoruthamFilter: (filter: "all" | "match" | "no_match") => void;
  resetMatchmaking: () => void;
}

export const useAstrologyStore = create<AstrologyStoreState>()(
  persist(
    (set) => ({
      // Kundali Defaults
      formData: {
        name: "",
        dob: "",
        tob: "06:30",
        pob: "",
      },
      recentProfiles: [],
      chartData: null,
      isLoading: false,
      errorMessage: null,
      chartType: "D1",

      // Matchmaking Defaults
      matchBoy: {
        name: "",
        dob: "",
        tob: "07:30",
        pob: "Chennai",
      },
      matchGirl: {
        name: "",
        dob: "",
        tob: "10:15",
        pob: "Kozhikode",
      },
      matchResult: null,
      matchLoading: false,
      matchError: null,
      poruthamFilter: "all",

      // --- Kundali Reducers ---
      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      addRecentProfile: (profile) =>
        set((state) => {
          const filtered = state.recentProfiles.filter(
            (p) =>
              !(
                p.name.trim().toLowerCase() === profile.name.trim().toLowerCase() &&
                p.dob === profile.dob &&
                p.tob === profile.tob
              )
          );

          const newProfile: RecentProfile = {
            ...profile,
            id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: Date.now(),
          };

          return {
            recentProfiles: [newProfile, ...filtered].slice(0, 8),
          };
        }),

      removeRecentProfile: (id) =>
        set((state) => ({
          recentProfiles: state.recentProfiles.filter((p) => p.id !== id),
        })),

      clearRecentProfiles: () =>
        set({ recentProfiles: [] }),

      loadProfile: (profile) =>
        set({
          formData: {
            name: profile.name,
            dob: profile.dob,
            tob: profile.tob,
            pob: profile.pob,
          },
          errorMessage: null,
        }),

      setChartData: (data) =>
        set({ chartData: data, errorMessage: null }),

      setIsLoading: (loading) =>
        set({ isLoading: loading }),

      setErrorMessage: (msg) =>
        set({ errorMessage: msg }),

      setChartType: (type) =>
        set({ chartType: type }),

      reset: () =>
        set({
          chartData: null,
          errorMessage: null,
          chartType: "D1",
        }),

      // --- Matchmaking Reducers ---
      setMatchBoy: (data) =>
        set((state) => ({
          matchBoy: { ...state.matchBoy, ...data },
        })),

      setMatchGirl: (data) =>
        set((state) => ({
          matchGirl: { ...state.matchGirl, ...data },
        })),

      setMatchResult: (data) =>
        set({ matchResult: data, matchError: null }),

      setMatchLoading: (loading) =>
        set({ matchLoading: loading }),

      setMatchError: (msg) =>
        set({ matchError: msg }),

      setPoruthamFilter: (filter) =>
        set({ poruthamFilter: filter }),

      resetMatchmaking: () =>
        set({
          matchBoy: { name: "", dob: "", tob: "07:30", pob: "Chennai" },
          matchGirl: { name: "", dob: "", tob: "10:15", pob: "Kozhikode" },
          matchResult: null,
          matchError: null,
          poruthamFilter: "all",
        }),
    }),
    {
      name: "astrology-kundali-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
