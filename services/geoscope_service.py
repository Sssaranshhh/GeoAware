import httpx
from config import settings
from datetime import datetime

async def get_geoscope_earthquakes():
    """Fetch GEOSCOPE earthquakes for the current year.

    If the GEOSCOPE_API_URL is not configured, return a descriptive result
    instead of raising an AttributeError or making a bad HTTP request.
    """
    current_year = datetime.now().year

    if not settings.GEOSCOPE_API_URL:
        return {
            "status": "not_configured",
            "message": "GEOSCOPE_API_URL not set in settings"
        }

    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{settings.GEOSCOPE_API_URL}/{current_year}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            raise Exception(f"Error fetching GEOSCOPE data: {str(e)}")
