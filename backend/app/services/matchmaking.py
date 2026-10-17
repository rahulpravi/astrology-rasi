"""
South Indian Vedic Matchmaking (Jathaka Porutham / Dasa Porutham) Engine.
Computes the traditional 10 Poruthams based on Moon Nakshatras, Padas, and Signs (Rasi)
for the Boy and Girl.
"""
from typing import Dict, Any, List, Tuple
from app.services.astrology import AstrologyService, NAKSHATRAS, ZODIAC_SIGNS

# 1. Gana Classification (Deva, Manushya, Rakshasa)
GANA_MAPPING = {
    # Deva (Divine)
    "Ashwini": "Deva", "Mrigashira": "Deva", "Punarvasu": "Deva",
    "Pushya": "Deva", "Hasta": "Deva", "Svati": "Deva",
    "Anuradha": "Deva", "Shravana": "Deva", "Revati": "Deva",
    # Manushya (Human)
    "Bharani": "Manushya", "Rohini": "Manushya", "Ardra": "Manushya",
    "Purva Phalguni": "Manushya", "Uttara Phalguni": "Manushya",
    "Purva Ashadha": "Manushya", "Uttara Ashadha": "Manushya",
    "Purva Bhadrapada": "Manushya", "Uttara Bhadrapada": "Manushya",
    # Rakshasa (Fierce)
    "Krittika": "Rakshasa", "Ashlesha": "Rakshasa", "Magha": "Rakshasa",
    "Chitra": "Rakshasa", "Vishakha": "Rakshasa", "Jyeshtha": "Rakshasa",
    "Mula": "Rakshasa", "Dhanishta": "Rakshasa", "Shatabhisha": "Rakshasa",
}

# 2. Yoni Classification (Animal & Gender)
YONI_MAPPING = {
    "Ashwini": ("Horse", "Male"),
    "Bharani": ("Elephant", "Female"),
    "Krittika": ("Sheep", "Female"),
    "Rohini": ("Serpent", "Male"),
    "Mrigashira": ("Serpent", "Female"),
    "Ardra": ("Dog", "Female"),
    "Punarvasu": ("Cat", "Female"),
    "Pushya": ("Sheep", "Male"),
    "Ashlesha": ("Cat", "Male"),
    "Magha": ("Rat", "Male"),
    "Purva Phalguni": ("Rat", "Female"),
    "Uttara Phalguni": ("Cow", "Male"),
    "Hasta": ("Buffalo", "Female"),
    "Chitra": ("Tiger", "Female"),
    "Svati": ("Buffalo", "Male"),
    "Vishakha": ("Tiger", "Male"),
    "Anuradha": ("Deer", "Female"),
    "Jyeshtha": ("Deer", "Male"),
    "Mula": ("Dog", "Male"),
    "Purva Ashadha": ("Monkey", "Male"),
    "Uttara Ashadha": ("Mongoose", "Male"),
    "Shravana": ("Monkey", "Female"),
    "Dhanishta": ("Lion", "Female"),
    "Shatabhisha": ("Horse", "Female"),
    "Purva Bhadrapada": ("Lion", "Male"),
    "Uttara Bhadrapada": ("Cow", "Female"),
    "Revati": ("Elephant", "Male"),
}

# Sworn Enemy Yoni Animal Pairs (Inimical)
YONI_ENEMIES = {
    frozenset(["Cow", "Tiger"]),
    frozenset(["Elephant", "Lion"]),
    frozenset(["Horse", "Buffalo"]),
    frozenset(["Dog", "Deer"]),
    frozenset(["Serpent", "Mongoose"]),
    frozenset(["Monkey", "Sheep"]),
    frozenset(["Cat", "Rat"]),
}

