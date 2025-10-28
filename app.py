from flask import Flask, render_template, request, jsonify
import requests
import json
import traceback

app = Flask(__name__)
FASTAPI_URL = "http://127.0.0.1:8000"  # make sure FastAPI is running here

def safe_float(val, default=0.0):
    try:
        if val is None or val == "":
            return default
        return float(val)
    except Exception:
        return default

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

def forward_to_fastapi(path, payload):
    url = f"{FASTAPI_URL}{path}"
    print(f"[FLASK] Forwarding to FastAPI: POST {url}")
    print(f"[FLASK] Payload: {json.dumps(payload, indent=2)}")
    r = requests.post(url, json=payload, timeout=10)
    print(f"[FLASK] FastAPI Response status: {r.status_code}, body: {r.text}")
    return r

# explicit endpoints — mirror FastAPI endpoints exactly
@app.route("/predict/cyclone", methods=["POST"])
def predict_cyclone():
    try:
        data = request.get_json(force=True, silent=True) or request.form.to_dict()
        # convert names that might come from form (some keys include spaces in earlier html)
        payload = {
            "Sea_Surface_Temperature": safe_float(data.get("Sea_Surface_Temperature") or data.get("Sea_Surface_Temperature".replace(" ", "_"))),
            "Atmospheric_Pressure": safe_float(data.get("Atmospheric_Pressure")),
            "Humidity": safe_float(data.get("Humidity")),
            "Wind_Shear": safe_float(data.get("Wind_Shear")),
            "Vorticity": safe_float(data.get("Vorticity")),
            "Latitude": safe_float(data.get("Latitude")),
            "Ocean_Depth": safe_float(data.get("Ocean_Depth")),
            "Proximity_to_Coastline": safe_float(data.get("Proximity_to_Coastline")),
            "Pre_existing_Disturbance": safe_float(data.get("Pre_existing_Disturbance")),
        }
        r = forward_to_fastapi("/predict/cyclone", payload)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/predict/earthquake", methods=["POST"])
def predict_earthquake():
    try:
        data = request.get_json(force=True, silent=True) or request.form.to_dict()
        payload = {
            "Latitude": safe_float(data.get("Latitude")),
            "Longitude": safe_float(data.get("Longitude")),
            "Depth": safe_float(data.get("Depth")),
        }
        r = forward_to_fastapi("/predict/earthquake", payload)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/predict/flood", methods=["POST"])
def predict_flood():
    try:
        data = request.get_json(force=True, silent=True) or request.form.to_dict()
        # handle keys that might come with spaces (map them)
        def get(k1,k2=None):
            return data.get(k1) if data.get(k1) is not None else (data.get(k2) if k2 else None)
        payload = {
            "Rainfall": safe_float(get("Rainfall", "Rainfall (mm)")),
            "Temperature": safe_float(get("Temperature", "Temperature (°C)")),
            "Humidity": safe_float(get("Humidity", "Humidity (%)")),
            "River_Discharge": safe_float(get("River_Discharge", "River Discharge (m³/s)")),
            "Water_Level": safe_float(get("Water_Level", "Water Level (m)")),
            "Elevation": safe_float(get("Elevation", "Elevation (m)")),
            "Land_Cover": get("Land_Cover", "Land Cover") or "",
            "Soil_Type": get("Soil_Type", "Soil Type") or "",
            "Population_Density": safe_float(get("Population_Density","Population Density")),
            "Infrastructure": safe_float(get("Infrastructure")),
            "Historical_Floods": safe_float(get("Historical_Floods","Historical Floods")),
        }
        r = forward_to_fastapi("/predict/flood", payload)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/predict/forestfire", methods=["POST"])
def predict_forestfire():
    try:
        data = request.get_json(force=True, silent=True) or request.form.to_dict()
        payload = {
            "X": int(float(data.get("X", 0))),
            "Y": int(float(data.get("Y", 0))),
            "FFMC": safe_float(data.get("FFMC")),
            "DMC": safe_float(data.get("DMC")),
            "DC": safe_float(data.get("DC")),
            "ISI": safe_float(data.get("ISI")),
            "temp": safe_float(data.get("temp")),
            "RH": safe_float(data.get("RH")),
            "wind": safe_float(data.get("wind")),
            "rain": safe_float(data.get("rain")),
        }
        r = forward_to_fastapi("/predict/forestfire", payload)
        return jsonify(r.json()), r.status_code
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
