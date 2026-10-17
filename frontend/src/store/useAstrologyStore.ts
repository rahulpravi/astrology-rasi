import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChartData } from "@/lib/api";

export interface BirthFormData {
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
  formData: BirthFormData;
  recentProfiles: RecentProfile[];
  chartData: ChartData | null;
  isLoading: boolean;
  errorMessage: string | null;
  chartType: "D1" | "D9";

  // Actions
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
}

export const useAstrologyStore = create<AstrologyStoreState>()(
  persist(
    (set) => ({
      formData: {
        name: "",
        dob: "",
        tob: "",
        pob: "",
      },
      recentProfiles: [],
      chartData: null,
      isLoading: false,
      errorMessage: null,
      chartType: "D1",

      setFormData: (data) =>
        set((state) => ({
          formData: { ...state.formData, ...data },
        })),

      addRecentProfile: (profile) =>
        set((state) => {
          // Prevent duplicates by checking name and dob
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

          // Keep up to 8 most recent profiles
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
    }),
    {
      name: "astrology-kundali-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
