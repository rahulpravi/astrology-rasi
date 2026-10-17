/**
 * API Client Utility for Astrology Rasi Chart Generator
 * Connects Next.js Frontend to FastAPI Backend
 */

export interface ChartRequestPayload {
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  pob: string; // Place of birth (city name or location)
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

export interface PlanetData {
  name: string;
  sign: string;
  sign_english: string;
  house: number;
  degree: number;
  total_degree: number;
  nakshatra: string;
  pada: number;
  retrograde: boolean;
  // Phase 4: Navamsa (D9) Attributes
  navamsa_sign: string;
  navamsa_sign_english: string;
  navamsa_house: number;
  navamsa_degree: number;
  navamsa_division: number;
  is_vargottama?: boolean;
}

export interface AscendantData {
  sign: string;
  sign_english: string;
  degree: number;
  total_degree: number;
  nakshatra: string;
  pada: number;
  // Phase 4: Navamsa (D9) Attributes
  navamsa_sign: string;
  navamsa_sign_english: string;
  navamsa_degree: number;
  navamsa_division: number;
  is_vargottama?: boolean;
}

export interface ChartData {
  seeker: string;
  datetime: string;
  place_of_birth?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  ayanamsa: string;
  ascendant: AscendantData;
  moon: PlanetData;
  sun: PlanetData;
  planets: PlanetData[];
  houses: Record<string, string[]>;
  d9_houses?: Record<string, string[]>;
}

export interface ChartApiResponse {
  success: boolean;
  data: ChartData;
  detail?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Fetches calculated Vedic Rasi and Navamsa positions from FastAPI.
 * 
 * @param payload - Birth particulars including name, dob, tob, and pob
 * @returns Promise resolving to ChartData
 */
export async function calculateRasiChart(payload: ChartRequestPayload): Promise<ChartData> {
  const endpoint = `${API_BASE_URL}/api/v1/chart/calculate`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: payload.name || "Seeker",
        dob: payload.dob,
        tob: payload.tob,
        pob: payload.pob,
        latitude: payload.latitude,
        longitude: payload.longitude,
        timezone: payload.timezone,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorMessage = typeof errorData.detail === "string" ? errorData.detail : JSON.stringify(errorData.detail);
        }
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const result: ChartApiResponse = await response.json();

    if (!result.success || !result.data) {
      throw new Error(result.detail || "Invalid response received from astrology engine.");
    }

    return result.data;
  } catch (error: any) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error(
        "Could not connect to the Astrology Engine backend. Ensure FastAPI is running on http://localhost:8000."
      );
    }
    throw error;
  }
}
