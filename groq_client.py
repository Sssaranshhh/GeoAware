import logging
import json
import re
from groq import Groq
from config import GROQ_API_KEY


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GroqClient:
    """Client for Groq AI API - generates health insights"""
    
    def __init__(self):
        self.client = Groq(api_key=GROQ_API_KEY)
        self.model = "groq/compund"
    
    def generate_insights(self, aqi_data: dict) -> dict:
        """
        Generate health insights from air quality data using Groq AI
        
        Args:
            aqi_data: Dictionary with air quality measurements
            
        Returns:
            Dictionary with health precautions and advice
        """
        try:
            # Get latest measurements
            latest_pm10 = aqi_data.get('pm10', [0])[-1] if aqi_data.get('pm10') else 0
            latest_pm2_5 = aqi_data.get('pm2_5', [0])[-1] if aqi_data.get('pm2_5') else 0
            latest_aqi = aqi_data.get('us_aqi', [0])[-1] if aqi_data.get('us_aqi') else 0
            
            prompt = f"""
            Given the following air quality data:
            - PM10: {latest_pm10:.1f} µg/m³
            - PM2.5: {latest_pm2_5:.1f} µg/m³
            - US AQI: {latest_aqi}
            
            Please provide JSON format response with these exact keys:
            - "risk_level": One of (Low, Moderate, High, Severe, Critical)
            - "precautions": Health precautions (max 100 chars)
            - "best_time_to_go_out": Recommended time for outdoor activities
            - "summary": Brief summary of air quality impact (max 150 chars)
            
            Respond with ONLY valid JSON, no other text.
            """
            
            logger.info("Generating AI insights...")
            
            message = self.client.messages.create(
                model=self.model,
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            )
            
            response_text = message.content[0].text
            
            # Parse JSON from response
            try:
                insights = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from response
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    insights = json.loads(json_match.group())
                else:
                    raise ValueError("Could not parse JSON from response")
            
            # Validate and provide defaults
            return {
                "risk_level": insights.get("risk_level", "Unknown"),
                "precautions": insights.get("precautions", "Consult local health authorities"),
                "best_time_to_go_out": insights.get("best_time_to_go_out", "Early morning (5-7 AM)"),
                "summary": insights.get("summary", "Air quality data retrieved successfully")
            }
        
        except Exception as e:
            logger.error(f"Error generating insights: {e}")
            # Return default insights on error
            return {
                "risk_level": "Moderate",
                "precautions": "Wear a mask if AQI is high",
                "best_time_to_go_out": "Early morning (6-8 AM)",
                "summary": "Air quality retrieved. Consult health authorities for guidance."
            }
