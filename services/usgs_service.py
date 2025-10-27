import httpx
from config import settings
from datetime import datetime, timedelta
from typing import Dict, Optional
import json
import os

class USGSDataError(Exception):
    pass

async def get_recent_earthquakes(
    min_magnitude: float = 4.0,
    days: int = 7,
    bbox: Optional[tuple] = None
) -> Dict:
    params = {
        "format": "geojson",
        "starttime": (datetime.now() - timedelta(days=days)).isoformat(),
        "endtime": datetime.now().isoformat(),
        "minmagnitude": min_magnitude
    }
    
    if bbox:
        params["bbox"] = f"{bbox[0]},{bbox[1]},{bbox[2]},{bbox[3]}"
    
    cache_file = f"data/cache/usgs_{min_magnitude}_{days}.json"
    
    # Try to get cached data first
    if os.path.exists(cache_file):
        if (datetime.now() - datetime.fromtimestamp(os.path.getmtime(cache_file))).seconds < 3600:
            with open(cache_file, 'r') as f:
                return json.load(f)

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.USGS_API_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Cache the results
            os.makedirs(os.path.dirname(cache_file), exist_ok=True)
            with open(cache_file, 'w') as f:
                json.dump(data, f)
            
            return data
            
        except httpx.HTTPError as e:
            raise USGSDataError(f"Error fetching USGS data: {str(e)}")
        except Exception as e:
            raise USGSDataError(f"Unexpected error: {str(e)}")

async def get_historical_patterns(region: str, days: int = 365) -> Dict:
    """Analyze historical earthquake patterns for a region"""
    try:
        data = await get_recent_earthquakes(min_magnitude=3.0, days=days)
        features = data.get('features', [])
        
        # Analyze patterns
        patterns = {
            "total_earthquakes": len(features),
            "avg_magnitude": sum(f['properties']['mag'] for f in features) / len(features) if features else 0,
            "max_magnitude": max(f['properties']['mag'] for f in features) if features else 0,
            "frequent_depths": {}
        }
        
        return patterns
        
    except Exception as e:
        raise USGSDataError(f"Error analyzing patterns: {str(e)}")
