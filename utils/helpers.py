from typing import Dict, Any
import logging
import json
from datetime import datetime

def validate_coordinates(lat: float, lon: float) -> bool:
    return -90 <= lat <= 90 and -180 <= lon <= 180

def format_response(data: Any, source: str = None) -> Dict:
    return {
        "status": "success",
        "timestamp": datetime.now().isoformat(),
        "source": source,
        "data": data
    }

def save_to_cache(data: Dict, filename: str) -> None:
    try:
        with open(f"data/cache/{filename}", "w") as f:
            json.dump(data, f)
    except Exception as e:
        logging.error(f"Cache write error: {str(e)}")
