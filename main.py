import os
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib

app = FastAPI(title="GeoAware - Multi-hazard Prediction API", version="1.1")

# -----------------------
# Enable CORS (for Flask frontend)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow Flask on port 5000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Configuration
# -----------------------
MODEL_DIR = "saved_models"
CYCLONE_MODEL_FILE = os.path.join(MODEL_DIR, "cyclone_prediction_model.pkl")
EARTHQUAKE_MODEL_FILE = os.path.join(MODEL_DIR, "earthquake_risk_model.pkl")
FLOOD_MODEL_FILE = os.path.join(MODEL_DIR, "flood_prediction_pipeline.pkl")
FORESTFIRE_MODEL_FILE = os.path.join(MODEL_DIR, "forestfire_prediction_model.pkl")

# -----------------------
# Pydantic models
# -----------------------
class CycloneRequest(BaseModel):
    Sea_Surface_Temperature: float
    Atmospheric_Pressure: float
    Humidity: float
    Wind_Shear: float
    Vorticity: float
    Latitude: float
    Ocean_Depth: float
    Proximity_to_Coastline: float
    Pre_existing_Disturbance: float


class EarthquakeRequest(BaseModel):
    Latitude: float
    Longitude: float
    Depth: float


class FloodRequest(BaseModel):
    Rainfall: float
    Temperature: float
    Humidity: float
    River_Discharge: float
    Water_Level: float
    Elevation: float
    Land_Cover: str
    Soil_Type: str
    Population_Density: float
    Infrastructure: float
    Historical_Floods: float


class ForestFireRequest(BaseModel):
    X: int
    Y: int
    FFMC: float
    DMC: float
    DC: float
    ISI: float
    temp: float
    RH: float
    wind: float
    rain: float
    day_mon: int = 0
    day_sat: int = 0
    day_sun: int = 0
    day_thu: int = 0
    day_tue: int = 0
    day_wed: int = 0
    month_aug: int = 0
    month_dec: int = 0
    month_feb: int = 0
    month_jan: int = 0
    month_jul: int = 0
    month_jun: int = 0
    month_mar: int = 0
    month_may: int = 0
    month_nov: int = 0
    month_oct: int = 0
    month_sep: int = 0

# -----------------------
# Load models
# -----------------------
def load_model(path):
    if not os.path.exists(path):
        print(f"⚠️ Warning: model not found at {path}")
        return None
    return joblib.load(path)


@app.on_event("startup")
def load_all_models():
    global cyclone_model, earthquake_model, flood_model, forestfire_model
    cyclone_model = load_model(CYCLONE_MODEL_FILE)
    earthquake_model = load_model(EARTHQUAKE_MODEL_FILE)
    flood_model = load_model(FLOOD_MODEL_FILE)
    forestfire_model = load_model(FORESTFIRE_MODEL_FILE)


# -----------------------
# Health check
# -----------------------
@app.get("/health")
def health_check():
    return {
        "status": "running",
        "models_loaded": {
            "cyclone": cyclone_model is not None,
            "earthquake": earthquake_model is not None,
            "flood": flood_model is not None,
            "forestfire": forestfire_model is not None,
        },
    }

# -----------------------
# Prediction Endpoints
# -----------------------

@app.post("/predict/cyclone")
def predict_cyclone(data: CycloneRequest):
    if cyclone_model is None:
        raise HTTPException(503, "Cyclone model not loaded")

    X = np.array([[
        data.Sea_Surface_Temperature,
        data.Atmospheric_Pressure,
        data.Humidity,
        data.Wind_Shear,
        data.Vorticity,
        data.Latitude,
        data.Ocean_Depth,
        data.Proximity_to_Coastline,
        data.Pre_existing_Disturbance
    ]])
    pred = cyclone_model.predict(X)
    return {"prediction": int(pred[0])}


@app.post("/predict/earthquake")
def predict_earthquake(data: EarthquakeRequest):
    if earthquake_model is None:
        raise HTTPException(503, "Earthquake model not loaded")

    X = np.array([[data.Latitude, data.Longitude, data.Depth]])
    pred = earthquake_model.predict(X)
    return {"prediction": int(pred[0])}


@app.post("/predict/flood")
def predict_flood(data: FloodRequest):
    if flood_model is None:
        raise HTTPException(503, "Flood model not loaded")

    row = {
        "Rainfall": data.Rainfall,
        "Temperature": data.Temperature,
        "Humidity": data.Humidity,
        "River Discharge": data.River_Discharge,
        "Water Level": data.Water_Level,
        "Elevation": data.Elevation,
        "Land Cover": data.Land_Cover,
        "Soil Type": data.Soil_Type,
        "Population Density": data.Population_Density,
        "Infrastructure": data.Infrastructure,
        "Historical Floods": data.Historical_Floods,
    }
    X_df = pd.DataFrame([row])
    pred = flood_model.predict(X_df)
    return {"prediction": int(pred[0])}


@app.post("/predict/forestfire")
def predict_forestfire(data: ForestFireRequest):
    if forestfire_model is None:
        raise HTTPException(503, "Forest Fire model not loaded")

    X_df = pd.DataFrame([data.dict()])
    pred_log = float(forestfire_model.predict(X_df)[0])
    predicted_area = float(np.expm1(pred_log))  # reverse log1p
    return {
        "predicted_log_area": pred_log,
        "predicted_area": predicted_area
    }


# -----------------------
# Run Server
# -----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
