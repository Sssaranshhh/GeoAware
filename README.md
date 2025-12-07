# GeoAware Flood Risk API

A production-ready FastAPI-based machine learning backend for predicting flood risk levels based on environmental features.

## 📋 Project Overview

GeoAware Flood Risk API is a REST API service that predicts flood risk ("low", "medium", "high") using a trained Random Forest classifier. The API accepts environmental parameters and returns probabilistic predictions with confidence scores.

### Key Features
- **ML-Powered Predictions**: RandomForestClassifier trained on flood risk data
- **FastAPI Framework**: Async, high-performance REST API
- **Automatic Scaling**: StandardScaler for feature normalization
- **Comprehensive Logging**: Console and file-based logging
- **OpenAPI Documentation**: Interactive API docs at `/docs`
- **Input Validation**: Pydantic schemas with value range constraints

## 🏗️ Architecture

### Project Structure
```
geoaware/
├── flood/
│   ├── main.py                    # FastAPI application entry point
│   ├── config.py                  # Configuration and constants
│   ├── models/                    # Trained model artifacts
│   │   ├── flood_model.pkl        # Trained RandomForestClassifier
│   │   └── scaler.pkl             # Fitted StandardScaler
│   ├── ml/                        # Machine learning pipeline
│   │   ├── train.py               # Model training script
│   │   ├── features.py            # Feature preprocessing
│   │   └── predict.py             # Inference module
│   ├── api/                       # API layer
│   │   ├── routes.py              # API endpoints
│   │   └── schemas.py             # Pydantic models
│   ├── data/
│   │   └── processed/
│   │       └── flood_dataset.csv  # Training dataset
│   ├── utils/
│   │   └── logger.py              # Logging configuration
│   └── logs/                      # Application logs
├── scripts/
│   └── download_dataset.py        # Dataset preparation
├── requirements.txt               # Python dependencies
├── README.md                      # Project documentation
└── how_to_run.txt                 # Quick start guide
```

## 🤖 ML Model Description

### Model Type
**Random Forest Classifier** with the following specifications:
- **Estimators**: 100 trees
- **Max Depth**: 15
- **Features**: 5 environmental parameters
- **Classes**: 3 risk levels (low, medium, high)
- **Scaler**: StandardScaler for feature normalization

### Features
1. **Rainfall** (mm): 0-500 mm
2. **River Level** (m): 0-50 m
3. **Soil Moisture** (%): 0-100%
4. **Land Slope** (degrees): 0-90°
5. **Population Density** (persons/km²): 0-5000

### Target Variable
- **0 (Low Risk)**: Safe conditions
- **1 (Medium Risk)**: Moderate flood potential
- **2 (High Risk)**: Significant flood threat

## 📡 API Endpoints

### 1. Health Check
```
GET /health
```
Check if the API is running.

**Response:**
```json
{
  "status": "healthy",
  "service": "GeoAware Flood Risk API",
  "version": "1.0.0"
}
```

### 2. Root
```
GET /
```
Welcome endpoint with API information.

**Response:**
```json
{
  "message": "Welcome to GeoAware Flood Risk API",
  "version": "1.0.0",
  "docs": "/docs",
  "openapi": "/openapi.json"
}
```

### 3. Predict Flood Risk
```
POST /api/v1/predict
```
Predict flood risk from environmental features.

**Request Body:**
```json
{
  "rainfall": 150.5,
  "river_level": 8.2,
  "soil_moisture": 65.0,
  "land_slope": 15.0,
  "population_density": 500.0
}
```

**Response:**
```json
{
  "risk_level": "medium",
  "confidence": 0.8542,
  "probability_distribution": {
    "low": 0.1245,
    "medium": 0.8542,
    "high": 0.0213
  }
}
```

### 4. Model Information
```
GET /api/v1/info
```
Get information about the loaded model.

**Response:**
```json
{
  "model_type": "RandomForestClassifier",
  "features": [
    "rainfall",
    "river_level",
    "soil_moisture",
    "land_slope",
    "population_density"
  ],
  "classes": ["low", "medium", "high"],
  "status": "ready"
}
```

## 📊 Dataset

