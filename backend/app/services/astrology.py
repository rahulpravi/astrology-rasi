"""
High-Precision Vedic Astrology & Planetary Computation Engine
Utilizes Swiss Ephemeris (pysweph) with Lahiri (Chitra Paksha) Ayanamsa.
Computes D1 (Janma Rasi) and D9 (Navamsa) Harmonic Charts.
"""
from typing import Dict, Any, List
from datetime import datetime
import pytz

try:
    import swisseph as swe
    SWISSEPH_AVAILABLE = True
except ImportError:
    SWISSEPH_AVAILABLE = False

# 12 Rasi (Zodiac Signs) in Sanskrit & English
ZODIAC_SIGNS = [
    {"index": 1, "sanskrit": "Mesha", "english": "Aries", "element": "Fire", "lord": "Mars"},
    {"index": 2, "sanskrit": "Vrishabha", "english": "Taurus", "element": "Earth", "lord": "Venus"},
    {"index": 3, "sanskrit": "Mithuna", "english": "Gemini", "element": "Air", "lord": "Mercury"},
    {"index": 4, "sanskrit": "Karkata", "english": "Cancer", "element": "Water", "lord": "Moon"},
    {"index": 5, "sanskrit": "Simha", "english": "Leo", "element": "Fire", "lord": "Sun"},
    {"index": 6, "sanskrit": "Kanya", "english": "Virgo", "element": "Earth", "lord": "Mercury"},
    {"index": 7, "sanskrit": "Thula", "english": "Libra", "element": "Air", "lord": "Venus"},
    {"index": 8, "sanskrit": "Vrischika", "english": "Scorpio", "element": "Water", "lord": "Mars"},
    {"index": 9, "sanskrit": "Dhanu", "english": "Sagittarius", "element": "Fire", "lord": "Jupiter"},
    {"index": 10, "sanskrit": "Makara", "english": "Capricorn", "element": "Earth", "lord": "Saturn"},
    {"index": 11, "sanskrit": "Kumbha", "english": "Aquarius", "element": "Air", "lord": "Saturn"},
    {"index": 12, "sanskrit": "Meena", "english": "Pisces", "element": "Water", "lord": "Jupiter"},
]

# 27 Lunar Mansions (Nakshatras)
NAKSHATRAS = [
    "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
    "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
    "Hasta", "Chitra", "Svati", "Vishakha", "Anuradha", "Jyeshtha",
    "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
    "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
]

def deg_to_nakshatra(longitude: float) -> tuple[str, int]:
    """Calculate Nakshatra (1-27) and Pada (1-4) from 0-360 longitude."""
    deg_per_nak = 360.0 / 27.0  # 13.333333 degrees
    deg_per_pada = deg_per_nak / 4.0  # 3.333333 degrees
    nak_idx = int(longitude / deg_per_nak) % 27
    remainder = longitude % deg_per_nak
    pada = int(remainder / deg_per_pada) + 1
    return NAKSHATRAS[nak_idx], min(pada, 4)

def deg_to_rasi(longitude: float) -> tuple[dict, float]:
    """Return Rasi sign object and degree within the sign (0-30)."""
    norm_deg = longitude % 360.0
    sign_idx = int(norm_deg / 30.0)
    deg_in_sign = norm_deg % 30.0
    return ZODIAC_SIGNS[sign_idx], deg_in_sign

