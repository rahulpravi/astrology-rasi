from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.routes import chart

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="High-precision Vedic Astrology & Planetary Position Computation Engine",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(chart.router, prefix="/api/v1/chart", tags=["Rasi Chart"])

@app.get("/", tags=["Health Check"])
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "supported_locales": ["en", "ml", "ta", "hi"],
        "phase": 1
    }
