# GeoAware Integration Guide - AQI & Flood Routing Features

## Quick Start

### 1. Terminal 1 - Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be available at: **http://localhost:5173**

### 2. Terminal 2 - Wris Flood Model (FastAPI on port 8000)
```bash
cd Wris_flood_model
python run.py
# Or: uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Docs available at: **http://localhost:8000/docs**
Endpoints:
- `POST /predict` - Single district flood risk prediction
- `POST /predict/batch` - Batch predictions for multiple districts
- `GET /health` - Health check

### 3. Terminal 3 - Main ML Backend (FastAPI on port 8001)
```bash
# Make sure you're in the root GeoAware directory
PORT=8001 python main.py
# Or: uvicorn main:app --reload --host 0.0.0.0 --port 8001
```
Docs available at: **http://localhost:8001/docs**
Endpoints:
- `POST /analyze/location` - Single location air quality analysis
- `POST /analyze/route` - Route polyline air quality analysis
- `POST /route/safe` - Safe flood route analysis
- Plus other ML endpoints (cyclone, earthquake, forestfire, etc.)

### 4. Terminal 4 - Express Backend (Optional - for user auth, DB)
```bash
cd backend
npm install
node server.js
```
Available at: **http://localhost:3000**

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Frontend (React 19, Vite)                  │
│                    http://localhost:5173                     │
└──────────────┬──────────────────────────┬────────────────────┘
               │                          │
    ┌──────────▼──────────┐    ┌──────────▼────────────┐
    │   FloodPredict.jsx  │    │    AirQuality.jsx     │
    │ + FloodRouteNav.jsx │    │ (Route mode included) │
    └──────────┬──────────┘    └──────────┬────────────┘
               │                          │
        VITE_WRIS_URL              VITE_ML_URL
      http://localhost:8000      http://localhost:8001
               │                          │
    ┌──────────▼──────────┐    ┌──────────▼────────────────┐
    │  Wris Flood Model   │    │   Main FastAPI Backend    │
    │   (Port 8000)       │    │     (Port 8001)           │
    │                     │    │                           │
    │ - /predict          │    │ - /analyze/location       │
    │ - /predict/batch    │    │ - /analyze/route          │
    │ - /health           │    │ - /route/safe             │
    └─────────────────────┘    │ - /health                 │
                               │ + Other ML endpoints      │
                               └───────────────────────────┘
```

## Environment Variables

**Frontend (.env)**
- `VITE_API_URL=http://localhost:3000` - Express backend
- `VITE_WS_URL=ws://localhost:3000` - WebSocket
- `VITE_ML_URL=http://localhost:8001` - Main ML backend (AQI + Flood routing)
- `VITE_WRIS_URL=http://localhost:8000` - Wris flood model

**Backend (main.py)**
- `PORT=8001` - Set port for main.py (default: 8000)
- `MOSDAC_URL=http://127.0.0.1:8001` - Mosdac service URL (if using)

## Features

### 🌍 Air Quality (AirQuality.jsx)

#### Location Mode
- Analyze AQI at a specific latitude/longitude
- Returns:
  - AQI score (0-500)
  - Category (Good, Satisfactory, Moderately Polluted, Poor, Very Poor, Severe)
  - PM2.5 and PM10 values
  - Pollutant breakdown (NO2, O3, SO2, CO)
  - Health effects
  - Weather data

#### Route Mode
- Analyze AQI along a polyline route (multiple waypoints)
- Returns:
  - Average AQI along route
  - Risk level (Low, Medium, High)
  - Recommendations
  - Individual waypoint data

### 🚗 Flood Route Navigator (FloodRouteNavigator.jsx)

- Calculate safe routes avoiding flood zones
- Accepts: Origin, destination, and optional waypoints
- Returns:
  - Safe route indicator (yes/no)
  - Overall risk level
  - Risk description
  - Waypoint-by-waypoint risk analysis
  - Total distance
  - Flood risk scores

### 🌊 Flood Prediction (FloodPredict.jsx)

- Predicts flood risk for 85 Indian districts
- Interactive map with district selection
- Returns:
  - Flood risk score
  - AI-generated insights (from Groq API)
  - Transparency layers showing data sources

## Testing the Endpoints

### Test Air Quality Location Analysis
```bash
curl -X POST http://localhost:8001/analyze/location \
  -H "Content-Type: application/json" \
  -d '{"latitude": 28.6139, "longitude": 77.209}'
```

### Test Air Quality Route Analysis
```bash
curl -X POST http://localhost:8001/analyze/route \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {"latitude": 28.6139, "longitude": 77.209},
      {"latitude": 28.62, "longitude": 77.215}
    ],
    "snap_to_roads": false
  }'
```

### Test Safe Route Analysis
```bash
curl -X POST http://localhost:8001/route/safe \
  -H "Content-Type: application/json" \
  -d '{
    "origin_lat": 28.6139,
    "origin_lon": 77.209,
    "dest_lat": 28.62,
    "dest_lon": 77.215,
    "scenario": "baseline"
  }'
```

### Test Wris Flood Prediction
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "district": "Bengaluru Urban",
    "rainfall_mm": 100,
    "temperature_c": 25,
    "humidity_percent": 70
  }'
```

## Navigation in Frontend

1. **Dashboard** - Main landing page
2. **Sidebar Menu** - Click the hamburger icon
   - 😷 **Air Quality** - AQI analysis (location + route mode)
   - ⛵ **Flood Routing** - Safe route finder
   - 🌊 **Flood Prediction** - District-level flood risk

## Troubleshooting

### "Backend: 🔴 Offline" Error
- Check that main.py is running on port 8001
- Run: `PORT=8001 python main.py`
- Verify no firewall blocking localhost:8001

### "WRIS: 🔴 Not reachable" Error
- Check that Wris model is running on port 8000
- Run: `cd Wris_flood_model && python run.py`
- Verify port 8000 is not in use

### CORS Errors in Browser Console
- Both backends have CORS enabled with `allow_origins=["*"]`
- If issues persist, check frontend .env has correct URLs
- Ensure frontend running on localhost:5173

### Port Already in Use
- Check: `lsof -i :8000` or `lsof -i :8001` (macOS/Linux)
- Windows: `netstat -ano | findstr :8000`
- Kill process or change PORT: `PORT=8002 python main.py`

## Integration Summary

✅ **Completed:**
- Backend endpoints updated with proper response structures
- CORS enabled on both FastAPI servers
- Frontend environment variables configured
- Components (AirQuality, FloodRouteNavigator) ready to use
- All routes configured in App.jsx
- Sidebar navigation items present

⚠️ **To Test:**
1. Start all 4 services in separate terminals
2. Navigate to http://localhost:5173
3. Login (if auth enabled)
4. Test Air Quality, Flood Routing, and Flood Prediction features
5. Check browser DevTools console for any errors

## Development Notes

- **Backend Port Conflict:** main.py and Wris model both default to port 8000, so use `PORT=8001` for main.py
- **CORS:** Both backends allow all origins for development (change in production)
- **Real Data:** AQI/Flood routing currently use simulated data based on coordinates
- **Future:** Integrate with real OpenWeather API, WRIS satellite data, etc.

---

Happy predicting! 🎯
