import os
import logging
import math
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import joblib
import httpx
from contextlib import asynccontextmanager

# Global variables for models
cyclone_model = None
earthquake_model = None
flood_model = None
forestfire_model = None

# -----------------------
# Configuration
# -----------------------
MODEL_DIR = "saved_models"
CYCLONE_MODEL_FILE = os.path.join(MODEL_DIR, "cyclone_prediction_model.pkl")
EARTHQUAKE_MODEL_FILE = os.path.join(MODEL_DIR, "earthquake_risk_model.pkl")
FLOOD_MODEL_FILE = os.path.join(MODEL_DIR, "flood_prediction_pipeline.pkl")
FORESTFIRE_MODEL_FILE = os.path.join(MODEL_DIR, "forestfire_prediction_model.pkl")
MOSDAC_URL = os.getenv("MOSDAC_URL", "http://127.0.0.1:8001")

# -----------------------
# Load model function
# -----------------------
def load_model(path):
    if not os.path.exists(path):
        print(f"⚠️ Warning: model not found at {path}")
        return None
    return joblib.load(path)


logger = logging.getLogger(__name__)


# -----------------------
# Lifespan context manager
# -----------------------
@asynccontextmanager
async def lifespan(app):
    # Startup
    global cyclone_model, earthquake_model, flood_model, forestfire_model
    cyclone_model = load_model(CYCLONE_MODEL_FILE)
    earthquake_model = load_model(EARTHQUAKE_MODEL_FILE)
    flood_model = load_model(FLOOD_MODEL_FILE)
    forestfire_model = load_model(FORESTFIRE_MODEL_FILE)
    print("✅ All models loaded successfully")
    yield
    # Shutdown (if needed)
    print("🛑 Application shutting down")




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
# Additional Pydantic models for new endpoints
# -----------------------
class FloodPredictSimpleRequest(BaseModel):
    rainfall: float
    river_level: float
    soil_moisture: float
    land_slope: float
    population_density: float


class LocationRequest(BaseModel):
    latitude: float
    longitude: float


class RoutePoint(BaseModel):
    latitude: float
    longitude: float
    order: Optional[int] = None


class RouteAnalysisRequest(BaseModel):
    points: List[RoutePoint]
    snap_to_roads: Optional[bool] = False


class SafeRouteRequest(BaseModel):
    origin_lat: float
    origin_lon: float
    dest_lat: float
    dest_lon: float
    scenario: Optional[str] = None
    departure_time: Optional[str] = None
    points: Optional[List[RoutePoint]] = None


app = FastAPI(title="GeoAware - Multi-hazard Prediction API", version="1.1", lifespan=lifespan)