def calculate_navamsa(sign_index: int, deg_in_sign: float) -> tuple[dict, float, int]:
    """
    Calculates the Navamsa (D9) sign, harmonic degree in Navamsa, and division index (1-9)
    based on the classical Parashari Vedic element/triplicity rule:
    
    Mathematical Logic:
    1. Each 30° zodiac sign is divided into 9 equal Navamsa segments of 3° 20' (3.333333°) each.
    2. The starting sign of the first Navamsa depends on the elemental triplicity of the Rasi sign:
       - Fire Signs (Mesha/1, Simha/5, Dhanu/9): Start from Mesha (Aries = 1).
       - Earth Signs (Vrishabha/2, Kanya/6, Makara/10): Start from Makara (Capricorn = 10).
       - Air Signs (Mithuna/3, Thula/7, Kumbha/11): Start from Thula (Libra = 7).
       - Water Signs (Karkata/4, Vrischika/8, Meena/12): Start from Karkata (Cancer = 4).
    3. The n-th Navamsa division (0-8) moves sequentially clockwise from this starting sign.
    
    Returns:
        (navamsa_sign_dict, degree_in_navamsa_scaled_to_30, navamsa_division_1_to_9)
    """
    NAVAMSA_SPAN = 30.0 / 9.0  # 3° 20' = 3.3333333333333335°
    
    # Navamsa segment within the sign: 0 to 8
    nav_division_idx = int(deg_in_sign / NAVAMSA_SPAN)
    nav_division_idx = min(max(nav_division_idx, 0), 8)
    
    # Starting sign determined by elemental triplicity
    if sign_index in [1, 5, 9]:       # Fire Triplicity: Aries, Leo, Sagittarius
        start_sign_idx = 1             # Mesha (Aries)
    elif sign_index in [2, 6, 10]:    # Earth Triplicity: Taurus, Virgo, Capricorn
        start_sign_idx = 10            # Makara (Capricorn)
    elif sign_index in [3, 7, 11]:    # Air Triplicity: Gemini, Libra, Aquarius
        start_sign_idx = 7             # Thula (Libra)
    else:                             # Water Triplicity: Cancer, Scorpio, Pisces
        start_sign_idx = 4             # Karkata (Cancer)
        
    # Resulting Navamsa sign index (1-12)
    nav_sign_idx = ((start_sign_idx - 1 + nav_division_idx) % 12) + 1
    nav_sign_obj = ZODIAC_SIGNS[nav_sign_idx - 1]
    
    # Harmonic degree within the Navamsa sign scaled to 0° - 30°
    deg_in_navamsa = (deg_in_sign % NAVAMSA_SPAN) * 9.0
    
    return nav_sign_obj, deg_in_navamsa, nav_division_idx + 1

