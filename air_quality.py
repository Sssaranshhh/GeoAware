import openmeteo_requests
import requests_cache
from retry_requests import retry
from datetime import datetime
import logging
import json
from groq import Groq

# ----------------------------------------------------
# LOGGING SETUP
# ----------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

# ----------------------------------------------------
# GROQ API SETUP
# ----------------------------------------------------
groq_client = Groq(api_key="put your api key")   # <-- Replace

# ----------------------------------------------------
# OPEN-METEO CLIENT SETUP
# ----------------------------------------------------
session = requests_cache.CachedSession(".cache", expire_after=600)
retry_session = retry(session, retries=3, backoff_factor=0.2)
openmeteo = openmeteo_requests.Client(session=retry_session)


# ============================================================
# 1) Fetch Weather Data
# ============================================================
def fetch_weather(latitude: float, longitude: float) -> dict:
    log.info(f"Fetching Open-Meteo weather for lat={latitude}, lon={longitude}")

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": latitude,
        "longitude": longitude,
        "hourly": ["temperature_2m", "precipitation", "relative_humidity_2m"],
        "daily": ["precipitation_sum", "temperature_2m_max", "temperature_2m_min"],
        "timezone": "auto"
    }

    try:
        response = openmeteo.weather_api(url, params=params)
        data = response[0]

        hourly = data.Hourly()
        daily = data.Daily()

        weather_json = {
            "location": {"lat": latitude, "lon": longitude},
            "timestamp": datetime.utcnow().isoformat(),
            "hourly": {
                "temperature_2m": hourly.Variables(0).ValuesAsNumpy().tolist(),
                "precipitation": hourly.Variables(1).ValuesAsNumpy().tolist(),
                "humidity": hourly.Variables(2).ValuesAsNumpy().tolist(),
            },
            "daily": {
                "precipitation_sum": daily.Variables(0).ValuesAsNumpy().tolist(),
                "temp_max": daily.Variables(1).ValuesAsNumpy().tolist(),
                "temp_min": daily.Variables(2).ValuesAsNumpy().tolist(),
            }
        }

        log.info("Weather data fetched successfully.")
        return weather_json

    except Exception as e:
        log.error(f"Error fetching weather: {e}")
        raise


# ============================================================
# 2) Generate Groq Insights
# ============================================================
def generate_groq_insights(weather_json: dict) -> dict:
    log.info("Generating Groq insights...")

    prompt = f"""
You are a disaster-safety assistant.

Analyze this weather forecast JSON:
{json.dumps(weather_json, indent=2)}

Return STRICT JSON with:
- risk_level: Low/Medium/High
- precautions: list of strings
- best_time_to_go_out: string
- advisory: string (2–3 lines)
"""

    try:
        completion = groq_client.chat.completions.create(
            model="groq/compound",
            messages=[
                {"role": "system", "content": "You ONLY return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2
        )

        text = completion.choices[0].message.content

        # Ensure valid JSON
        groq_json = json.loads(text)

        log.info("Groq insights generated successfully.")
        return groq_json

    except json.JSONDecodeError:
        log.error("Groq returned invalid JSON.")
        raise

    except Exception as e:
        log.error(f"Groq API error: {e}")
        raise


# ============================================================
# 3) Combine Both Outputs
# ============================================================
def combine_outputs(weather_json: dict, groq_json: dict) -> dict:
    final_out = {
        "weather_data": weather_json,
        "ai_insights": groq_json,
        "stored_at": datetime.utcnow().isoformat()
    }
    return final_out


# ============================================================
# 4) Save to MongoDB
# ============================================================
def save_to_mongodb(final_json: dict) -> str:
    try:
        result = weather_collection.insert_one(final_json)
        log.info(f"Stored document in MongoDB | id={result.inserted_id}")
        return str(result.inserted_id)
    except Exception as e:
        log.error(f"MongoDB insert error: {e}")
        raise


# ============================================================
# 5) MAIN PIPELINE
# ============================================================
def process_weather_request(lat: float, lon: float) -> dict:
    log.info(f"PROCESS REQUEST START | lat={lat}, lon={lon}")

    weather_json = fetch_weather(lat, lon)
    groq_json = generate_groq_insights(weather_json)

    final_json = combine_outputs(weather_json, groq_json)
    doc_id = save_to_mongodb(final_json)

    final_json["_id"] = doc_id
    log.info("PROCESS REQUEST COMPLETE")

    return final_json


# ============================================================
# If executed directly
# ============================================================
if __name__ == "__main__":
    print("=== Weather + Groq AI Insight Generator ===")
    lat = float(input("Enter latitude: "))
    lon = float(input("Enter longitude: "))

    try:
        result = process_weather_request(lat, lon)
        print("\nFinal JSON Output:\n")
        print(json.dumps(result, indent=2))
    except Exception as e:
        print("Error:", e)
