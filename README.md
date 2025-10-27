# GeoAware

Lightweight geospatial hazard monitoring and prediction API. This README explains how to set up, train, and run the project locally on Windows (PowerShell examples).

## Quick start (PowerShell)
Run these commands from the repository root (c:\Users\bhati\OneDrive\Desktop\GeoAware).

1) Create and activate a virtual environment

```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
```

If PowerShell blocks execution, run (only if you understand the change):

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
& .\.venv\Scripts\Activate.ps1
```

2) Install dependencies

```powershell
pip install --upgrade pip
pip install -r .\requirements.txt
pip install pytest    # optional
```

3) Create a `.env` (optional but recommended)

```powershell
@"
USGS_API_URL=https://earthquake.usgs.gov/fdsnws/event/1/query
IMD_WEATHER_URL=https://mausam.imd.gov.in/api/current_wx_api.php
IMD_RAINFALL_URL=https://mausam.imd.gov.in/api/districtwise_rainfall_api.php
GEOSCOPE_API_URL=
MODEL_PATH=ml/models/hazard_model.pkl
KAGGLE_DATA_PATH=Final_data.csv
CACHE_EXPIRY=3600
"@ | Out-File -Encoding UTF8 .env
```

Edit the values (especially IMD/GEOSCOPE URLs or API keys) before running the app.

4) Train the model (make sure training CSV is present)

```powershell
# By default train_model.py expects Final_data.csv in the repo root.
python .\train_model.py
```

This writes the model to `ml/models/hazard_model.pkl` (or the path set in `.env`).

5) Run the FastAPI backend (development)

```powershell
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API base URL: http://127.0.0.1:8000

6) (Optional) Start the Flask test frontend

```powershell
python .\app.py
```

Flask runs on port 5000 and makes simple calls to the API for quick manual testing.

7) Run tests

```powershell
pytest -q
```

## Endpoints (important ones)
- GET `/` — Welcome message
- GET `/data/seismic` — USGS + GEOSCOPE seismic data
- GET `/data/weather` — IMD weather + rainfall (may return structured errors if API is unauthorized)
- GET `/analyze/trends` — Trend analysis computed from `Final_data.csv` (accepts query params such as `region` and `days`)
- POST `/predict` — Predict hazard from seismic parameters (JSON body)

Example POST body for `/predict` (application/json):

```json
{
  "latitude": 34.0522,
  "longitude": -118.2437,
  "depth": 10.5,
  "magnitude": 5.4
}
```

Example using PowerShell + curl:

```powershell
curl -X POST "http://127.0.0.1:8000/predict" -H "Content-Type: application/json" -d '{"latitude":34.0522,"longitude":-118.2437,"depth":10.5,"magnitude":5.4}'
```

## Notes and troubleshooting
- If `Final_data.csv` is not present, `/analyze/trends` will return an error. Place your data file in the project root or update `KAGGLE_DATA_PATH` in `.env`.
- IMD endpoints may return 401 Unauthorized if API keys or credentials are required. Provide valid credentials or a test endpoint.
- If you see scikit-learn InconsistentVersionWarning when loading the model, retrain the model in the current environment with `train_model.py`.

## What's already been done (useful context)
- The project has been auto-scanned and several fixes applied to safely handle: missing `.env` keys, missing optional weather columns, and the `trends` analysis schema.
- The REST API was validated with FastAPI TestClient and basic responses were confirmed.

If you want, I can:
- Add this README into the repo (done).
- Add example Postman collection or scripts.
- Add unit tests for services and endpoints.

---
Last verified: Oct 25, 2025# GeoAware Backend

Real-time Geospatial Hazard Monitoring and Prediction System

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn main:app --reload
```

4. Visit http://localhost:8000/docs for API documentation

## API Endpoints

- `/predict/hazard`: Predict hazard probability
- `/data/seismic`: Get seismic activity data
- `/data/weather`: Get weather information
- `/analyze/trends`: Get hazard trends and patterns

## Project Structure

- `main.py`: FastAPI application entry point
- `services/`: External API integrations
- `ml/`: Machine learning models and processing
- `routers/`: API endpoint definitions