The model is trained on flood risk data with the following characteristics:
- **Source**: Synthetically generated realistic flood dataset
- **Samples**: 2000 records
- **Features**: 5 environmental parameters
- **Target Distribution**: Balanced across 3 risk classes
- **Location**: `flood/data/processed/flood_dataset.csv`

Dataset generation includes realistic correlations:
- Higher rainfall increases flood risk
- Higher river levels increase flood risk
- Higher soil moisture increases flood risk
- Lower land slopes increase flood risk (easier water pooling)

## 🚀 How to Run

### Step 1: Create Virtual Environment
```bash
python -m venv venv
```

### Step 2: Activate Virtual Environment
**Windows:**
```bash
venv\Scripts\activate
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Prepare Dataset
```bash
python scripts/download_dataset.py
```
This downloads or generates the flood dataset.

### Step 5: Train the Model
```bash
python -m flood.ml.train
```
This trains the Random Forest model and saves:
- `flood/models/flood_model.pkl`
- `flood/models/scaler.pkl`

### Step 6: Start FastAPI Server
```bash
python -m uvicorn flood.main:app --host 0.0.0.0 --port 8000 --reload
```

Server runs at: `http://localhost:8000`

### Step 7: Access API Documentation
Open browser and navigate to:
- **Interactive Docs (Swagger UI)**: `http://localhost:8000/docs`
- **Alternative Docs (ReDoc)**: `http://localhost:8000/redoc`

## 📝 Example Request & Response

### Using cURL
```bash
curl -X POST "http://localhost:8000/api/v1/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "rainfall": 200.0,
    "river_level": 12.5,
    "soil_moisture": 75.0,
    "land_slope": 10.0,
    "population_density": 800.0
  }'
```

### Response
```json
{
  "risk_level": "high",
  "confidence": 0.9234,
  "probability_distribution": {
    "low": 0.0156,
    "medium": 0.061,
    "high": 0.9234
  }
}
```

### Using Python Requests
```python
import requests

url = "http://localhost:8000/api/v1/predict"
payload = {
    "rainfall": 150.5,
    "river_level": 8.2,
    "soil_moisture": 65.0,
    "land_slope": 15.0,
    "population_density": 500.0
}

response = requests.post(url, json=payload)
print(response.json())
```

### Using Postman
1. Create new POST request
2. URL: `http://localhost:8000/api/v1/predict`
3. Body (JSON):
```json
{
  "rainfall": 150.5,
  "river_level": 8.2,
  "soil_moisture": 65.0,
  "land_slope": 15.0,
  "population_density": 500.0
}
```

## 🔍 Monitoring & Logs

Application logs are written to:
- **Console**: INFO level and above
- **File**: `flood/logs/app.log` (DEBUG level and above)

View logs:
```bash
tail -f flood/logs/app.log
```

## 🛠️ Configuration

Edit `flood/config.py` to modify:
- Model hyperparameters
- Risk level thresholds
- Feature ranges
- Log directory
- Dataset paths

## 📦 Dependencies

- **fastapi**: Modern Python web framework
- **uvicorn**: ASGI server
- **pydantic**: Data validation and settings
- **scikit-learn**: ML algorithms and preprocessing
- **pandas**: Data manipulation
- **numpy**: Numerical computing

## 🔐 Input Validation

All inputs are validated for:
1. **Type**: Must be numeric
2. **Range**: Must be within acceptable bounds
3. **Completeness**: All 5 features required

Invalid inputs return HTTP 400 with detailed error messages.

## 📈 Model Performance

The Random Forest model achieves:
- **Training Accuracy**: ~92%
- **Testing Accuracy**: ~89%
- **Cross-validation**: Stratified splits for balanced classes

See training logs for detailed metrics including precision, recall, and F1-scores.

## 🐛 Troubleshooting

### Model Not Loaded
- Ensure training script was run: `python -m flood.ml.train`
- Check `flood/models/` directory for `.pkl` files

### Dataset Not Found
- Run: `python scripts/download_dataset.py`
- Verify `flood/data/processed/flood_dataset.csv` exists

### Port Already in Use
```bash
uvicorn flood.main:app --port 8001
```

### Permission Errors
- Ensure execute permissions on scripts
- Check write permissions for logs directory

## 📄 License

This project is part of the GeoAware disaster risk assessment platform.

## 👥 Support

For issues or questions, refer to project documentation or contact the development team.
