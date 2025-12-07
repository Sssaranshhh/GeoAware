# Flood Route Safety Navigator - Backend API

A production-ready FastAPI backend for computing flood-aware safe routes using ML-based hazard prediction, geospatial pathfinding (A*), and LLM-generated travel advisories.

## 🌊 Project Overview

**Flood Route Safety Navigator** is a minimal, clean FastAPI-only backend that:

- **Predicts flood hazard** using machine learning (RandomForest classifier)
- **Computes hazard grids** from elevation, slope, river proximity, and discharge data
- **Optimizes routes** using A* pathfinding with hazard-aware costs
- **Generates advisories** using LLM (OpenAI/Groq) or rule-based fallback
- **Returns JSON-only responses** for integration with any frontend

### Architecture Stack

```
Hazard Data (elevation, slope, discharge)
    ↓
[Hazard Layer] → Compute flood risk scores per grid cell
    ↓
[ML Model] → Predict flood risk probability
    ↓
[Road Network Graph] → OpenStreetMap roads via networkx
    ↓
[A* Pathfinder] → Find optimal route with hazard cost
    ↓
[LLM Advisory] → Generate safety recommendations
    ↓
[FastAPI Response] → JSON-only output
```

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Preprocess Data

```bash
# Create synthetic grids (elevation, slope, river proximity)
python scripts/preprocess_grids.py

# Train ML model
python ml/train_model.py

# (Optional) Download OSM data
python scripts/download_osm.py
```

### 3. Run Server

```bash
# Start FastAPI server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or production (no reload)
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 4. Test API

```bash
# Health check
curl http://localhost:8000/health

# Compute safe route
curl -X POST http://localhost:8000/route/safe \
  -H "Content-Type: application/json" \
  -d '{
    "origin_lat": 20.5937,
    "origin_lon": 72.9629,
    "dest_lat": 20.6845,
    "dest_lon": 73.0524,
    "time_horizon": "now",
    "include_alternatives": false
  }'
```

---

## 📚 API Reference

### Health Check
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Flood Route Safety Navigator",
  "version": "1.0.0"
}
```

### Compute Safe Route
```
POST /route/safe
```

**Request Body:**
```json
{
  "origin_lat": 20.5937,
  "origin_lon": 72.9629,
  "dest_lat": 20.6845,
  "dest_lon": 73.0524,
  "time_horizon": "now",
  "include_alternatives": false
}
```

**Parameters:**
- `origin_lat`, `origin_lon`: Origin coordinates (degrees)
- `dest_lat`, `dest_lon`: Destination coordinates (degrees)
- `time_horizon`: `"now"`, `"24h"`, or `"48h"` (forecast horizon)
- `include_alternatives`: Boolean (default: false) - return 2 alternative routes

**Response:**
```json
{
  "status": "SUCCESS",
  "primary_route": {
    "route": [[20.5937, 72.9629], [20.5950, 72.9650], ...],
    "distance_km": 12.5,
    "eta_minutes": 25,
    "hazard_exposure": 0.35,
    "max_hazard": 0.50,
    "mean_hazard": 0.32,
    "advisory": "Route conditions are favorable. Plan accordingly and avoid high-hazard zones.",
    "efficiency_class": "GOOD"
  },
  "alternative_routes": null,
  "metadata": {
    "timestamp": "2024-01-15T14:30:00.123456",
    "time_horizon": "now",
    "origin_snap_distance_km": 0.05,
    "dest_snap_distance_km": 0.08,
    "discharge_ratio": 1.2,
    "baseline_discharge": 850.0,
    "current_discharge": 1020.0
  }
}
```

**Response Fields:**
- `route`: List of (lat, lon) coordinates along the path
- `distance_km`: Total route distance
- `eta_minutes`: Estimated travel time
- `hazard_exposure`: Normalized hazard score (0=safe, 1=critical)
- `max_hazard`: Peak hazard on route
- `mean_hazard`: Average hazard on route
- `advisory`: LLM-generated safety text
- `efficiency_class`: `OPTIMAL`, `GOOD`, `ACCEPTABLE`, or `RISKY`

---

## 🤖 How It Works

