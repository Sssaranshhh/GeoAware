import os
from pathlib import Path

# Base paths
BASE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = BASE_DIR.parent

# Model paths
MODEL_DIR = BASE_DIR / "models"
FLOOD_MODEL_PATH = MODEL_DIR / "flood_model.pkl"
SCALER_PATH = MODEL_DIR / "scaler.pkl"

# Data paths
DATA_DIR = BASE_DIR / "data"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
FLOOD_DATASET_PATH = PROCESSED_DATA_DIR / "flood_dataset.csv"

# Log paths
LOG_DIR = BASE_DIR / "logs"
LOG_FILE = LOG_DIR / "app.log"

# API settings
API_TITLE = "GeoAware Flood Risk API"
API_VERSION = "1.0.0"
API_DESCRIPTION = "ML-powered API for flood risk prediction"

# ML settings
TEST_SIZE = 0.2
RANDOM_STATE = 42
N_ESTIMATORS = 100
MAX_DEPTH = 15

# Feature names
FEATURE_NAMES = [
    "rainfall",
    "river_level",
    "soil_moisture",
    "land_slope",
    "population_density"
]

# Risk level thresholds
RISK_THRESHOLDS = {
    "low": 0.33,
    "medium": 0.66,
    "high": 1.0
}
