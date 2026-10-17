from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.astrology import AstrologyService
from app.services.matchmaking import MatchmakingService
from app.api.v1.routes.chart import POPULAR_CITIES, tf
from geopy.geocoders import Nominatim

router = APIRouter()

class BirthDetails(BaseModel):
    name: Optional[str] = Field("Seeker", description="Name of the person")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD")
    tob: str = Field(..., description="Time of birth in HH:MM (24-hour format)")
    pob: Optional[str] = Field(None, description="Place of Birth name or city")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude of birth location")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude of birth location")
    timezone: Optional[str] = Field(None, description="IANA Timezone string")

class MatchRequest(BaseModel):
    boy: BirthDetails
    girl: BirthDetails

class MatchResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

def resolve_location(details: BirthDetails) -> tuple[float, float, str]:
    """Helper to resolve latitude, longitude, and timezone for a person."""
    lat = details.latitude
    lon = details.longitude
    tz_str = details.timezone

    if (lat is None or lon is None) and details.pob:
        pob_clean = details.pob.strip().lower()
        if pob_clean in POPULAR_CITIES:
            c_lat, c_lon, c_tz = POPULAR_CITIES[pob_clean]
            lat = c_lat if lat is None else lat
            lon = c_lon if lon is None else lon
            tz_str = tz_str or c_tz
        else:
            try:
                geolocator = Nominatim(user_agent="astrology_rasi_match", timeout=4)
                location = geolocator.geocode(details.pob)
                if location:
                    lat = location.latitude
                    lon = location.longitude
                    found_tz = tf.timezone_at(lat=lat, lng=lon)
                    if found_tz:
                        tz_str = tz_str or found_tz
            except Exception:
                pass

    if lat is None:
        lat = 28.6139  # Default to New Delhi
    if lon is None:
        lon = 77.2090
    if not tz_str:
        tz_str = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"

    return lat, lon, tz_str

@router.post("/calculate", response_model=MatchResponse)
def calculate_matchmaking(payload: MatchRequest):
    """
    Computes South Indian Dasa Porutham (10 Matches) between Boy and Girl.
    Calculates precise Swiss Ephemeris Moon positions and evaluates all 10 Vedic criteria.
    """
    try:
        # 1. Resolve coordinates & timezone for Boy
        b_lat, b_lon, b_tz = resolve_location(payload.boy)
        boy_chart = AstrologyService.calculate_chart(
            name=payload.boy.name or "Boy",
            dob=payload.boy.dob,
            tob=payload.boy.tob,
            lat=b_lat,
            lon=b_lon,
            tz=b_tz
        )

        # 2. Resolve coordinates & timezone for Girl
        g_lat, g_lon, g_tz = resolve_location(payload.girl)
        girl_chart = AstrologyService.calculate_chart(
            name=payload.girl.name or "Girl",
            dob=payload.girl.dob,
            tob=payload.girl.tob,
            lat=g_lat,
            lon=g_lon,
            tz=g_tz
        )

        # 3. Compute Dasa Porutham
        match_result = MatchmakingService.calculate_dasa_porutham(
            boy_chart=boy_chart,
            girl_chart=girl_chart
        )

        return MatchResponse(success=True, data=match_result)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
