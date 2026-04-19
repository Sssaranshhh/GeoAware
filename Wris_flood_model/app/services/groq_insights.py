"""
GroqInsights v3
===============
- Compact prompt (no 413 errors)
- Passes data quality and validation context to Groq
- Handles dict/non-string values in parsed JSON
- Rule-based fallback if Groq unavailable
"""

import json
import logging
import re
from typing import List, Optional

import httpx

from app.models.schemas import AIInsights, CollectedFeatures
from app.config import settings

logger      = logging.getLogger(__name__)
GROQ_URL    = "https://api.groq.com/openai/v1/chat/completions"


class GroqInsights:

    def __init__(self):
        self.is_available = bool(settings.GROQ_API_KEY)
        if not self.is_available:
            logger.warning("GROQ_API_KEY not set — using rule-based fallback")

    async def generate_insights(
        self,
        risk_level:     str,
        confidence:     float,
        features:       CollectedFeatures,
        location:       str,
        date:           str,
        missing_fields: Optional[List[str]] = None,
        adjustments:    Optional[List[str]] = None,
    ) -> AIInsights:
        if self.is_available:
            try:
                return await self._call_groq(
                    risk_level, confidence, features, location, date,
                    missing_fields or [], adjustments or []
                )
            except Exception as e:
                logger.warning("Groq failed (%s) — using fallback", e)
        return self._fallback(risk_level, features, location)

    async def _call_groq(
        self,
        risk_level: str, confidence: float, features: CollectedFeatures,
        location: str, date: str, missing_fields: List[str], adjustments: List[str],
    ) -> AIInsights:
        # Build compact prompt
        data_note = (
            f" NOTE: {len(missing_fields)}/8 fields are climate-normal estimates, not real-time."
            if missing_fields else ""
        )
        adj_note = (
            f" VALIDATOR: {adjustments[0][:120]}"
            if adjustments else ""
        )
        prompt = (
            f"Location:{location} Date:{date} Risk:{risk_level} conf:{confidence:.0%}"
            f"{data_note}{adj_note}\n"
            f"Rain:{features.rainfall_mm:.0f}mm T:{features.temperature_c:.0f}C "
            f"Hum:{features.humidity_pct:.0f}% Q:{features.river_discharge_m3_s:.0f}m3/s "
            f"WL:{features.water_level_m:.0f}m SM:{features.soil_moisture:.0f}% "
            f"P:{features.atmospheric_pressure:.0f}hPa ET:{features.evapotranspiration:.1f}mm\n"
            'Respond ONLY in JSON: {"explanation":"...","action_advice":"...","severity_note":"..."}'
        )

        async with httpx.AsyncClient(timeout=httpx.Timeout(20.0)) as client:
            resp = await client.post(
                GROQ_URL,
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}",
                         "Content-Type": "application/json"},
                json={
                    "model": settings.GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": (
                            "You are a senior hydrologist for India. "
                            "Respond ONLY in JSON with string keys: "
                            "explanation, action_advice, severity_note. "
                            "Each value must be a plain string, max 80 words. "
                            "Reflect data confidence in your tone."
                        )},
                        {"role": "user", "content": prompt},
                    ],
                    "temperature": 0.3,
                    "max_tokens": 350,
                },
            )
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            content = re.sub(r"```json|```", "", content).strip()
            parsed  = json.loads(content)

        def to_str(v: object) -> str:
            if isinstance(v, str):
                return v
            if isinstance(v, dict):
                return "; ".join(f"{k}: {val}" for k, val in v.items())
            return str(v)

        return AIInsights(
            explanation=to_str(parsed.get("explanation", "")),
            action_advice=to_str(parsed.get("action_advice", "")),
            severity_note=to_str(parsed.get("severity_note", "")),
            generated_by="groq",
            model_used=settings.GROQ_MODEL,
            fallback=False,
        )

    def _fallback(self, risk_level: str, features: CollectedFeatures,
                  location: str) -> AIInsights:
        rain_status = "heavy" if features.rainfall_mm > 50 else "moderate" if features.rainfall_mm > 20 else "light"
        wl_status = "critical" if features.water_level_m > 10 else "elevated" if features.water_level_m > 5 else "normal"
        temp_status = "warm" if features.temperature_c > 30 else "moderate" if features.temperature_c > 20 else "cool"
        hum_status = "high" if features.humidity_pct > 80 else "moderate" if features.humidity_pct > 60 else "low"
        
        templates = {
            "High": {
                "explanation": (
                    f"{location} shows HIGH flood risk. {rain_status.capitalize()} rainfall ({features.rainfall_mm:.1f}mm), "
                    f"{wl_status} water level ({features.water_level_m:.1f}m), river discharge {features.river_discharge_m3_s:.0f}m³/s, "
                    f"soil moisture {features.soil_moisture:.1f}%, and {hum_status} humidity ({features.humidity_pct:.0f}%) create critical conditions."
                ),
                "action_advice": (
                    f"IMMEDIATE ACTION: Evacuate low-lying areas in {location}. Activate NDRF/SDRF emergency protocols. "
                    "Close schools/offices. Warn communities via emergency broadcasts. Pre-position rescue teams at river crossings."
                ),
                "severity_note": "This is a critical alert. Reassess every 30-60 minutes. Risk could escalate within hours.",
            },
            "Moderate": {
                "explanation": (
                    f"{location} has MODERATE flood risk. {rain_status.capitalize()} rainfall ({features.rainfall_mm:.1f}mm), "
                    f"{wl_status} water levels ({features.water_level_m:.1f}m), river discharge {features.river_discharge_m3_s:.0f}m³/s. "
                    f"Temperature {features.temperature_c:.0f}°C, humidity {features.humidity_pct:.0f}%, soil moisture {features.soil_moisture:.1f}%."
                ),
                "action_advice": (
                    f"Stay on alert in {location}. Issue yellow/orange alerts to communities. Avoid riverbanks and flood-prone areas. "
                    "Ensure emergency supplies are ready. Keep rescue equipment accessible."
                ),
                "severity_note": "Conditions could worsen. Reassess every 2-3 hours or if rainfall intensity increases.",
            },
            "Low": {
                "explanation": (
                    f"{location} has LOW flood risk. {rain_status.capitalize()} rainfall ({features.rainfall_mm:.1f}mm), "
                    f"{wl_status} water levels ({features.water_level_m:.1f}m). Temperature {features.temperature_c:.0f}°C, "
                    f"humidity {features.humidity_pct:.0f}%, soil moisture {features.soil_moisture:.1f}%. Normal conditions overall."
                ),
                "action_advice": "No immediate action required. Continue routine monitoring. Review IMD forecasts for next 48 hours.",
                "severity_note": "Routine monitoring advised. Escalate alerts if rainfall exceeds 30mm/hr or water levels spike.",
            },
        }
        t = templates.get(risk_level, templates["Moderate"])
        return AIInsights(
            explanation=t["explanation"], action_advice=t["action_advice"],
            severity_note=t["severity_note"], generated_by="rule-based-fallback",
            model_used=None, fallback=True,
        )
