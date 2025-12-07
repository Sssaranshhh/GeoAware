import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
SERVICE_HOST = os.getenv("SERVICE_HOST", "0.0.0.0")
SERVICE_PORT = int(os.getenv("SERVICE_PORT", "8000"))
MODEL_DIR = os.getenv("MODEL_DIR", "models")

# Logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

# Open-Meteo API
OPENMETEO_BASE_URL = "https://api.open-meteo.com/v1"
