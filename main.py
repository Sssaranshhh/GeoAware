from fastapi import FastAPI, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from models import (
    AQIRequest, RouteRequest, AnalysisResponse, HealthCheck,
    ModelStatus, TrainingResponse
)
from service import EnhancedAQIService


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Global service instance
service = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan manager for startup and shutdown"""
    # Startup
    logger.info("Starting up GeoAware Air Quality API...")
    global service
    service = EnhancedAQIService()
    service.initialize_ml_models()
    yield
    # Shutdown
    logger.info("Shutting down GeoAware Air Quality API...")


# Create FastAPI app
app = FastAPI(
    title="GeoAware Air Quality API",
    description="ML-powered air quality analysis with route optimization",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============ API Endpoints ============

@app.get("/health", response_model=HealthCheck, tags=["System"])
async def health_check():
    """
    Check API health status
    
    Returns:
        HealthCheck with status and timestamp
    """
    return HealthCheck(
        status="healthy" if service and service.ml_initialized else "degraded",
        timestamp=datetime.now().isoformat()
    )


@app.post("/analyze/location", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_location(request: AQIRequest):
    """
    Analyze air quality for a single location
    
    Args:
        request: Location with latitude and longitude
        
    Returns:
        LocationAnalysis with AQI data, AI insights, and ML predictions
    """
    try:
        result = service.process_single_location(request)
        return AnalysisResponse(
            location_or_route="location",
            data=result.dict()
        )
    except Exception as e:
        logger.error(f"Error analyzing location: {e}")
        return {"error": str(e)}


@app.post("/analyze/route", response_model=AnalysisResponse, tags=["Analysis"])
async def analyze_route(request: RouteRequest):
    """
    Analyze air quality for a route with multiple waypoints
    
    Args:
        request: Route with list of waypoints
        
    Returns:
        RouteAnalysis with segment-by-segment analysis and overall hazard
    """
    try:
        result = service.process_route(request)
        return AnalysisResponse(
            location_or_route="route",
            data=result.dict()
        )
    except Exception as e:
        logger.error(f"Error analyzing route: {e}")
        return {"error": str(e)}


@app.get("/models/status", response_model=ModelStatus, tags=["Models"])
async def get_model_status():
    """
    Get ML model status and initialization state
    
    Returns:
        ModelStatus with initialization flag and model names
    """
    return ModelStatus(
        ml_initialized=service.ml_initialized if service else False,
        models=[
            "pm10_model",
            "pm2_5_model",
            "carbon_monoxide_model",
            "nitrogen_dioxide_model",
            "ozone_model"
        ],
        timestamp=datetime.now().isoformat()
    )


@app.post("/models/train", response_model=TrainingResponse, tags=["Models"])
async def train_models(
    background_tasks: BackgroundTasks,
    n_samples: int = Query(1000, description="Number of training samples")
):
    """
    Train ML models with specified number of samples
    
    Args:
        n_samples: Number of synthetic training samples to generate
        
    Returns:
        TrainingResponse with status and task info
    """
    def train_task():
        logger.info(f"Starting model training with {n_samples} samples...")
        service.ml_pipeline.full_pipeline(n_samples=n_samples)
        service.ml_initialized = True
        logger.info("Model training completed")
    
    background_tasks.add_task(train_task)
    
    return TrainingResponse(
        status="training_started",
        samples=n_samples,
        timestamp=datetime.now().isoformat()
    )


@app.get("/", tags=["Info"])
async def root():
    """Root endpoint with API information"""
    return {
        "name": "GeoAware Air Quality API",
        "version": "1.0.0",
        "description": "ML-powered air quality analysis with route optimization",
        "docs": "/docs",
        "status": "healthy" if service and service.ml_initialized else "initializing"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
