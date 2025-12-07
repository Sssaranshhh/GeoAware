"""
API request/response schemas.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class RouteSafeRequest(BaseModel):
    """Request schema for /route/safe endpoint."""

    origin_lat: float = Field(..., description="Origin latitude", ge=-90, le=90)
    origin_lon: float = Field(..., description="Origin longitude", ge=-180, le=180)
    dest_lat: float = Field(..., description="Destination latitude", ge=-90, le=90)
    dest_lon: float = Field(..., description="Destination longitude", ge=-180, le=180)
    time_horizon: str = Field(
        "now",
        description="Forecast horizon: 'now', '24h', or '48h'",
    )
    include_alternatives: bool = Field(
        False,
        description="Include 2 alternative routes",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "origin_lat": 20.5937,
                "origin_lon": 72.9629,
                "dest_lat": 20.6845,
                "dest_lon": 73.0524,
                "time_horizon": "now",
                "include_alternatives": False,
            }
        }


class RouteResponse(BaseModel):
    """Response schema for a single route."""

    route: List[tuple] = Field(
        ...,
        description="List of (lat, lon) coordinates",
    )
    distance_km: float = Field(..., description="Route distance in km")
    eta_minutes: int = Field(..., description="Estimated travel time in minutes")
    hazard_exposure: float = Field(
        ...,
        description="Normalized hazard exposure (0-1)",
    )
    max_hazard: float = Field(..., description="Maximum hazard on route (0-1)")
    mean_hazard: float = Field(..., description="Mean hazard on route (0-1)")
    advisory: str = Field(..., description="LLM-generated safety advisory")
    efficiency_class: str = Field(
        ...,
        description="Route efficiency: OPTIMAL, GOOD, ACCEPTABLE, RISKY",
    )


class RouteSafeResponse(BaseModel):
    """Response schema for /route/safe endpoint."""

    status: str = Field(..., description="Response status: SUCCESS, PARTIAL, ERROR")
    primary_route: RouteResponse = Field(..., description="Primary optimal route")
    alternative_routes: Optional[List[RouteResponse]] = Field(
        None,
        description="Alternative routes if requested",
    )
    metadata: dict = Field(
        default_factory=dict,
        description="Additional metadata (hazard info, timestamps, etc.)",
    )

    class Config:
        json_schema_extra = {
            "example": {
                "status": "SUCCESS",
                "primary_route": {
                    "route": [[20.5937, 72.9629], [20.6000, 72.9700]],
                    "distance_km": 10.5,
                    "eta_minutes": 21,
                    "hazard_exposure": 0.35,
                    "max_hazard": 0.50,
                    "mean_hazard": 0.30,
                    "advisory": "Route conditions show moderate flood risk. Remain cautious and avoid low-lying areas.",
                    "efficiency_class": "GOOD",
                },
                "alternative_routes": None,
                "metadata": {
                    "time_horizon": "now",
                    "discharge_ratio": 1.2,
                    "timestamp": "2024-01-15T14:30:00",
                },
            }
        }


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str
    version: str
