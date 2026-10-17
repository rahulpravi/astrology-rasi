from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from app.services.astrology import AstrologyService
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder

router = APIRouter()
tf = TimezoneFinder()

# Pre-cached standard Indian & major cities for instant offline fallback
POPULAR_CITIES = {
    "chennai": (13.0827, 80.2707, "Asia/Kolkata"),
    "kozhikode": (11.2588, 75.7804, "Asia/Kolkata"),
    "calicut": (11.2588, 75.7804, "Asia/Kolkata"),
    "delhi": (28.6139, 77.2090, "Asia/Kolkata"),
    "new delhi": (28.6139, 77.2090, "Asia/Kolkata"),
    "mumbai": (19.0760, 72.8777, "Asia/Kolkata"),
    "bengaluru": (12.9716, 77.5946, "Asia/Kolkata"),
    "bangalore": (12.9716, 77.5946, "Asia/Kolkata"),
    "hyderabad": (17.3850, 78.4867, "Asia/Kolkata"),
    "kolkata": (22.5726, 88.3639, "Asia/Kolkata"),
    "kochi": (9.9312, 76.2673, "Asia/Kolkata"),
    "cochin": (9.9312, 76.2673, "Asia/Kolkata"),
    "thiruvananthapuram": (8.5241, 76.9366, "Asia/Kolkata"),
    "trivandrum": (8.5241, 76.9366, "Asia/Kolkata"),
    "varanasi": (25.3176, 82.9739, "Asia/Kolkata"),
    "madurai": (9.9252, 78.1198, "Asia/Kolkata"),
    "coimbatore": (11.0168, 76.9558, "Asia/Kolkata"),
    "ahmedabad": (23.0225, 72.5714, "Asia/Kolkata"),
    "pune": (18.5204, 73.8567, "Asia/Kolkata"),
    "jaipur": (26.9124, 75.7873, "Asia/Kolkata"),
    "lucknow": (26.8467, 80.9462, "Asia/Kolkata"),
}

class ChartRequest(BaseModel):
    name: Optional[str] = Field("Seeker", description="Name of the person")
    dob: str = Field(..., description="Date of birth in YYYY-MM-DD")
    tob: str = Field(..., description="Time of birth in HH:MM (24-hour format)")
    pob: Optional[str] = Field(None, description="Place of Birth name or city")
    latitude: Optional[float] = Field(None, ge=-90.0, le=90.0, description="Latitude of birth location")
    longitude: Optional[float] = Field(None, ge=-180.0, le=180.0, description="Longitude of birth location")
    timezone: Optional[str] = Field(None, description="IANA Timezone string")

class ChartResponse(BaseModel):
    success: bool
    data: Dict[str, Any]

@router.post("/calculate", response_model=ChartResponse)
def generate_rasi_chart(payload: ChartRequest):
    """
    Generate Vedic Rasi Chart planetary positions, Lagna, and 12-house placements.
    Resolves coordinates from `pob` if latitude and longitude are not directly supplied.
    """
    lat = payload.latitude
    lon = payload.longitude
    tz_str = payload.timezone

    # Resolve coordinates from pob if lat/lon not supplied
    if (lat is None or lon is None) and payload.pob:
        pob_clean = payload.pob.strip().lower()
        if pob_clean in POPULAR_CITIES:
            c_lat, c_lon, c_tz = POPULAR_CITIES[pob_clean]
            lat = c_lat if lat is None else lat
            lon = c_lon if lon is None else lon
            tz_str = tz_str or c_tz
        else:
            try:
                geolocator = Nominatim(user_agent="astrology_rasi_app", timeout=4)
                location = geolocator.geocode(payload.pob)
                if location:
                    lat = location.latitude
                    lon = location.longitude
                    found_tz = tf.timezone_at(lat=lat, lng=lon)
                    if found_tz:
                        tz_str = tz_str or found_tz
            except Exception:
                pass

    # Default fallback if geocoding fails (Default to New Delhi coordinates)
    if lat is None:
        lat = 28.6139
    if lon is None:
        lon = 77.2090
    if not tz_str:
        tz_str = tf.timezone_at(lat=lat, lng=lon) or "Asia/Kolkata"

    try:
        chart_data = AstrologyService.calculate_chart(
            name=payload.name or "Seeker",
            dob=payload.dob,
            tob=payload.tob,
            lat=lat,
            lon=lon,
            tz=tz_str
        )
        chart_data["place_of_birth"] = payload.pob or f"{lat:.2f}, {lon:.2f}"
        return ChartResponse(success=True, data=chart_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
