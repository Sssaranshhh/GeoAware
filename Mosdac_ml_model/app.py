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
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
from groq import Groq

warnings.filterwarnings('ignore', category=UserWarning)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="GeoAware Flood Risk Prediction API", version="2.0.0")

# -----------------------
# Enable CORS
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
            logger.warning("GROQ_API_KEY not set - using fallback analysis")
            return generate_fallback_analysis(user_inputs, prediction, location)

        client = Groq(api_key=api_key)

        prompt = f"""You are a flood risk expert. Based on satellite data, provide a JSON analysis.

Return ONLY this JSON structure, no other text:
{{
  "weather_interpretation": "Brief interpretation of satellite data",
  "risk_reason": "Why is there high/medium/low risk",
  "advisory": "What should people do",
  "preventive_actions": ["Action 1", "Action 2", "Action 3"]
}}

Data:
- Flood Risk Level: {prediction}
- Location: {location.city or location.state or location.country}
- IMC Mean Rainfall: {user_inputs.get('imc_mean', 0):.2f}mm
- Rainfall >5mm: {user_inputs.get('imc_pct_gt_5', 0):.1f}%
- Rainfall >10mm: {user_inputs.get('imc_pct_gt_10', 0):.1f}%
- OLR Mean: {user_inputs.get('olr_mean', 0):.1f}K
- CTP Mean: {user_inputs.get('ctp_mean', 0):.1f}m

Be realistic and concise."""

        response = client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2500,
            temperature=0.3,
        )

        response_text = response.choices[0].message.content.strip()
        if not response_text:
            logger.warning("Empty response from Groq API")
            return generate_fallback_analysis(user_inputs, prediction, location)
        
        # Try to extract JSON if wrapped in markdown code blocks
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(response_text)

    except json.JSONDecodeError as e:
        logger.error(f"JSON parse error from Groq: {str(e)}")
        return generate_fallback_analysis(user_inputs, prediction, location)
    except Exception as e:
        logger.error(f"GROQ API error: {str(e)}")
        return generate_fallback_analysis(user_inputs, prediction, location)