class AstrologyService:
    @staticmethod
    def calculate_chart(name: str, dob: str, tob: str, lat: float, lon: float, tz: str = "Asia/Kolkata") -> Dict[str, Any]:
        """
        Calculates exact Vedic Sidereal positions (Lahiri Ayanamsa) using Swiss Ephemeris.
        Produces both D1 (Rasi) and D9 (Navamsa) harmonic placements.
        """
        # Parse Local Date & Time to UTC
        try:
            local_tz = pytz.timezone(tz)
        except Exception:
            local_tz = pytz.timezone("Asia/Kolkata")

        dt_str = f"{dob} {tob}"
        local_dt = datetime.strptime(dt_str, "%Y-%m-%d %H:%M")
        localized_dt = local_tz.localize(local_dt)
        utc_dt = localized_dt.astimezone(pytz.utc)

        # Decimal hours in UTC
        decimal_hour = utc_dt.hour + utc_dt.minute / 60.0 + utc_dt.second / 3600.0

        if not SWISSEPH_AVAILABLE:
            raise RuntimeError("Swiss Ephemeris package is not available.")

        # Initialize Swiss Ephemeris Sidereal Lahiri Mode
        swe.set_sid_mode(swe.SIDM_LAHIRI)
        jd = swe.julday(utc_dt.year, utc_dt.month, utc_dt.day, decimal_hour)

        # 1. Calculate Lagna (Ascendant) & Houses
        cusps, ascmc = swe.houses(jd, lat, lon, b'E')
        lagna_deg = ascmc[0] % 360.0
        lagna_sign, lagna_deg_in_sign = deg_to_rasi(lagna_deg)
        lagna_nak, lagna_pada = deg_to_nakshatra(lagna_deg)
        lagna_sign_idx = lagna_sign["index"]  # 1-based (1..12)

        # Calculate D9 Navamsa for Lagna
        lagna_nav_sign, lagna_nav_deg, lagna_nav_div = calculate_navamsa(lagna_sign_idx, lagna_deg_in_sign)
        lagna_nav_sign_idx = lagna_nav_sign["index"]

        # 2. Celestial Bodies to Compute
        celestial_targets = [
            ("Sun", swe.SUN),
            ("Moon", swe.MOON),
            ("Mars", swe.MARS),
            ("Mercury", swe.MERCURY),
            ("Jupiter", swe.JUPITER),
            ("Venus", swe.VENUS),
            ("Saturn", swe.SATURN),
            ("Rahu", swe.MEAN_NODE),
        ]

        planets_data: List[Dict[str, Any]] = []
        d1_houses_dict: Dict[str, List[str]] = {str(i): [] for i in range(1, 13)}
        d1_houses_dict["1"].append("Lagna")

        d9_houses_dict: Dict[str, List[str]] = {str(i): [] for i in range(1, 13)}
        d9_houses_dict["1"].append("Lagna")

        moon_details = {}
        sun_details = {}

        for planet_name, planet_id in celestial_targets:
            res, flag, err = swe.calc_ut(jd, planet_id, swe.FLG_SIDEREAL | swe.FLG_SPEED)
            deg = res[0] % 360.0
            speed = res[3]
            is_retro = bool(speed < 0)

            sign_obj, deg_in_sign = deg_to_rasi(deg)
            nak_name, pada_num = deg_to_nakshatra(deg)

            # D1 Vedic House = (Sign Index - Lagna Sign Index) % 12 + 1
            d1_house_num = ((sign_obj["index"] - lagna_sign_idx) % 12) + 1
            d1_houses_dict[str(d1_house_num)].append(planet_name)

            # D9 Navamsa Calculation
            nav_sign, nav_deg, nav_div = calculate_navamsa(sign_obj["index"], deg_in_sign)
            d9_house_num = ((nav_sign["index"] - lagna_nav_sign_idx) % 12) + 1
            d9_houses_dict[str(d9_house_num)].append(planet_name)

            is_vargottama = bool(sign_obj["index"] == nav_sign["index"])

            p_info = {
                "name": planet_name,
                "sign": sign_obj["sanskrit"],
                "sign_english": sign_obj["english"],
                "house": d1_house_num,
                "degree": round(deg_in_sign, 2),
                "total_degree": round(deg, 4),
                "nakshatra": nak_name,
                "pada": pada_num,
                "retrograde": is_retro,
                # D9 Navamsa Attributes
                "navamsa_sign": nav_sign["sanskrit"],
                "navamsa_sign_english": nav_sign["english"],
                "navamsa_house": d9_house_num,
                "navamsa_degree": round(nav_deg, 2),
                "navamsa_division": nav_div,
                "is_vargottama": is_vargottama
            }
            planets_data.append(p_info)

            if planet_name == "Moon":
                moon_details = p_info
            elif planet_name == "Sun":
                sun_details = p_info

        # 3. Calculate Ketu (180 degrees directly opposite to Rahu)
        rahu_entry = next(p for p in planets_data if p["name"] == "Rahu")
        ketu_deg = (rahu_entry["total_degree"] + 180.0) % 360.0
        ketu_sign, ketu_deg_in_sign = deg_to_rasi(ketu_deg)
        ketu_nak, ketu_pada = deg_to_nakshatra(ketu_deg)
        
        ketu_d1_house = ((ketu_sign["index"] - lagna_sign_idx) % 12) + 1
        d1_houses_dict[str(ketu_d1_house)].append("Ketu")

        ketu_nav_sign, ketu_nav_deg, ketu_nav_div = calculate_navamsa(ketu_sign["index"], ketu_deg_in_sign)
        ketu_d9_house = ((ketu_nav_sign["index"] - lagna_nav_sign_idx) % 12) + 1
        d9_houses_dict[str(ketu_d9_house)].append("Ketu")

        is_ketu_vargottama = bool(ketu_sign["index"] == ketu_nav_sign["index"])

        planets_data.append({
            "name": "Ketu",
            "sign": ketu_sign["sanskrit"],
            "sign_english": ketu_sign["english"],
            "house": ketu_d1_house,
            "degree": round(ketu_deg_in_sign, 2),
            "total_degree": round(ketu_deg, 4),
            "nakshatra": ketu_nak,
            "pada": ketu_pada,
            "retrograde": True,
            # D9 Navamsa Attributes
            "navamsa_sign": ketu_nav_sign["sanskrit"],
            "navamsa_sign_english": ketu_nav_sign["english"],
            "navamsa_house": ketu_d9_house,
            "navamsa_degree": round(ketu_nav_deg, 2),
            "navamsa_division": ketu_nav_div,
            "is_vargottama": is_ketu_vargottama
        })

        is_lagna_vargottama = bool(lagna_sign_idx == lagna_nav_sign_idx)

        return {
            "seeker": name,
            "datetime": f"{dob}T{tob}",
            "coordinates": {"latitude": lat, "longitude": lon},
            "ayanamsa": "Lahiri (Chitra Paksha)",
            "ascendant": {
                "sign": lagna_sign["sanskrit"],
                "sign_english": lagna_sign["english"],
                "degree": round(lagna_deg_in_sign, 2),
                "total_degree": round(lagna_deg, 4),
                "nakshatra": lagna_nak,
                "pada": lagna_pada,
                # D9 Navamsa for Lagna
                "navamsa_sign": lagna_nav_sign["sanskrit"],
                "navamsa_sign_english": lagna_nav_sign["english"],
                "navamsa_degree": round(lagna_nav_deg, 2),
                "navamsa_division": lagna_nav_div,
                "is_vargottama": is_lagna_vargottama
            },
            "moon": moon_details,
            "sun": sun_details,
            "planets": planets_data,
            "houses": d1_houses_dict,
            "d9_houses": d9_houses_dict
        }
