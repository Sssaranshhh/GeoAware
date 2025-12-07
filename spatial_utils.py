import math
from typing import List, Tuple, Dict
from models import Coordinates, RouteSegment, MLPredictions


class SpatialAnalyzer:
    """Handles geographic and spatial analysis operations"""
    
    EARTH_RADIUS_KM = 6371
    ASSUMED_SPEED_KMH = 40
    
    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """
        Calculate great-circle distance between two points using Haversine formula
        
        Args:
            lat1, lon1: First point coordinates (degrees)
            lat2, lon2: Second point coordinates (degrees)
            
        Returns:
            Distance in kilometers
        """
        lat1_rad = math.radians(lat1)
        lon1_rad = math.radians(lon1)
        lat2_rad = math.radians(lat2)
        lon2_rad = math.radians(lon2)
        
        dlat = lat2_rad - lat1_rad
        dlon = lon2_rad - lon1_rad
        
        a = math.sin(dlat / 2) ** 2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2) ** 2
        c = 2 * math.asin(math.sqrt(a))
        
        return SpatialAnalyzer.EARTH_RADIUS_KM * c
    
    @staticmethod
    def snap_to_roads(latitude: float, longitude: float) -> Tuple[float, float]:
        """
        Snap point to nearest road (framework for future real road network integration)
        
        Args:
            latitude, longitude: Point coordinates
            
        Returns:
            Snapped coordinates
        """
        # Currently returns same point; ready for real road network API integration
        return latitude, longitude
    
    @staticmethod
    def interpolate_route(points: List[Dict]) -> List[Tuple[float, float, float]]:
        """
        Create route segments with distance calculation
        
        Args:
            points: List of route points with order
            
        Returns:
            List of (segment_distance_km, segment_time_minutes, mid_point_coords)
        """
        # Sort by order
        sorted_points = sorted(points, key=lambda p: p['order'])
        
        segments = []
        total_distance = 0
        
        for i in range(len(sorted_points) - 1):
            p1 = sorted_points[i]
            p2 = sorted_points[i + 1]
            
            distance_km = SpatialAnalyzer.haversine_distance(
                p1['latitude'], p1['longitude'],
                p2['latitude'], p2['longitude']
            )
            
            time_minutes = (distance_km / SpatialAnalyzer.ASSUMED_SPEED_KMH) * 60
            
            # Calculate midpoint
            mid_lat = (p1['latitude'] + p2['latitude']) / 2
            mid_lon = (p1['longitude'] + p2['longitude']) / 2
            
            segments.append({
                'distance_km': distance_km,
                'time_minutes': time_minutes,
                'mid_point': (mid_lat, mid_lon),
                'start': (p1['latitude'], p1['longitude']),
                'end': (p2['latitude'], p2['longitude'])
            })
            
            total_distance += distance_km
        
        return segments
    
    @staticmethod
    def analyze_route_hazards(aqi_values: List[int]) -> str:
        """
        Determine overall hazard level based on AQI values
        
        Args:
            aqi_values: List of AQI measurements
            
        Returns:
            Hazard level: 'Low', 'Moderate', 'High', 'Severe', or 'Critical'
        """
        if not aqi_values:
            return "Unknown"
        
        avg_aqi = sum(aqi_values) / len(aqi_values)
        max_aqi = max(aqi_values)
        
        # Use maximum AQI for hazard determination
        if max_aqi <= 50:
            return "Low"
        elif max_aqi <= 100:
            return "Moderate"
        elif max_aqi <= 150:
            return "High"
        elif max_aqi <= 200:
            return "Severe"
        else:
            return "Critical"
    
    @staticmethod
    def get_hazard_color(hazard_level: str) -> str:
        """Get color code for hazard level (for visualization)"""
        colors = {
            "Low": "#2ecc71",      # Green
            "Moderate": "#f39c12",  # Orange
            "High": "#e74c3c",      # Red
            "Severe": "#8b0000",    # Dark Red
            "Critical": "#4a0000"   # Very Dark Red
        }
        return colors.get(hazard_level, "#95a5a6")  # Gray default