def generate_fallback_analysis(user_inputs: dict, prediction: str, location: LocationInfo):
    """Generate detailed analysis when API is unavailable"""
    imc_mean = user_inputs.get('imc_mean', 0)
    imc_pct_gt_5 = user_inputs.get('imc_pct_gt_5', 0)
    imc_pct_gt_10 = user_inputs.get('imc_pct_gt_10', 0)
    olr_mean = user_inputs.get('olr_mean', 0)
    olr_pct_lt_220 = user_inputs.get('olr_pct_lt_220', 0)
    ctp_mean = user_inputs.get('ctp_mean', 0)
    
    location_name = location.city or location.state or location.country or "the target location"
    
    if prediction == "High":
        interpretation = f"""
SATELLITE ANALYSIS - SEVERE FLOOD ALERT
Location: {location_name}

Satellite-based observations indicate extremely high flood risk. The satellite imagery reveals:

1. RAINFALL INTENSITY (IMC - India Meteorological Dept):
   - Mean rainfall: {imc_mean:.2f}mm (CRITICAL LEVEL)
   - Areas with rainfall >5mm: {imc_pct_gt_5:.1f}% (WIDESPREAD)
   - Areas with rainfall >10mm: {imc_pct_gt_10:.1f}% (SEVERE PRECIPITATION)
   
2. CLOUD TOP PRESSURE (CTP):
   - Average height: {ctp_mean:.0f}m (LOW altitude = dense clouds)
   - Indicates powerful convective systems developing
   
3. OUTGOING LONG WAVE RADIATION (OLR):
   - Mean OLR: {olr_mean:.1f}K (VERY COLD cloud tops)
   - Deep convection percentage: {olr_pct_lt_220:.1f}% (STRONG THUNDERSTORMS)

METEOROLOGICAL INTERPRETATION:
Multiple heavy cloud systems detected via satellite. The combination of high rainfall percentages, 
low cloud top heights, and very cold cloud temperatures indicates severe thunderstorms are active 
or imminent. This creates dangerous flood conditions with rapid water accumulation potential.
"""
        reason = f"""
The satellite data fusion shows critical flood indicators:
- {imc_pct_gt_10:.1f}% of the region has received >10mm rainfall (threshold for flash flooding)
- {olr_pct_lt_220:.1f}% of clouds show temperatures <220K (extremely powerful convection)
- Cloud top height at {ctp_mean:.0f}m indicates severe weather system

These factors combined create EXTREMELY HIGH FLOOD RISK. Rapid runoff will occur in low-lying areas,
drainage systems will be overwhelmed, and flash flooding is very likely within 1-6 hours.
"""
        advisory = f"""
IMMEDIATE ACTION REQUIRED in {location_name}:
1. Issue RED ALERT - Evacuate all low-lying and flood-prone areas NOW
2. Alert local authorities and disaster management teams
3. Activate emergency broadcast systems
4. Ensure hospitals and shelters are prepared
5. All outdoor activities must STOP immediately
"""
        actions = [
            "IMMEDIATE EVACUATION: Move to high ground/upper floors immediately",
            "DO NOT CROSS FLOODED AREAS: Even shallow water can sweep people away",
            "Stock 72-hour emergency supplies: water, food, medicine, first aid",
            "Charge all electronic devices and have power banks ready",
            "Keep communication established with family members",
            "Monitor official emergency alerts on radio/mobile continuously",
            "Prepare important documents in waterproof bags",
            "Block all drainage inlet areas to prevent backflow flooding",
            "Turn off gas/electrical appliances at ground level",
            "Keep vehicles fueled and ready for emergency evacuation"
        ]
    elif prediction == "Medium":
        interpretation = f"""
SATELLITE ANALYSIS - MODERATE FLOOD ALERT
Location: {location_name}

Satellite data indicates moderate flood risk with localized heavy rainfall:

1. RAINFALL INTENSITY (IMC):
   - Mean rainfall: {imc_mean:.2f}mm (MODERATE LEVEL)
   - Areas with rainfall >5mm: {imc_pct_gt_5:.1f}% (SCATTERED)
   - Areas with rainfall >10mm: {imc_pct_gt_10:.1f}% (ISOLATED POCKETS)
   
2. CLOUD CHARACTERISTICS:
   - Cloud top height: {ctp_mean:.0f}m (Medium altitude clouds)
   - Indicates developing weather systems
   
3. CONVECTIVE ACTIVITY:
   - Deep convection: {olr_pct_lt_220:.1f}% (MODERATE STORM ACTIVITY)

METEOROLOGICAL INTERPRETATION:
Moderate cloud systems detected with intermittent rainfall. The scattered distribution of heavy
rainfall areas suggests localized flooding is possible in low-lying regions and poor drainage areas.
Conditions may escalate if rainfall intensifies over next 2-3 hours.
"""
        reason = f"""
Satellite analysis shows moderate flood indicators:
- {imc_pct_gt_10:.1f}% of area has received >10mm rainfall (above normal)
- {olr_pct_lt_220:.1f}% shows moderate convective strength (developing systems)
- Cloud systems suggest variable rainfall patterns

This creates MODERATE FLOOD RISK for vulnerable areas (low-lying zones, poor drainage).
Most areas will experience manageable conditions, but localized flooding is possible.
"""
        advisory = f"""
ALERT STATUS - YELLOW for {location_name}:
1. Prepare evacuation plans but don't evacuate yet
2. Alert vulnerable communities to be ready
3. Monitor rainfall forecasts every 30 minutes
4. Position rescue resources in accessible locations
5. Brief disaster management teams on standby status
"""
        actions = [
            "Prepare go-bags with essentials (don't evacuate yet)",
            "Move valuable items away from ground/basement levels",
            "Clear drainage systems and gutters of debris",
            "Establish communication with neighbors/elderly relatives",
            "Monitor weather updates every 30 minutes",
            "Keep vehicle fueled and keys accessible",
            "Prepare backup lighting (torches, candles, batteries)",
            "Have medical supplies easily accessible",
            "Photograph property/valuables for insurance purposes",
            "Be ready to move to higher ground if conditions worsen"
        ]
    else:
        interpretation = f"""
SATELLITE ANALYSIS - LOW FLOOD RISK
Location: {location_name}

Satellite observations indicate low flood risk with normal rainfall patterns:

1. RAINFALL MEASUREMENTS (IMC):
   - Mean rainfall: {imc_mean:.2f}mm (BELOW AVERAGE)
   - Areas with heavy rainfall: {imc_pct_gt_10:.1f}% (MINIMAL)
   - Scattered small-area rainfall: {imc_pct_gt_5:.1f}%
   
2. CLOUD SYSTEMS:
   - Cloud top height: {ctp_mean:.0f}m (Normal altitude)
   - Limited severe weather development
   
3. ATMOSPHERIC CONDITIONS:
   - Convection level: {olr_pct_lt_220:.1f}% (WEAK)

METEOROLOGICAL INTERPRETATION:
Clear to partly cloudy conditions with only light to moderate rainfall. Cloud systems are weak
and scattered. Rainfall will be light and sporadic with good drainage. No significant flooding
risk expected unless conditions change dramatically in next 6+ hours.
"""
        reason = f"""
Satellite data shows LOW FLOOD RISK indicators:
- Only {imc_pct_gt_10:.1f}% of area receiving heavy rainfall (very limited areas)
- {olr_pct_lt_220:.1f}% convective activity (weak storm systems)
- Normal cloud patterns with good atmospheric stability

Current conditions are FAVORABLE. Rainfall rates are manageable and most areas will drain
normally. Flooding risk is minimal unless severe weather develops suddenly.
"""
        advisory = f"""
NORMAL STATUS for {location_name}:
1. No evacuation needed
2. Continue normal activities with caution
3. Monitor weather forecasts daily
4. Be prepared for seasonal weather changes
5. Maintain drainage systems regularly
"""
        actions = [
            "Continue normal daily activities - no special precautions needed",
            "Maintain regular infrastructure: clean gutters and drains monthly",
            "Monitor weather forecasts for next 7 days",
            "Keep emergency contact lists updated",
            "Review family disaster plan quarterly",
            "Store emergency supplies for seasonal use",
            "Identify safe rooms and evacuation routes anyway",
            "Keep first aid kit easily accessible",
            "Note locations of nearby shelters/relief centers",
            "Subscribe to local weather alerts and disaster notifications"
        ]
    
    return {
        "weather_interpretation": interpretation,
        "risk_reason": reason,
        "advisory": advisory,
        "preventive_actions": actions
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
    uvicorn.run(app, host="0.0.0.0", port=8001)
