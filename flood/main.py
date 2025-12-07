from fastapi import FastAPI
from contextlib import asynccontextmanager
from .config import API_TITLE, API_VERSION, API_DESCRIPTION, FLOOD_MODEL_PATH
from .api.routes import router, set_predictor
from .ml.predict import FloodRiskPredictor
from .utils.logger import setup_logger

logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Manage application startup and shutdown events.
    """
    # Startup
    logger.info("Starting GeoAware Flood Risk API...")
    try:
        predictor = FloodRiskPredictor()
        set_predictor(predictor)
        logger.info("✓ Model loaded successfully")
    except Exception as e:
        logger.error(f"✗ Failed to load model: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down GeoAware Flood Risk API...")


# Create FastAPI app
app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan
)

# Include routers
app.include_router(router)


@app.get(
    "/health",
    tags=["health"],
    summary="Health check",
    description="Check if API is running"
)
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "GeoAware Flood Risk API",
        "version": API_VERSION
    }


@app.get(
    "/",
    tags=["root"],
    summary="Root endpoint",
    description="Welcome to GeoAware API"
)
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to GeoAware Flood Risk API",
        "version": API_VERSION,
        "docs": "/docs",
        "openapi": "/openapi.json"
    }


if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting server on http://0.0.0.0:8000")
    uvicorn.run(
        "flood.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )