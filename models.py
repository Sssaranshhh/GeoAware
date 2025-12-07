from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


# ============ Request Models ============

class AQIRequest(BaseModel):
    """Request model for single location analysis"""
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")


class RoutePoint(BaseModel):
    """Individual point in a route"""
    latitude: float = Field(..., description="Latitude coordinate")
    longitude: float = Field(..., description="Longitude coordinate")
    order: int = Field(..., description="Order in the route sequence")


class RouteRequest(BaseModel):
    """Request model for route analysis"""
    points: List[RoutePoint] = Field(..., description="List of waypoints")
    snap_to_roads: bool = Field(False, description="Snap points to roads (future feature)")


# ============ Data Models ============

class Coordinates(BaseModel):
    """Geographic coordinates"""
    latitude: float
    longitude: float


class AQIData(BaseModel):
    """Air quality data from real API"""
    time: List[str]
    pm10: List[float]
    pm2_5: List[float]
    carbon_monoxide: List[float]
    nitrogen_dioxide: List[float]
    sulphur_dioxide: List[float]
    ozone: List[float]
    us_aqi: List[int]


class AIInsights(BaseModel):
    """AI-generated health insights"""
    precautions: str
    risk_level: str
    best_time_to_go_out: str
    summary: str


class MLPredictions(BaseModel):
    """ML model predictions for pollutants"""
    pm10: float
    pm2_5: float
    carbon_monoxide: float
    nitrogen_dioxide: float
    ozone: float
    us_aqi: int


class RouteSegment(BaseModel):
    """Individual segment of a route"""
    start_point: Coordinates
    end_point: Coordinates
    distance_km: float
    estimated_time_minutes: float
    avg_aqi: int
    hazard_level: str
    pollutant_predictions: MLPredictions


class LocationAnalysis(BaseModel):
    """Response for single location analysis"""
    coordinates: Coordinates
    aqi_data: AQIData
    ai_insights: AIInsights
    ml_predictions: MLPredictions
    timestamp: str


class RouteAnalysis(BaseModel):
    """Response for route analysis"""
    route_id: str
    total_distance_km: float
    total_time_minutes: float
    segments: List[RouteSegment]
    overall_hazard: str
    timestamp: str


class AnalysisResponse(BaseModel):
    """Unified response model"""
    location_or_route: str = Field(..., description="'location' or 'route'")
    data: Any


class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    timestamp: str


class ModelStatus(BaseModel):
    """ML model status response"""
    ml_initialized: bool
    models: List[str]
    timestamp: str


class TrainingResponse(BaseModel):
    """Training task response"""
    status: str
    samples: int
    timestamp: str