### 1. Hazard Scoring

Hazard score per grid cell combines:

```
hazard = w1 × (1 - elevation_norm)
       + w2 × (1 - slope_norm)
       + w3 × river_proximity_norm
       + w4 × discharge_ratio_norm

where:
  w1 = 0.2 (elevation weight)
  w2 = 0.2 (slope weight)
  w3 = 0.3 (river proximity weight)
  w4 = 0.3 (discharge weight)
```

**Logic:**
- **Low elevation** → higher flood risk
- **Flat terrain** → more water pooling
- **Close to river** → more risk
- **High discharge** → elevated water levels

### 2. ML-Based Hazard Prediction

RandomForest classifier trained on synthetic features:

- **Input:** Elevation, slope, river proximity, discharge ratio, curvature, land cover
- **Output:** Flood risk probability (0-1)
- **Training:** 5000 synthetic samples, 80-20 split
- **Metrics:** Accuracy ~85-90%, ROC-AUC ~0.90

Model saved at `models/flood_risk_model.pkl` after first training.

### 3. A* Route Optimization

Finds optimal path considering:

```
cost = base_distance × (1 + α × hazard_score)

where α = 2.0 (hazard penalty multiplier from config)
```

**Algorithm:**
1. Convert origin/destination to nearest road nodes
2. Use A* search with Euclidean heuristic
3. Compute edge costs based on distance + hazard
4. Return path with lowest total cost

### 4. Hazard Exposure Computation

For each route:

```
exposure = 0.4 × max_hazard + 0.6 × mean_hazard
```

Weighted toward peak risk (40% max, 60% average).

### 5. LLM Travel Advisory

Generates 2-3 sentence advisory using:

- **Primary:** OpenAI API (if key available)
- **Secondary:** Groq API (if key available)
- **Fallback:** Rule-based logic

Example advisories:
- ✅ "Route conditions are favorable. Plan accordingly and avoid high-hazard zones."
- ⚠️ "Route analysis shows conditions are generally safe but remain cautious. River levels are elevated. Check forecasts within 24 hours."
- 🚨 "Route analysis shows conditions present significant flood risk. Current water discharge is substantially above normal. Monitor updates, as conditions may worsen in 48 hours."

---

## 📁 Directory Structure

```
flood_navigation/
├── main.py                 # FastAPI app initialization
├── config.py              # Configuration + environment loader
├── api/
│   ├── routes.py         # POST /route/safe endpoint
│   ├── schemas.py        # Pydantic request/response models
│   └── advisory.py       # LLM advisory generation
├── ml/
│   ├── train_model.py    # RandomForest training
│   ├── features.py       # Feature engineering
│   └── predict.py        # Model inference
├── routing/
│   ├── graph_builder.py  # Load OSM roads → networkx graph
│   ├── cost.py           # Edge cost computation
│   └── pathfinder.py     # A* implementation
├── hazard/
│   ├── forecast_processor.py  # Process discharge data
│   └── hazard_layer.py        # Compute hazard grids
├── data/
│   ├── osm/              # Road network files
│   ├── grids/            # Elevation, slope, proximity rasters
│   └── processed/        # ML training datasets
├── scripts/
│   ├── download_osm.py
│   ├── download_forecast.py
│   └── preprocess_grids.py
├── models/               # Trained models + scaler
├── README.md
├── how_to_run.txt
└── requirements.txt
```

---

## ⚙️ Configuration

Edit `config.py` to customize:

```python
# Hazard thresholds
HAZARD_LOW_THRESHOLD = 0.3        # Score < 0.3 = low risk
HAZARD_MEDIUM_THRESHOLD = 0.6
HAZARD_HIGH_THRESHOLD = 0.8

# A* weights
HAZARD_WEIGHT_ALPHA = 2.0         # Hazard cost multiplier
DISTANCE_WEIGHT = 1.0

# Hazard grid composition
RIVER_PROXIMITY_WEIGHT = 0.3
ELEVATION_WEIGHT = 0.2
SLOPE_WEIGHT = 0.2
DISCHARGE_WEIGHT = 0.3

# LLM
LLM_MODEL = "gpt-3.5-turbo"        # or "mixtral-8x7b-32768"
USE_GROQ = False

# Server
HOST = "0.0.0.0"
PORT = 8000
```

