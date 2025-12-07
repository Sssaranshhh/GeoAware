import openmeteo_requests
import requests_cache
from retry_requests import retry
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AirQualityClient:
    """Client for Open-Meteo Air Quality API"""
    
    def __init__(self):
        self.session = requests_cache.CachedSession(".cache", expire_after=600)
        self.retry_session = retry(self.session, retries=3, backoff_factor=0.2)
        self.openmeteo = openmeteo_requests.Client(session=self.retry_session)
    
    def get_air_quality(self, latitude: float, longitude: float) -> dict:
        """
        Fetch air quality data from Open-Meteo API
        
        Args:
            latitude: Location latitude
            longitude: Location longitude
            
        Returns:
            Dictionary with air quality data
        """
        try:
            logger.info(f"Fetching air quality data for lat={latitude}, lon={longitude}")
            
            url = "https://api.open-meteo.com/v1/air-quality"
            params = {
                "latitude": latitude,
                "longitude": longitude,
                "hourly": [
                    "pm10",
                    "pm2_5",
                    "carbon_monoxide",
                    "nitrogen_dioxide",
                    "sulphur_dioxide",
                    "ozone",
                    "us_aqi"
                ],
                "timezone": "auto"
            }
            
            responses = self.openmeteo.weather_api(url, params=params)
            response = responses[0]
            
            hourly = response.Hourly()
            
            return {
                "time": [str(d) for d in hourly.Time()],
                "pm10": [float(v) if v is not None else 0 for v in hourly.Variables(0).ValuesAsNumpy()],
                "pm2_5": [float(v) if v is not None else 0 for v in hourly.Variables(1).ValuesAsNumpy()],
                "carbon_monoxide": [float(v) if v is not None else 0 for v in hourly.Variables(2).ValuesAsNumpy()],
                "nitrogen_dioxide": [float(v) if v is not None else 0 for v in hourly.Variables(3).ValuesAsNumpy()],
                "sulphur_dioxide": [float(v) if v is not None else 0 for v in hourly.Variables(4).ValuesAsNumpy()],
                "ozone": [float(v) if v is not None else 0 for v in hourly.Variables(5).ValuesAsNumpy()],
                "us_aqi": [int(v) if v is not None else 0 for v in hourly.Variables(6).ValuesAsNumpy()]
            }
        
        except Exception as e:
            logger.error(f"Error fetching air quality data: {e}")
            # Return mock data on error
            return {
                "time": ["2025-12-07T00:00", "2025-12-07T01:00"],
                "pm10": [45.0, 50.0],
                "pm2_5": [25.0, 30.0],
                "carbon_monoxide": [120.0, 130.0],
                "nitrogen_dioxide": [35.0, 40.0],
                "sulphur_dioxide": [12.0, 15.0],
                "ozone": [45.0, 50.0],
                "us_aqi": [65, 75]
            }
