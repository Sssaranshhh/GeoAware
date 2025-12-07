"""
Configuration loader for Flood Route Safety Navigator.
"""
import os
from pathlib import Path


class Config:
    """Application configuration."""

    # Paths
    BASE_DIR = Path(__file__).resolve().parent
    DATA_DIR = BASE_DIR / "data"
    OSM_DIR = DATA_DIR / "osm"
    GRIDS_DIR = DATA_DIR / "grids"
    PROCESSED_DIR = DATA_DIR / "processed"
    MODEL_PATH = BASE_DIR / "models" / "flood_risk_model.pkl"
    SCALER_PATH = BASE_DIR / "models" / "scaler.pkl"
    GRAPH_PATH = BASE_DIR / "models" / "road_graph.pkl"

    # Ensure models directory exists
    os.makedirs(BASE_DIR / "models", exist_ok=True)

    # Hazard Classification Thresholds
    HAZARD_LOW_THRESHOLD = 0.3
    HAZARD_MEDIUM_THRESHOLD = 0.6
    HAZARD_HIGH_THRESHOLD = 0.8

    # A* Pathfinding Weights
    HAZARD_WEIGHT_ALPHA = 2.0  # Cost multiplier for hazard exposure
    DISTANCE_WEIGHT = 1.0  # Base distance weight

    # LLM Configuration
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-3.5-turbo")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    USE_GROQ = os.getenv("USE_GROQ", "false").lower() == "true"

    # Hazard Processing
    DISCHARGE_BASELINE_PERCENTILE = 75  # Historical baseline
    HAZARD_GRID_RESOLUTION = 100  # meters per cell
    RIVER_PROXIMITY_WEIGHT = 0.3
    ELEVATION_WEIGHT = 0.2
    SLOPE_WEIGHT = 0.2
    DISCHARGE_WEIGHT = 0.3

    # ML Model
    ML_TEST_SIZE = 0.2
    ML_RANDOM_STATE = 42
    ML_N_ESTIMATORS = 100
    ML_MAX_DEPTH = 15

    # Server
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    DEBUG = os.getenv("DEBUG", "false").lower() == "true"

    # Time Horizons
    TIME_HORIZONS = ["now", "24h", "48h"]
    DEFAULT_TIME_HORIZON = "now"
