import os
import pickle
import logging
import json
from typing import Optional, List, Dict
from datetime import datetime
import warnings

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from groq import Groq

warnings.filterwarnings('ignore', category=UserWarning)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GeoAware Flood Risk Prediction API", version="2.0.0")

MODEL = None
LABEL_ENCODER = None


# -------------------- LOAD MODEL --------------------

def load_model():
    global MODEL, LABEL_ENCODER
    try:
        with open("models/flood_risk_model.pkl", "rb") as f:
            MODEL = pickle.load(f)

        with open("models/flood_label_encoder.pkl", "rb") as f:
            LABEL_ENCODER = pickle.load(f)

        logger.info("Model and label encoder loaded successfully")

    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        raise


@app.on_event("startup")
async def startup_event():
    load_model()


# -------------------- REQUEST MODEL --------------------

class FloodPredictionRequest(BaseModel):
    imc_mean: float
    imc_pct_gt_5: float
    imc_pct_gt_10: float
    olr_mean: float
    olr_pct_lt_220: float
    olr_pct_lt_240: float
    ctp_mean: float
    ctp_pct_lt_200: float
    ctp_pct_lt_300: float
    latitude: float
    longitude: float


# -------------------- RESPONSE MODELS --------------------

class LocationInfo(BaseModel):
    latitude: float
    longitude: float
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None


class ModelPrediction(BaseModel):
    risk_level: str
    probabilities: dict


class AIAnalysis(BaseModel):
    weather_interpretation: str
    risk_reason: str
    advisory: str
    preventive_actions: List[str]


class FloodPredictionResponse(BaseModel):
    location: LocationInfo
    model_prediction: ModelPrediction
    risk_score: float
    alert_level: str
    graphs: Dict[str, dict]
    model_info: dict
    generated_at: str
    ai_analysis: AIAnalysis

    model_config = {"protected_namespaces": ()}


# -------------------- REVERSE GEOCODING --------------------

def reverse_geocode(latitude: float, longitude: float) -> LocationInfo:
    try:
        url = "https://nominatim.openstreetmap.org/reverse"
        params = {"lat": latitude, "lon": longitude, "format": "json"}
        headers = {"User-Agent": "GeoAware Flood Prediction API"}

        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        data = response.json()

        address = data.get("address", {})

        return LocationInfo(
            latitude=latitude,
            longitude=longitude,
            country=address.get("country"),
            state=address.get("state"),
            city=address.get("city") or address.get("town") or address.get("village"),
            address=data.get("display_name")
        )

    except Exception as e:
        logger.warning(f"Reverse geocoding failed: {str(e)}")
        return LocationInfo(
            latitude=latitude,
            longitude=longitude,
            address=f"Location at ({latitude}, {longitude})"
        )


# -------------------- AI ANALYSIS --------------------

def get_ai_analysis(user_inputs: dict, prediction: str, location: LocationInfo):

    try:
        api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            return {
                "weather_interpretation": "Unavailable",
                "risk_reason": "API key not configured",
                "advisory": "Unavailable",
                "preventive_actions": []
            }

        client = Groq(api_key=api_key)

        prompt = f"""
Return STRICT JSON only:

{{
  "weather_interpretation": "...",
  "risk_reason": "...",
  "advisory": "...",
  "preventive_actions": ["...", "..."]
}}

Flood Risk: {prediction}
Location: {location.city or location.state or location.country}

IMC Mean: {user_inputs['imc_mean']}
IMC >5mm: {user_inputs['imc_pct_gt_5']}
IMC >10mm: {user_inputs['imc_pct_gt_10']}
OLR Mean: {user_inputs['olr_mean']}
CTP Mean: {user_inputs['ctp_mean']}

Keep realistic. Do NOT invent extreme values.
"""

        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            tokens=1000,
            temperature=0.3,
        )

        return json.loads(response.choices[0].message.content)

    except Exception as e:
        logger.error(f"GROQ API error: {str(e)}")
        return {
            "weather_interpretation": "AI unavailable",
            "risk_reason": str(e),
            "advisory": "Unavailable",
            "preventive_actions": []
        }


