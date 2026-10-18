"use client";

import { useTranslations } from "next-intl";

/**
 * Custom React Hook providing centralized, multilingual translations
 * for Vedic Astrological entities (Grahas, Rasis, Nakshatras, Ganas, Rajjus).
 * Dynamically maps API response strings to the active locale dictionary.
 */
export function useAstroTranslation() {
  const tTerms = useTranslations("terms");
  const tAstrology = useTranslations("astrology");

  /**
   * Translates Graha / Planet name: "Sun", "Moon", "Mars", "Ascendant", etc.
   */
  const translatePlanet = (name?: string | null): string => {
    if (!name) return "";
    const clean = name.trim();
    const key = clean.toLowerCase().replace(/\s+/g, "_");
    try {
      const res = tTerms(`planets.${key}`);
      if (res && res !== `terms.planets.${key}`) return res;
    } catch {
      // fallback to astrology.planets
    }

    try {
      const res = tAstrology(`planets.${key}`);
      if (res && res !== `astrology.planets.${key}`) return res;
    } catch {
      // fallback
    }

    return clean;
  };

  /**
   * Translates Rasi / Zodiac sign: "Aries", "Mesha", "Taurus", "Vrishabha", etc.
   */
  const translateSign = (sign?: string | null): string => {
    if (!sign) return "";
    const clean = sign.trim();
    const key = clean.toLowerCase().replace(/\s+/g, "_");
    try {
      const res = tTerms(`rasis.${key}`);
      if (res && res !== `terms.rasis.${key}`) return res;
    } catch {
      // fallback to astrology.signs
    }

    try {
      const res = tAstrology(`signs.${key}`);
      if (res && res !== `astrology.signs.${key}`) return res;
    } catch {
      // fallback
    }

    return clean;
  };

  /**
   * Translates Nakshatra: "Ashwini", "Bharani", "Purva Phalguni", etc.
   */
  const translateNakshatra = (nak?: string | null): string => {
    if (!nak) return "";
    const clean = nak.trim();
    const key = clean.toLowerCase().replace(/\s+/g, "_");
    try {
      const res = tTerms(`nakshatras.${key}`);
      if (res && res !== `terms.nakshatras.${key}`) return res;
    } catch {
      // fallback to astrology.nakshatras
    }

    try {
      const res = tAstrology(`nakshatras.${key}`);
      if (res && res !== `astrology.nakshatras.${key}`) return res;
    } catch {
      // fallback
    }

    return clean;
  };

  /**
   * Translates Gana: "Deva", "Manushya", "Rakshasa"
   */
  const translateGana = (gana?: string | null): string => {
    if (!gana) return "";
    const clean = gana.trim();
    const key = clean.toLowerCase().replace(/\s+/g, "_");
    try {
      const res = tTerms(`ganas.${key}`);
      if (res && res !== `terms.ganas.${key}`) return res;
    } catch {
      // fallback
    }
    return clean;
  };

  /**
   * Translates Rajju: "Shiro (Head)", "Kantha (Neck)", "Shiro", etc.
   */
  const translateRajju = (rajju?: string | null): string => {
    if (!rajju) return "";
    const clean = rajju.trim();
    const firstWord = clean.split(/[\s(]/)[0].toLowerCase();
    try {
      const res = tTerms(`rajjus.${firstWord}`);
      if (res && res !== `terms.rajjus.${firstWord}`) return res;
    } catch {
      // fallback
    }
    return clean;
  };

  return {
    translatePlanet,
    translateSign,
    translateNakshatra,
    translateGana,
    translateRajju,
    translateLord: translatePlanet,
  };
}