# 3. Rajju Classification (5 Vital Limbs)
# Siro (Head), Kantha (Neck), Udara (Stomach), Kati (Waist), Pada (Feet)
RAJJU_MAPPING = {
    # Siro Rajju
    "Mrigashira": "Siro", "Chitra": "Siro", "Dhanishta": "Siro",
    # Kantha Rajju
    "Rohini": "Kantha", "Ardra": "Kantha", "Hasta": "Kantha",
    "Svati": "Kantha", "Shravana": "Kantha", "Shatabhisha": "Kantha",
    # Udara / Nabhi Rajju
    "Krittika": "Udara", "Punarvasu": "Udara", "Uttara Phalguni": "Udara",
    "Vishakha": "Udara", "Uttara Ashadha": "Udara", "Purva Bhadrapada": "Udara",
    # Kati Rajju
    "Bharani": "Kati", "Pushya": "Kati", "Purva Phalguni": "Kati",
    "Anuradha": "Kati", "Purva Ashadha": "Kati", "Uttara Bhadrapada": "Kati",
    # Pada Rajju
    "Ashwini": "Pada", "Ashlesha": "Pada", "Magha": "Pada",
    "Jyeshtha": "Pada", "Mula": "Pada", "Revati": "Pada",
}

# 4. Vedha Classification (Mutually Afflicting Star Pairs)
VEDHA_PAIRS = {
    frozenset(["Ashwini", "Jyeshtha"]),
    frozenset(["Bharani", "Anuradha"]),
    frozenset(["Krittika", "Vishakha"]),
    frozenset(["Rohini", "Svati"]),
    frozenset(["Ardra", "Shravana"]),
    frozenset(["Punarvasu", "Uttara Ashadha"]),
    frozenset(["Pushya", "Purva Ashadha"]),
    frozenset(["Ashlesha", "Mula"]),
    frozenset(["Magha", "Revati"]),
    frozenset(["Purva Phalguni", "Uttara Bhadrapada"]),
    frozenset(["Uttara Phalguni", "Purva Bhadrapada"]),
    frozenset(["Hasta", "Shatabhisha"]),
}
# Special mutual Vedha trio
TRIO_VEDHA = {"Mrigashira", "Chitra", "Dhanishta"}

# 5. Vasya (Mutual Attraction of Zodiac Signs)
VASYA_PAIRS = {
    1: [5, 8],      # Mesha -> Simha, Vrischika
    2: [4, 7],      # Vrishabha -> Karkata, Thula
    3: [6],         # Mithuna -> Kanya
    4: [8, 9],      # Karkata -> Vrischika, Dhanu
    5: [7],         # Simha -> Thula
    6: [3, 12],     # Kanya -> Mithuna, Meena
    7: [10, 6],     # Thula -> Makara, Kanya
    8: [4],         # Vrischika -> Karkata
    9: [12],        # Dhanu -> Meena
    10: [1, 11],    # Makara -> Mesha, Kumbha
    11: [1],        # Kumbha -> Mesha
    12: [10],       # Meena -> Makara
}

# 6. Planetary Friendships (Naisargika Maitri)
PLANET_FRIENDSHIPS = {
    "Sun": {"friends": ["Moon", "Mars", "Jupiter"], "neutral": ["Mercury"], "enemies": ["Venus", "Saturn"]},
    "Moon": {"friends": ["Sun", "Mercury"], "neutral": ["Mars", "Jupiter", "Venus", "Saturn"], "enemies": []},
    "Mars": {"friends": ["Sun", "Moon", "Jupiter"], "neutral": ["Venus", "Saturn"], "enemies": ["Mercury"]},
    "Mercury": {"friends": ["Sun", "Venus"], "neutral": ["Mars", "Jupiter", "Saturn"], "enemies": ["Moon"]},
    "Jupiter": {"friends": ["Sun", "Moon", "Mars"], "neutral": ["Saturn"], "enemies": ["Mercury", "Venus"]},
    "Venus": {"friends": ["Mercury", "Saturn"], "neutral": ["Mars", "Jupiter"], "enemies": ["Sun", "Moon"]},
    "Saturn": {"friends": ["Mercury", "Venus"], "neutral": ["Jupiter"], "enemies": ["Sun", "Moon", "Mars"]},
}