# -------------------- PREDICT ENDPOINT --------------------

@app.post("/predict", response_model=FloodPredictionResponse)
async def predict_flood_risk(request: FloodPredictionRequest):

    try:

        if MODEL is None or LABEL_ENCODER is None:
            raise HTTPException(status_code=500, detail="Model not loaded")

        if not (-90 <= request.latitude <= 90):
            raise HTTPException(status_code=400, detail="Invalid latitude")

        if not (-180 <= request.longitude <= 180):
            raise HTTPException(status_code=400, detail="Invalid longitude")

        features = [
            'imc_mean', 'imc_pct_gt_5', 'imc_pct_gt_10',
            'olr_mean', 'olr_pct_lt_220', 'olr_pct_lt_240',
            'ctp_mean', 'ctp_pct_lt_200', 'ctp_pct_lt_300'
        ]

        X = pd.DataFrame([[
            request.imc_mean,
            request.imc_pct_gt_5,
            request.imc_pct_gt_10,
            request.olr_mean,
            request.olr_pct_lt_220,
            request.olr_pct_lt_240,
            request.ctp_mean,
            request.ctp_pct_lt_200,
            request.ctp_pct_lt_300
        ]], columns=features)

        prediction_encoded = MODEL.predict(X)[0]
        prediction_proba = MODEL.predict_proba(X)[0]

        risk_level = LABEL_ENCODER.inverse_transform([prediction_encoded])[0]

        probabilities = {
            LABEL_ENCODER.classes_[i]: float(prob)
            for i, prob in enumerate(prediction_proba)
        }

        # Risk score
        risk_score = float(max(probabilities.values()))

        # Alert level
        alert_level = (
            "Green" if risk_level == "Low"
            else "Yellow" if risk_level == "Medium"
            else "Red"
        )

        # Reverse geocode
        location = reverse_geocode(request.latitude, request.longitude)

        # AI inputs
        user_inputs = request.dict()

        ai_analysis = get_ai_analysis(user_inputs, risk_level, location)

        # ----------- GRAPH DATA -----------

        graphs = {

            "risk_probability_chart": {
                "type": "bar",
                "labels": list(probabilities.keys()),
                "values": list(probabilities.values())
            },

            "rainfall_threshold_chart": {
                "type": "bar",
                "labels": [">5mm", ">10mm"],
                "values": [
                    request.imc_pct_gt_5,
                    request.imc_pct_gt_10
                ]
            },

            "atmospheric_indicators_chart": {
                "type": "bar",
                "labels": ["OLR <220K", "OLR <240K", "CTP <200", "CTP <300"],
                "values": [
                    request.olr_pct_lt_220,
                    request.olr_pct_lt_240,
                    request.ctp_pct_lt_200,
                    request.ctp_pct_lt_300
                ]
            }
        }

        # ----------- FEATURE IMPORTANCE -----------

        feature_importance = {}

        if hasattr(MODEL, "feature_importances_"):
            feature_importance = dict(zip(
                features,
                MODEL.feature_importances_.tolist()
            ))

        model_info = {
            "model_type": type(MODEL).__name__,
            "num_features": len(features),
            "feature_importance": feature_importance
        }

        generated_at = datetime.utcnow().isoformat()

        return FloodPredictionResponse(
            location=location,
            model_prediction=ModelPrediction(
                risk_level=risk_level,
                probabilities=probabilities
            ),
            risk_score=risk_score,
            alert_level=alert_level,
            graphs=graphs,
            model_info=model_info,
            generated_at=generated_at,
            ai_analysis=ai_analysis
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


# -------------------- HEALTH CHECK --------------------

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loaded": MODEL is not None
    }


# -------------------- RUN --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
