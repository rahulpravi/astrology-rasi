# Astrology Rasi Chart Generator 🌌

A modern, high-precision Vedic Astrology & Rasi Chart web application. Computes planetary positions, Nakshatra, Pada, Ascendant (Lagna), and generates dual-format charts (South Indian and North Indian Kundali) with multilingual support.

## Architecture

- **Frontend**: Next.js 14/15 (App Router), Tailwind CSS, TypeScript, `next-intl` (English, Malayalam, Tamil, Hindi), Lucide Icons.
- **Backend**: Python 3.13+, FastAPI, Uvicorn, Pydantic v2 (Engineered for Swiss Ephemeris / pyswisseph integration).
- **Internationalization (i18n)**: English (`en`), Malayalam (`ml`), Tamil (`ta`), Hindi (`hi`).

## Getting Started

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\Activate.ps1
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Interactive API docs available at: `http://localhost:8000/docs`

### 2. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