class MatchmakingService:
    @staticmethod
    def calculate_dasa_porutham(
        boy_chart: Dict[str, Any],
        girl_chart: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Calculates South Indian Dasa Porutham (10 Matches) from Boy and Girl natal charts.
        """
        boy_moon = boy_chart["moon"]
        girl_moon = girl_chart["moon"]

        boy_nak = boy_moon["nakshatra"]
        girl_nak = girl_moon["nakshatra"]

        boy_pada = boy_moon["pada"]
        girl_pada = girl_moon["pada"]

        boy_rasi_name = boy_moon["sign"]
        girl_rasi_name = girl_moon["sign"]

        # Indices (1-indexed)
        b_nak_idx = NAKSHATRAS.index(boy_nak) + 1
        g_nak_idx = NAKSHATRAS.index(girl_nak) + 1

        b_sign_obj = next(s for s in ZODIAC_SIGNS if s["sanskrit"] == boy_rasi_name)
        g_sign_obj = next(s for s in ZODIAC_SIGNS if s["sanskrit"] == girl_rasi_name)

        b_rasi_idx = b_sign_obj["index"]
        g_rasi_idx = g_sign_obj["index"]

        b_lord = b_sign_obj["lord"]
        g_lord = g_sign_obj["lord"]

        # Counting from Girl to Boy (Standard South Indian Rule)
        nak_distance = ((b_nak_idx - g_nak_idx) % 27) + 1
        rasi_distance = ((b_rasi_idx - g_rasi_idx) % 12) + 1

        poruthams = []

        # ---------------------------------------------------------
        # 1. Dinam (Health, prosperity, day-to-day harmony)
        # ---------------------------------------------------------
        tara_rem = nak_distance % 9
        if tara_rem == 0:
            tara_rem = 9

        # Tara classifications: 2 (Sampat), 4 (Kshema), 6 (Sadhana), 8 (Mitra), 9 (Parama Mitra)
        if tara_rem in [2, 4, 6, 8, 9]:
            dina_status = "Match"
            dina_score = 1.0
            tara_names = {2: "Sampat", 4: "Kshema", 6: "Sadhana", 8: "Mitra", 9: "Parama Mitra"}
            dina_details = f"Auspicious {tara_names[tara_rem]} Tara (Distance: {nak_distance}). Fosters health and long life."
        elif b_nak_idx == g_nak_idx:
            # Eka Nakshatra (Same Star)
            if girl_pada != boy_pada:
                dina_status = "Neutral"
                dina_score = 0.5
                dina_details = f"Same Nakshatra ({girl_nak}) with different Padas. Acceptable."
            else:
                dina_status = "No Match"
                dina_score = 0.0
                dina_details = f"Identical Nakshatra ({girl_nak}) and Pada. Not recommended for Dinam."
        else:
            inaspicious_tara = {1: "Janma", 3: "Vipat", 5: "Pratyak", 7: "Naidhana/Vadha"}
            dina_status = "No Match"
            dina_score = 0.0
            dina_details = f"Inauspicious {inaspicious_tara.get(tara_rem, 'Trik')} Tara (Distance: {nak_distance})."

        poruthams.append({
            "id": "dinam",
            "name": "Dinam",
            "sanskrit_name": "Dina Porutham",
            "status": dina_status,
            "score": dina_score,
            "max_score": 1.0,
            "meaning": "Health & Prosperity",
            "description": "Evaluates physical vitality, freedom from illness, and day-to-day domestic happiness.",
            "details": dina_details,
        })

        # ---------------------------------------------------------
        # 2. Ganam (Temperament & mutual nature)
        # ---------------------------------------------------------
        b_gana = GANA_MAPPING[boy_nak]
        g_gana = GANA_MAPPING[girl_nak]

        if b_gana == g_gana:
            gana_status = "Match"
            gana_score = 1.0
            gana_details = f"Both belong to {g_gana} Gana. Excellent temperament compatibility."
        elif (g_gana == "Deva" and b_gana == "Manushya") or (g_gana == "Manushya" and b_gana == "Deva"):
            gana_status = "Match"
            gana_score = 1.0
            gana_details = f"Union of {g_gana} (Girl) and {b_gana} (Boy) produces good domestic harmony."
        elif g_gana == "Deva" and b_gana == "Rakshasa":
            gana_status = "Neutral"
            gana_score = 0.5
            gana_details = "Girl is Deva and Boy is Rakshasa; acceptable with moderate adjustment."
        elif g_gana == "Manushya" and b_gana == "Rakshasa":
            if nak_distance > 14:
                gana_status = "Neutral"
                gana_score = 0.5
                gana_details = "Boy is Rakshasa and Girl is Manushya, softened by comfortable distance (>14)."
            else:
                gana_status = "No Match"
                gana_score = 0.0
                gana_details = "Boy is Rakshasa and Girl is Manushya. Temperament clashes likely."
        else:
            # Girl is Rakshasa while Boy is Deva or Manushya
            gana_status = "No Match"
            gana_score = 0.0
            gana_details = f"Girl is {g_gana} and Boy is {b_gana}. Classical texts advise against this combination."

        poruthams.append({
            "id": "ganam",
            "name": "Ganam",
            "sanskrit_name": "Gana Porutham",
            "status": gana_status,
            "score": gana_score,
            "max_score": 1.0,
            "meaning": "Temperament Compatibility",
            "description": "Determines mental wavelength, emotional temperament, and harmonious coexistence.",
            "details": gana_details,
        })

        # ---------------------------------------------------------
        # 3. Yoni (Physical / sexual compatibility & mutual attraction)
        # ---------------------------------------------------------
        b_animal, b_gender = YONI_MAPPING[boy_nak]
        g_animal, g_gender = YONI_MAPPING[girl_nak]

        animal_pair = frozenset([b_animal, g_animal])

        if animal_pair in YONI_ENEMIES:
            yoni_status = "No Match"
            yoni_score = 0.0
            yoni_details = f"Inimical Yoni pair: {g_animal} (Girl) vs {b_animal} (Boy). Sworn enemies in nature."
        elif b_animal == g_animal:
            yoni_status = "Match"
            yoni_score = 1.0
            if b_gender != g_gender:
                yoni_details = f"Ideal same-animal pair ({g_animal}) of complementary genders. Supreme physical compatibility."
            else:
                yoni_details = f"Same animal ({g_animal}). High mutual affection and understanding."
        else:
            yoni_status = "Match"
            yoni_score = 1.0
            yoni_details = f"Harmonious non-inimical Yoni species ({g_animal} & {b_animal}). Friendly physical union."

        poruthams.append({
            "id": "yoni",
            "name": "Yoni",
            "sanskrit_name": "Yoni Porutham",
            "status": yoni_status,
            "score": yoni_score,
            "max_score": 1.0,
            "meaning": "Physical & Intimate Harmony",
            "description": "Ensures mutual physical attraction, intimacy, and biological compatibility.",
            "details": yoni_details,
        })

        # ---------------------------------------------------------
        # 4. Rasi (Emotional harmony & family growth)
        # ---------------------------------------------------------
        # rasi_distance: Count from Girl to Boy (1 to 12)
        if rasi_distance == 7:
            rasi_status = "Match"
            rasi_score = 1.0
            rasi_details = f"Sama Saptama (7th house aspect between {girl_rasi_name} & {boy_rasi_name}). Highly auspicious balance."
        elif rasi_distance in [3, 4, 10, 11]:
            rasi_status = "Match"
            rasi_score = 1.0
            rasi_details = f"Auspicious Rasi distance of {rasi_distance} houses ({girl_rasi_name} to {boy_rasi_name}). Promotes domestic prosperity."
        elif rasi_distance == 1:
            if b_nak_idx >= g_nak_idx:
                rasi_status = "Match"
                rasi_score = 1.0
                rasi_details = f"Same Rasi ({girl_rasi_name}) with Boy's star leading or equal. Auspicious."
            else:
                rasi_status = "Neutral"
                rasi_score = 0.5
                rasi_details = f"Same Rasi ({girl_rasi_name}) with Girl's star leading. Acceptable."
        elif rasi_distance in [5, 9]:
            # Nava-Panchama (Triplicity)
            if b_lord == g_lord or b_rasi_idx == g_rasi_idx:
                rasi_status = "Match"
                rasi_score = 1.0
                rasi_details = f"Nava-Panchama (9th/5th) with friendly planetary lords ({girl_rasi_name} & {boy_rasi_name}). Auspicious."
            else:
                rasi_status = "Neutral"
                rasi_score = 0.5
                rasi_details = f"Nava-Panchama relation between {girl_rasi_name} & {boy_rasi_name}. Moderate harmony."
        elif rasi_distance in [2, 12]:
            # Dwi-Dwadasa
            rasi_status = "No Match"
            rasi_score = 0.0
            rasi_details = f"Dwi-Dwadasa (2nd/12th placement) between {girl_rasi_name} and {boy_rasi_name}. Can lead to expenditure and ego friction."
        elif rasi_distance in [6, 8]:
            # Shashtashtaka Dosha
            rasi_status = "No Match"
            rasi_score = 0.0
            rasi_details = f"Shashtashtaka (6th/8th axis) between {girl_rasi_name} and {boy_rasi_name}. Classical Dosha indicating conflict."
        else:
            rasi_status = "Neutral"
            rasi_score = 0.5
            rasi_details = f"Rasi distance: {rasi_distance} from {girl_rasi_name} to {boy_rasi_name}."

        poruthams.append({
            "id": "rasi",
            "name": "Rasi",
            "sanskrit_name": "Rasi Porutham",
            "status": rasi_status,
            "score": rasi_score,
            "max_score": 1.0,
            "meaning": "Emotional & Mental Harmony",
            "description": "Examines Moon sign affinity, psychological wavelength, and prosperity of children.",
            "details": rasi_details,
        })

        # ---------------------------------------------------------
        # 5. Rasyadhipa (Graha Maitri / Lords Friendship)
        # ---------------------------------------------------------
        if b_lord == g_lord:
            adhipa_status = "Match"
            adhipa_score = 1.0
            adhipa_details = f"Identical planetary lord ({b_lord}). Supreme planetary friendship."
        else:
            g_rel_to_b = "friends" if b_lord in PLANET_FRIENDSHIPS[g_lord]["friends"] else ("neutral" if b_lord in PLANET_FRIENDSHIPS[g_lord]["neutral"] else "enemies")
            b_rel_to_g = "friends" if g_lord in PLANET_FRIENDSHIPS[b_lord]["friends"] else ("neutral" if g_lord in PLANET_FRIENDSHIPS[b_lord]["neutral"] else "enemies")

            if g_rel_to_b == "friends" and b_rel_to_g == "friends":
                adhipa_status = "Match"
                adhipa_score = 1.0
                adhipa_details = f"Mutual best friends ({g_lord} & {b_lord}). Fosters deep long-term friendship."
            elif (g_rel_to_b == "friends" and b_rel_to_g == "neutral") or (g_rel_to_b == "neutral" and b_rel_to_g == "friends"):
                adhipa_status = "Match"
                adhipa_score = 1.0
                adhipa_details = f"Friendly relationship between {g_lord} and {b_lord}."
            elif g_rel_to_b == "neutral" and b_rel_to_g == "neutral":
                adhipa_status = "Neutral"
                adhipa_score = 0.5
                adhipa_details = f"Neutral relationship between sign rulers ({g_lord} & {b_lord})."
            elif (g_rel_to_b == "friends" and b_rel_to_g == "enemies") or (g_rel_to_b == "enemies" and b_rel_to_g == "friends"):
                adhipa_status = "Neutral"
                adhipa_score = 0.5
                adhipa_details = f"Mixed planetary affinity between {g_lord} and {b_lord}."
            else:
                adhipa_status = "No Match"
                adhipa_score = 0.0
                adhipa_details = f"Planetary enmity between sign lords ({g_lord} vs {b_lord})."

        poruthams.append({
            "id": "rasyadhipa",
            "name": "Rasyadhipa",
            "sanskrit_name": "Rasi Adhipati Porutham",
            "status": adhipa_status,
            "score": adhipa_score,
            "max_score": 1.0,
            "meaning": "Planetary Lord Affinity",
            "description": "Measures friendship between the ruling planetary lords of the two Moon signs.",
            "details": adhipa_details,
        })

        # ---------------------------------------------------------
        # 6. Rajju (Vital Longevity of the Union & Mangalya)
        # ---------------------------------------------------------
        b_rajju = RAJJU_MAPPING[boy_nak]
        g_rajju = RAJJU_MAPPING[girl_nak]

        if b_rajju != g_rajju:
            rajju_status = "Match"
            rajju_score = 1.0
            rajju_details = f"Auspicious! Girl is in {g_rajju} Rajju and Boy is in {b_rajju} Rajju. No Rajju Dosha."
        else:
            rajju_status = "No Match"
            rajju_score = 0.0
            rajju_descriptions = {
                "Siro": "Siro (Head) Rajju Dosha - impacts husband's longevity",
                "Kantha": "Kantha (Neck) Rajju Dosha - affects wife's health and happiness",
                "Udara": "Udara (Stomach) Rajju Dosha - affects progeny and lineage",
                "Kati": "Kati (Waist) Rajju Dosha - leads to financial or vitality strains",
                "Pada": "Pada (Feet) Rajju Dosha - causes instability and wanderings",
            }
            rajju_details = f"Rajju Dosha: Both belong to the same {b_rajju} Rajju ({rajju_descriptions.get(b_rajju, '')})."

        poruthams.append({
            "id": "rajju",
            "name": "Rajju",
            "sanskrit_name": "Rajju Porutham",
            "status": rajju_status,
            "score": rajju_score,
            "max_score": 1.0,
            "meaning": "Longevity & Marital Bond",
            "description": "The paramount South Indian match ensuring longevity, marital security, and lasting union.",
            "details": rajju_details,
        })

        # ---------------------------------------------------------
        # 7. Vedha (Repulsion / Affliction Check)
        # ---------------------------------------------------------
        pair_set = frozenset([boy_nak, girl_nak])
        is_vedha = (pair_set in VEDHA_PAIRS) or (boy_nak in TRIO_VEDHA and girl_nak in TRIO_VEDHA and boy_nak != girl_nak)

        if not is_vedha:
            vedha_status = "Match"
            vedha_score = 1.0
            vedha_details = f"No Vedha affliction between {girl_nak} and {boy_nak}. Harmonious alignment."
        else:
            vedha_status = "No Match"
            vedha_score = 0.0
            vedha_details = f"Vedha Dosha detected: {girl_nak} and {boy_nak} form an inimical/repulsive star axis."

        poruthams.append({
            "id": "vedha",
            "name": "Vedha",
            "sanskrit_name": "Vedha Porutham",
            "status": vedha_status,
            "score": vedha_score,
            "max_score": 1.0,
            "meaning": "Freedom from Affliction",
            "description": "Checks for occult repulsion or planetary affliction that might disrupt peace.",
            "details": vedha_details,
        })

        # ---------------------------------------------------------
        # 8. Vasya (Mutual Attraction & Magnetic Pull)
        # ---------------------------------------------------------
        is_b_in_g_vasya = b_rasi_idx in VASYA_PAIRS.get(g_rasi_idx, [])
        is_g_in_b_vasya = g_rasi_idx in VASYA_PAIRS.get(b_rasi_idx, [])

        if is_b_in_g_vasya or is_g_in_b_vasya:
            vasya_status = "Match"
            vasya_score = 1.0
            vasya_details = f"Vasya exists between {girl_rasi_name} and {boy_rasi_name}. Creates mutual attraction and devotion."
        else:
            vasya_status = "Neutral"
            vasya_score = 0.5
            vasya_details = f"No direct Vasya between {girl_rasi_name} and {boy_rasi_name}. General cordiality applies."

        poruthams.append({
            "id": "vasya",
            "name": "Vasya",
            "sanskrit_name": "Vasya Porutham",
            "status": vasya_status,
            "score": vasya_score,
            "max_score": 1.0,
            "meaning": "Magnetic Attraction & Devotion",
            "description": "Assesses magnetic pull, mutual affection, and obedience between spouses.",
            "details": vasya_details,
        })

        # ---------------------------------------------------------
        # 9. Mahendra (Progeny, Wealth, and Lineage)
        # ---------------------------------------------------------
        # Favorable distance counts: 4, 7, 10, 13, 16, 19, 22, 25
        if nak_distance in [4, 7, 10, 13, 16, 19, 22, 25]:
            mahendra_status = "Match"
            mahendra_score = 1.0
            mahendra_details = f"Star count is {nak_distance}. Mahendra Porutham present, blessing children and wealth."
        else:
            mahendra_status = "No Match"
            mahendra_score = 0.0
            mahendra_details = f"Star count is {nak_distance} (outside auspicious Mahendra series: 4, 7, 10, 13, 16, 19, 22, 25)."

        poruthams.append({
            "id": "mahendra",
            "name": "Mahendra",
            "sanskrit_name": "Mahendra Porutham",
            "status": mahendra_status,
            "score": mahendra_score,
            "max_score": 1.0,
            "meaning": "Progeny & Lineage Growth",
            "description": "Fosters the healthy continuation of family lineage, prosperity, and blessings of children.",
            "details": mahendra_details,
        })

        # ---------------------------------------------------------
        # 10. Stree Deergha (Wife's Long-Term Well-being & Happiness)
        # ---------------------------------------------------------
        if nak_distance >= 14:
            stree_status = "Match"
            stree_score = 1.0
            stree_details = f"Auspicious star distance of {nak_distance} (>= 14). Bestows long life, beauty, and happiness to bride."
        elif nak_distance in range(8, 14):
            stree_status = "Neutral"
            stree_score = 0.5
            stree_details = f"Moderate star distance of {nak_distance} (8-13). Acceptable stability for the bride."
        else:
            stree_status = "No Match"
            stree_score = 0.0
            stree_details = f"Star distance is {nak_distance} (< 8). Stree Deergha not satisfied."

        poruthams.append({
            "id": "stree_deergha",
            "name": "Stree Deergha",
            "sanskrit_name": "Stree Deergha Porutham",
            "status": stree_status,
            "score": stree_score,
            "max_score": 1.0,
            "meaning": "Bride's Prosperity & Auspiciousness",
            "description": "Guarantees prosperity, safety, health, and uninterrupted happiness for the wife.",
            "details": stree_details,
        })

        # ---------------------------------------------------------
        # Final Score & Verdict Calculation
        # ---------------------------------------------------------
        total_score = sum(p["score"] for p in poruthams)
        percentage = round((total_score / 10.0) * 100, 1)

        # Classical Verdict Logic:
        # Rajju is the single most critical factor: if Rajju fails, match is categorized as Adhamam
        is_rajju_match = (rajju_status == "Match")

        if total_score >= 7.0 and is_rajju_match:
            verdict = "Uthamam"
            verdict_label = "Highly Compatible (Uthamam / ഉത്തമം)"
            summary = "Excellent astrological match! The alliance enjoys strong compatibility across temperament, vitality, and marital longevity."
        elif total_score >= 5.0 and is_rajju_match:
            verdict = "Madhyamam"
            verdict_label = "Moderate Compatibility (Madhyamam / മധ്യമം)"
            summary = "A good, viable match. Key essential criteria like Rajju are satisfied. Moderate remedial prayers can enhance harmony."
        else:
            verdict = "Adhamam"
            verdict_label = "Low Compatibility (Adhamam / അധമം)"
            if not is_rajju_match:
                summary = "Critical Rajju Dosha detected. Classical Vedic astrology cautions against this alliance due to longevity concerns."
            else:
                summary = "Low overall compatibility score (< 5/10). Inherent temperament or emotional differences may cause disharmony."

        return {
            "boy": {
                "name": boy_chart.get("seeker", "Boy"),
                "rasi": boy_rasi_name,
                "rasi_english": b_sign_obj["english"],
                "nakshatra": boy_nak,
                "pada": boy_pada,
                "degree": boy_moon["degree"],
                "lord": b_lord,
                "gana": b_gana,
                "yoni_animal": b_animal,
                "yoni_gender": b_gender,
                "rajju": b_rajju,
            },
            "girl": {
                "name": girl_chart.get("seeker", "Girl"),
                "rasi": girl_rasi_name,
                "rasi_english": g_sign_obj["english"],
                "nakshatra": girl_nak,
                "pada": girl_pada,
                "degree": girl_moon["degree"],
                "lord": g_lord,
                "gana": g_gana,
                "yoni_animal": g_animal,
                "yoni_gender": g_gender,
                "rajju": g_rajju,
            },
            "poruthams": poruthams,
            "score": total_score,
            "total_poruthams": 10,
            "percentage": percentage,
            "verdict": verdict,
            "verdict_label": verdict_label,
            "summary": summary,
        }
