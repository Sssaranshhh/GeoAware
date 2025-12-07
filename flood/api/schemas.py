from pydantic import BaseModel, Field
from typing import Optional, Dict

class FloodInput(BaseModel):
    """Schema for flood risk prediction input."""
    
    rainfall: float = Field(
        ...,
        ge=0,
        le=500,
        description="Rainfall in millimeters (0-500 mm)"
    )
    river_level: float = Field(
        ...,
        ge=0,
        le=50,
        description="River level in meters (0-50 m)"
    )
    soil_moisture: float = Field(
        ...,
        ge=0,
        le=100,
        description="Soil moisture in percentage (0-100%)"
    )
    land_slope: float = Field(
        ...,
        ge=0,
        le=90,
        description="Land slope in degrees (0-90°)"
    )
    population_density: float = Field(
        ...,
        ge=0,
        le=5000,
        description="Population density in persons/km² (0-5000)"
    )

    class Config:
        example = {
            "rainfall": 150.5,
            "river_level": 8.2,
            "soil_moisture": 65.0,
            "land_slope": 15.0,
            "population_density": 500.0
        }


class FloodOutput(BaseModel):
    """Schema for flood risk prediction output."""
    
    risk_level: str = Field(
        ...,
        description="Risk level: 'low', 'medium', or 'high'"
    )
    confidence: float = Field(
        ...,
        ge=0,
        le=1,
        description="Confidence score (0-1)"
    )
    probability_distribution: Dict[str, float] = Field(
        ...,
        description="Probability for each risk level"
    )

    class Config:
        example = {
            "risk_level": "medium",
            "confidence": 0.85,
            "probability_distribution": {
                "low": 0.15,
                "medium": 0.85,
                "high": 0.0
            }
        }


class HealthCheckResponse(BaseModel):
    """Schema for health check response."""
    
    status: str
    message: str
    version: str


class ErrorResponse(BaseModel):
    """Schema for error responses."""
    
    error: str
    message: str
    status_code: int