### Environment Variables

```bash
export OPENAI_API_KEY="sk-..."
export GROQ_API_KEY="gsk_..."
export USE_GROQ="true"  # true or false
export HOST="0.0.0.0"
export PORT="8000"
export DEBUG="false"
```

---

## 🧪 Testing

### Test with curl

```bash
# Default route (Mumbai to nearby location)
curl -X POST http://localhost:8000/route/safe \
  -H "Content-Type: application/json" \
  -d '{"origin_lat": 20.5937, "origin_lon": 72.9629, "dest_lat": 20.6845, "dest_lon": 73.0524, "time_horizon": "now"}'

# With alternatives
curl -X POST http://localhost:8000/route/safe \
  -H "Content-Type: application/json" \
  -d '{"origin_lat": 20.5937, "origin_lon": 72.9629, "dest_lat": 20.6845, "dest_lon": 73.0524, "time_horizon": "24h", "include_alternatives": true}'

# 48-hour forecast
curl -X POST http://localhost:8000/route/safe \
  -H "Content-Type: application/json" \
  -d '{"origin_lat": 20.5937, "origin_lon": 72.9629, "dest_lat": 20.6845, "dest_lon": 73.0524, "time_horizon": "48h"}'
```

### Test with Python

```python
import requests

response = requests.post(
    "http://localhost:8000/route/safe",
    json={
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "now",
    }
)

result = response.json()
print(f"Distance: {result['primary_route']['distance_km']:.1f} km")
print(f"Hazard Exposure: {result['primary_route']['hazard_exposure']:.2f}")
print(f"Advisory: {result['primary_route']['advisory']}")
```

### Interactive API Docs

Once running, visit:

```
http://localhost:8000/docs       (Swagger UI)
http://localhost:8000/redoc      (ReDoc)
```

---

## 🔧 Troubleshooting

### Issue: "Model not found"
```
python ml/train_model.py
```

### Issue: "Graph not found"
```
python scripts/preprocess_grids.py
python ml/train_model.py
```

### Issue: "No API key configured"
The system falls back to rule-based advisories. Set `OPENAI_API_KEY` or `GROQ_API_KEY` to enable LLM.

```bash
export OPENAI_API_KEY="sk-..."
```

### Issue: Slow A* search
Increase hazard weight to reduce search space:
```python
Config.HAZARD_WEIGHT_ALPHA = 3.0  # Higher = more aggressive hazard avoidance
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `fastapi` | API framework |
| `uvicorn` | ASGI server |
| `pydantic` | Request/response validation |
| `networkx` | Graph data structure |
| `scikit-learn` | ML models |
| `numpy` | Numerical computing |
| `openai` | LLM API (optional) |
| `groq` | Groq LLM API (optional) |
| `osmnx` | OSM data download (optional) |
| `geopandas` | Geospatial data (optional) |
| `scipy` | Scientific computing (optional) |

See `requirements.txt` for pinned versions.

---

## 🚀 Production Deployment

### Docker

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Preprocess data
RUN python scripts/preprocess_grids.py && python ml/train_model.py

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```bash
docker build -t flood-navigator .
docker run -p 8000:8000 \
  -e OPENAI_API_KEY="sk-..." \
  flood-navigator
```

### AWS/GCP/Azure

1. Deploy to container service (ECS, GKE, ACI)
2. Set environment variables for API keys
3. Configure load balancing + auto-scaling
4. Attach persistent volume for models + data

---

## 📝 License

MIT License - See LICENSE file

---

## 🤝 Contributing

Contributions welcome! Submit issues and PRs to improve:

- Hazard prediction models
- Pathfinding algorithms
- Data sources (real OSM, forecast APIs)
- LLM prompt engineering
- Frontend integration examples

---

## 📞 Support

- **Issues:** GitHub Issues
- **Documentation:** This README + inline code comments
- **Examples:** See curl/Python test commands above

---

**Built with ❤️ for flood-aware route safety**
