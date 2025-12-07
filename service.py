import logging
from datetime import datetime
from typing import Union
from air_quality_client import AirQualityClient
from groq_client import GroqClient
from spatial_utils import SpatialAnalyzer
from ml_pipeline import AirQualityMLPipeline
from models import (
    AQIRequest, RouteRequest, LocationAnalysis, RouteAnalysis, 
    RouteSegment, Coordinates, AQIData, AIInsights, MLPredictions
)


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EnhancedAQIService:
    """Enhanced service for air quality analysis with ML and spatial processing"""
    
    def __init__(self):
        self.aqi_client = AirQualityClient()
        self.groq_client = GroqClient()
        self.spatial_analyzer = SpatialAnalyzer()
        self.ml_pipeline = AirQualityMLPipeline()
        self.ml_initialized = False
    
    def initialize_ml_models(self):
        """Initialize ML models: load existing or train new"""
        logger.info("Initializing ML models...")
        
        # Try to load existing models
        if self.ml_pipeline.load_models():
            logger.info("ML models initialized successfully")
            self.ml_initialized = True
        else:
            # Train new models if none exist
            logger.info("No existing models found. Training new models...")
            result = self.ml_pipeline.full_pipeline(n_samples=500)
            if result['status'] == 'success':
                logger.info("ML models initialized successfully")
                self.ml_initialized = True
            else:
                logger.error("Failed to initialize ML models")
                self.ml_initialized = False
    
    def generate_ml_features(self, latitude: float, longitude: float) -> dict:
        """Generate ML features from location and time"""
        from datetime import datetime
        
        now = datetime.now()
        return {
            'latitude': latitude,
            'longitude': longitude,
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'is_weekend': 1 if now.weekday() >= 5 else 0,
            'temperature': 25,  # Mock temperature
            'humidity': 60,     # Mock humidity
            'wind_speed': 5,    # Mock wind speed
            'traffic_density': 50  # Mock traffic density
        }
    
    def process_single_location(self, request: AQIRequest) -> LocationAnalysis:
        """
        Process single location: fetch AQI data, generate insights, make predictions
        
        Args:
            request: Location request with latitude/longitude
            
        Returns:
            LocationAnalysis with all data
        """
        logger.info(f"Processing location: {request.latitude}, {request.longitude}")
        
        # Fetch real AQI data
        aqi_data_dict = self.aqi_client.get_air_quality(request.latitude, request.longitude)
        
        # Create AQIData model
        aqi_data = AQIData(**aqi_data_dict)
        
        # Generate AI insights
        insights_dict = self.groq_client.generate_insights(aqi_data_dict)
        ai_insights = AIInsights(**insights_dict)
        
        # Generate ML predictions
        features = self.generate_ml_features(request.latitude, request.longitude)
        if self.ml_initialized:
            ml_preds = self.ml_pipeline.predict(features)
            # Calculate US AQI from predictions (simplified)
            us_aqi = int(max(ml_preds['pm2_5'], ml_preds['pm10'] / 2))
            ml_preds['us_aqi'] = us_aqi
        else:
            # Fallback predictions if ML not initialized
            ml_preds = {
                'pm10': 50.0,
                'pm2_5': 30.0,
                'carbon_monoxide': 130.0,
                'nitrogen_dioxide': 40.0,
                'ozone': 50.0,
                'us_aqi': 75
            }
        
        ml_predictions = MLPredictions(**ml_preds)
        
        return LocationAnalysis(
            coordinates=Coordinates(latitude=request.latitude, longitude=request.longitude),
            aqi_data=aqi_data,
            ai_insights=ai_insights,
            ml_predictions=ml_predictions,
            timestamp=datetime.now().isoformat()
        )
    
    def process_route(self, request: RouteRequest) -> RouteAnalysis:
        """
        Process route: interpolate segments, analyze each, determine overall hazard
        
        Args:
            request: Route request with waypoints
            
        Returns:
            RouteAnalysis with segment and overall analysis
        """
        logger.info(f"Processing route with {len(request.points)} waypoints")
        
        # Convert points to dict format for spatial analyzer
        points_list = [p.dict() for p in request.points]
        
        # Interpolate route segments
        segments_data = self.spatial_analyzer.interpolate_route(points_list)
        
        route_segments = []
        all_aqi_values = []
        
        for segment in segments_data:
            # Get analysis for segment midpoint
            mid_lat, mid_lon = segment['mid_point']
            
            # Fetch AQI data for midpoint
            aqi_data_dict = self.aqi_client.get_air_quality(mid_lat, mid_lon)
            
            # Get average AQI for this segment
            avg_aqi = int(sum(aqi_data_dict['us_aqi']) / len(aqi_data_dict['us_aqi']))
            all_aqi_values.append(avg_aqi)
            
            # Generate ML predictions for segment
            features = self.generate_ml_features(mid_lat, mid_lon)
            if self.ml_initialized:
                ml_preds = self.ml_pipeline.predict(features)
                us_aqi = int(max(ml_preds['pm2_5'], ml_preds['pm10'] / 2))
                ml_preds['us_aqi'] = us_aqi
            else:
                ml_preds = {
                    'pm10': 50.0,
                    'pm2_5': 30.0,
                    'carbon_monoxide': 130.0,
                    'nitrogen_dioxide': 40.0,
                    'ozone': 50.0,
                    'us_aqi': avg_aqi
                }
            
            ml_predictions = MLPredictions(**ml_preds)
            
            # Determine hazard level for segment
            hazard_level = self.spatial_analyzer.analyze_route_hazards([avg_aqi])
            
            # Create route segment
            route_segment = RouteSegment(
                start_point=Coordinates(
                    latitude=segment['start'][0],
                    longitude=segment['start'][1]
                ),
                end_point=Coordinates(
                    latitude=segment['end'][0],
                    longitude=segment['end'][1]
                ),
                distance_km=segment['distance_km'],
                estimated_time_minutes=segment['time_minutes'],
                avg_aqi=avg_aqi,
                hazard_level=hazard_level,
                pollutant_predictions=ml_predictions
            )
            
            route_segments.append(route_segment)
        
        # Calculate overall route metrics
        total_distance = sum(s.distance_km for s in route_segments)
        total_time = sum(s.estimated_time_minutes for s in route_segments)
        overall_hazard = self.spatial_analyzer.analyze_route_hazards(all_aqi_values)
        
        return RouteAnalysis(
            route_id=f"route_{datetime.now().strftime('%Y_%m_%d_%H%M%S')}",
            total_distance_km=round(total_distance, 2),
            total_time_minutes=round(total_time, 2),
            segments=route_segments,
            overall_hazard=overall_hazard,
            timestamp=datetime.now().isoformat()
        )


# Legacy compatibility wrapper
class AQIService(EnhancedAQIService):
    """Backward compatibility class"""
    pass