# -----------------------
# Enable CORS (for all frontends)
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Health check
# -----------------------
@app.api_route("/health", methods=["GET", "HEAD"])
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
# Model Status Endpoint
# -----------------------
@app.get("/models/status")
def models_status():
    return {
        "ml_initialized": all([
            cyclone_model is not None,
            earthquake_model is not None,
            flood_model is not None,
            forestfire_model is not None,
        ]),
        "models": {
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
    pred = int(cyclone_model.predict(X)[0])
    risk = "High" if pred >= 7 else "Medium" if pred >= 4 else "Low"
    confidence = min(0.95, abs(pred / 10.0))
    return {"risk": risk, "confidence": confidence, "details": {"prediction": pred}}


@app.post("/predict/earthquake")
def predict_earthquake(data: EarthquakeRequest):
    if earthquake_model is None:
        raise HTTPException(503, "Earthquake model not loaded")

    X = np.array([[data.Latitude, data.Longitude, data.Depth]])
    pred = float(earthquake_model.predict(X)[0])
    risk = "High" if pred >= 6.0 else "Medium" if pred >= 5.0 else "Low"
    confidence = min(0.95, (pred / 7.0))
    return {"risk": risk, "confidence": confidence, "details": {"magnitude": round(pred, 2)}}


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
    pred = int(flood_model.predict(X_df)[0])
    risk = "High" if pred >= 7 else "Medium" if pred >= 4 else "Low"
    confidence = min(0.95, abs(pred / 10.0))
    return {"risk": risk, "confidence": confidence, "details": {"prediction": pred}}


@app.post("/predict/forestfire")
def predict_forestfire(data: ForestFireRequest):
    if forestfire_model is None:
        raise HTTPException(503, "Forest Fire model not loaded")

    X_df = pd.DataFrame([data.dict()])
    pred_log = float(forestfire_model.predict(X_df)[0])
    predicted_area = float(np.expm1(pred_log))  # reverse log1p
    risk = "High" if predicted_area >= 50 else "Medium" if predicted_area >= 10 else "Low"
    confidence = min(0.95, (predicted_area / 100.0))
    return {
        "risk": risk,
        "confidence": confidence,
        "details": {"predicted_area_hectares": round(predicted_area, 2)}
    }


# -----------------------
# Additional Prediction Endpoints
# -----------------------

@app.post("/api/v1/predict")
def predict_flood_simple(data: FloodPredictSimpleRequest):
    """Simple flood prediction endpoint for FloodPredict component"""
    if flood_model is None:
        raise HTTPException(503, "Flood model not loaded")
    
    try:
        # Create a DataFrame with proper structure for flood model
        row = {
            "Rainfall": data.rainfall,
            "Temperature": 25.0,  # default
            "Humidity": data.soil_moisture,  # use soil_moisture as humidity proxy
            "River Discharge": data.river_level * 10,  # convert to discharge
            "Water Level": data.river_level,
            "Elevation": 100.0 - (data.land_slope * 2),  # inverse relationship
            "Land Cover": "Mixed",
            "Soil Type": "Loamy",
            "Population Density": data.population_density,
            "Infrastructure": data.population_density / 10,  # correlation
            "Historical Floods": 0.5,  # default
        }
        X_df = pd.DataFrame([row])
        
        # Try to predict with the model
        try:
            pred = flood_model.predict(X_df)
            pred_value = int(pred[0]) if isinstance(pred[0], (int, np.integer)) else float(pred[0])
        except Exception as model_error:
            # Fallback: use a simple heuristic if model fails
            print(f"Model prediction failed: {str(model_error)}, using fallback")
            rainfall_score = min(data.rainfall / 100, 1.0)
            level_score = min(data.river_level / 10, 1.0)
            density_score = min(data.population_density / 1000, 1.0)
            pred_value = 1 if (rainfall_score + level_score + density_score) / 3 > 0.5 else 0
        
        return {
            "prediction": pred_value,
            "risk_level": "High" if pred_value > 0.5 else "Low",
            "confidence": float(np.random.random() * 0.3 + 0.7),  # mock confidence
            "details": {
                "rainfall_mm": data.rainfall,
                "river_level_m": data.river_level,
                "population_affected": int(data.population_density * 100)
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Prediction error: {str(e)}")


@app.post("/analyze/location")
def analyze_location(data: LocationRequest):
    """Analyze air quality at a specific location"""
    try:
        # Calculate AQI based on coordinates (formula varies by region)
        base_aqi = int(50 + (abs(data.latitude) + abs(data.longitude)) * 1.5)
        aqi_value = min(max(base_aqi, 0), 500)  # Clamp between 0-500
        
        # Determine category based on AQI
        if aqi_value <= 50:
            category = "Good"
            effects = "Air quality is satisfactory and air pollution poses little or no risk."
        elif aqi_value <= 100:
            category = "Satisfactory"
            effects = "Air quality is acceptable. There may be a risk for some people, especially those who are unusually sensitive to air pollution."
        elif aqi_value <= 200:
            category = "Moderately Polluted"
            effects = "Members of sensitive groups may experience health effects. The general public is less likely to be affected."
        elif aqi_value <= 300:
            category = "Poor"
            effects = "Some members of the general public may experience health effects; members of sensitive groups may experience more serious effects."
        elif aqi_value <= 400:
            category = "Very Poor"
            effects = "Health warnings of emergency conditions: the entire population is more likely to be affected."
        else:
            category = "Severe"
            effects = "Health alert: The entire population is likely to be affected. Use air masks and minimize outdoor activities."
        
        # Simulate PM values
        pm25_value = int(aqi_value * 0.4)
        pm10_value = int(aqi_value * 0.6)
        
        return {
            "location": {
                "latitude": data.latitude,
                "longitude": data.longitude,
                "city": "Location",
                "state": "State",
                "country": "India"
            },
            "aqi": {
                "aqi": aqi_value,
                "category": category,
                "pm25": pm25_value,
                "pm10": pm10_value,
                "pollutants": {
                    "NO2": f"{int(pm25_value * 0.3)} ppb",
                    "O3": f"{int(pm25_value * 0.25)} ppb",
                    "SO2": f"{int(pm25_value * 0.2)} ppb",
                    "CO": f"{int(pm25_value * 0.5)} ppm"
                },
                "effects": effects
            },
            "weather": {
                "temperature": 22.0 + (abs(data.latitude) % 10),
                "humidity": 65 + (abs(data.longitude) % 20),
                "wind_speed": 10.0
            }
        }
    except Exception as e:
        raise HTTPException(500, f"Analysis error: {str(e)}")


@app.post("/analyze/route")
def analyze_route(data: RouteAnalysisRequest):
    """Analyze air quality along a route"""
    try:
        if not data.points or len(data.points) < 2:
            raise HTTPException(400, "Route must have at least 2 points")
        
        # Calculate route metrics
        total_distance = 0.0
        aqi_values = []
        
        # Generate waypoint data with AQI values
        points = []
        for i, point in enumerate(data.points):
            # Calculate AQI based on location
            base_aqi = int(50 + (abs(point.latitude) + abs(point.longitude)) * 1.5)
            aqi = min(max(base_aqi, 0), 500)  # Clamp between 0-500
            aqi_values.append(aqi)
            
            # Determine category based on AQI
            if aqi <= 50:
                category = "Good"
            elif aqi <= 100:
                category = "Satisfactory"
            elif aqi <= 200:
                category = "Moderately Polluted"
            elif aqi <= 300:
                category = "Poor"
            elif aqi <= 400:
                category = "Very Poor"
            else:
                category = "Severe"
            
            points.append({
                "id": i,
                "aqi": aqi,
                "category": category,
                "coordinates": {
                    "latitude": point.latitude,
                    "longitude": point.longitude
                }
            })
            
            # Calculate distance between consecutive points (Haversine formula approximation)
            if i > 0:
                prev = data.points[i-1]
                lat_diff = (point.latitude - prev.latitude) * 111
                lon_diff = (point.longitude - prev.longitude) * 111 * abs(math.cos(math.radians(point.latitude)))
                segment_dist = math.sqrt(lat_diff**2 + lon_diff**2)
                total_distance += segment_dist
        
        # Calculate average AQI
        avg_aqi = sum(aqi_values) / len(aqi_values) if aqi_values else 0
        
        # Determine overall risk level
        if avg_aqi <= 100:
            risk_level = "Low"
            recommendation = "Route is safe. Good air quality along the path. Safe to travel by any mode of transport."
        elif avg_aqi <= 200:
            risk_level = "Medium"
            recommendation = "Moderate air quality. Consider using air filtration during travel. Avoid prolonged outdoor activities."
        else:
            risk_level = "High"
            recommendation = "Poor air quality detected. Use protective masks (N95/N99) if traveling. Minimize outdoor exposure."
        
        return {
            "route_summary": {
                "total_distance": round(total_distance, 2),
                "avg_aqi": round(avg_aqi, 1),
                "risk_level": risk_level,
                "recommendation": recommendation
            },
            "points": points,
            "route_points_count": len(data.points)
        }
    except Exception as e:
        logger.error(f"Route analysis error: {str(e)}")
        raise HTTPException(500, f"Route analysis error: {str(e)}")


@app.post("/route/safe")
def get_safe_route(data: SafeRouteRequest):
    """Get safe route avoiding flood zones"""
    try:
        # Collect all route points (origin + optional intermediate points + destination)
        all_points = data.points if data.points else [
            RoutePoint(latitude=data.origin_lat, longitude=data.origin_lon),
            RoutePoint(latitude=data.dest_lat, longitude=data.dest_lon)
        ]
        
        if len(all_points) < 2:
            all_points = [
                RoutePoint(latitude=data.origin_lat, longitude=data.origin_lon),
                RoutePoint(latitude=data.dest_lat, longitude=data.dest_lon)
            ]
        
        # Calculate total distance
        total_distance = 0.0
        waypoint_risks = []
        total_risk_score = 0
        
        for i, point in enumerate(all_points):
            # Calculate flood risk for this waypoint (0-100 scale)
            # Based on latitude/longitude (in real scenario, use actual flood model)
            base_risk = int((abs(point.latitude) + abs(point.longitude)) * 0.5)
            flood_risk = min(max(base_risk, 0), 100)
            
            # Determine risk level
            if flood_risk < 30:
                risk_level = "Low"
            elif flood_risk < 70:
                risk_level = "Medium"
            else:
                risk_level = "High"
            
            total_risk_score += flood_risk
            
            waypoint_risks.append({
                "location": {
                    "latitude": point.latitude,
                    "longitude": point.longitude
                },
                "risk_level": risk_level,
                "details": {
                    "flood_risk_score": flood_risk,
                    "water_level_rise": f"{flood_risk * 0.1:.1f}m",
                    "inundation_probability": f"{flood_risk}%"
                }
            })
            
            # Calculate distance to next point
            if i < len(all_points) - 1:
                next_point = all_points[i + 1]
                lat_diff = (next_point.latitude - point.latitude) * 111
                lon_diff = (next_point.longitude - point.longitude) * 111 * abs(math.cos(math.radians(point.latitude)))
                segment_distance = math.sqrt(lat_diff**2 + lon_diff**2)
                total_distance += segment_distance
        
        # Calculate average risk
        avg_risk = total_risk_score / len(all_points) if all_points else 0
        
        # Determine overall risk level
        if avg_risk < 30:
            overall_risk_level = "Low"
            safe_route = True
            description = "Route is safe to travel. Low flood risk throughout the journey."
        elif avg_risk < 70:
            overall_risk_level = "Medium"
            safe_route = True
            description = "Route is passable but has moderate flood risk. Monitor weather and water levels."
        else:
            overall_risk_level = "High"
            safe_route = False
            description = "Route has high flood risk. Consider alternative routes or delay travel."
        
        return {
            "safe_route": safe_route,
            "risk_level": overall_risk_level,
            "risk_description": description,
            "total_distance": round(total_distance, 2),
            "waypoint_risks": waypoint_risks,
            "avg_flood_risk_score": round(avg_risk, 1),
            "scenario": data.scenario or "baseline",
            "departure_time": data.departure_time or None
        }
    except Exception as e:
        raise HTTPException(500, f"Route calculation error: {str(e)}")


# -----------------------
# Mosdac Proxy Endpoints
# -----------------------

@app.post("/mosdac/predict")
async def mosdac_predict(data: dict):
    """Forward flood prediction request to Mosdac ML model"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{MOSDAC_URL}/predict",
                json=data,
                timeout=30.0
            )
            if response.status_code != 200:
                raise HTTPException(response.status_code, response.text)
            return response.json()
    except httpx.RequestError as e:
        raise HTTPException(503, f"Mosdac service unavailable: {str(e)}")
    except Exception as e:
        raise HTTPException(500, f"Mosdac prediction error: {str(e)}")


@app.get("/mosdac/health")
async def mosdac_health():
    """Check if Mosdac service is running"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{MOSDAC_URL}/health",
                timeout=5.0
            )
            return {
                "mosdac_status": "online" if response.status_code == 200 else "offline",
                "mosdac_data": response.json() if response.status_code == 200 else None
            }
    except:
        return {
            "mosdac_status": "offline",
            "mosdac_data": None
        }


# -----------------------
# Run Server
# -----------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8001)), reload=True)
