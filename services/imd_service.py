import httpx
from config import settings
from typing import Dict

async def get_current_weather() -> Dict:
    if not settings.IMD_WEATHER_URL:
        return {"status": "not_configured", "message": "IMD_WEATHER_URL not set"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.IMD_WEATHER_URL)
            response.raise_for_status()
            return {"status": "ok", "data": response.json()}
        except httpx.HTTPStatusError as e:
            status = getattr(e.response, 'status_code', 'unknown')
            return {"status": "error", "message": f"IMD returned HTTP {status}", "detail": str(e)}
        except httpx.HTTPError as e:
            return {"status": "error", "message": f"Network error fetching IMD weather: {str(e)}"}

async def get_rainfall_data() -> Dict:
    if not settings.IMD_RAINFALL_URL:
        return {"status": "not_configured", "message": "IMD_RAINFALL_URL not set"}

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(settings.IMD_RAINFALL_URL)
            response.raise_for_status()
            return {"status": "ok", "data": response.json()}
        except httpx.HTTPStatusError as e:
            status = getattr(e.response, 'status_code', 'unknown')
            return {"status": "error", "message": f"IMD returned HTTP {status}", "detail": str(e)}
        except httpx.HTTPError as e:
            return {"status": "error", "message": f"Network error fetching rainfall data: {str(e)}"}
