"""
Flood Route Safety Navigator - FastAPI Backend.
Main application entry point.
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from config import Config
from state import AppState
from api.routes import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI lifespan context manager.
    Handles startup and shutdown events.
    """
    # Startup
    logger.info("🚀 Starting Flood Route Safety Navigator...")

    try:
        from ml.predict import load_model
        from routing.graph_builder import load_graph
        from hazard.forecast_processor import HazardProcessor

        AppState.flood_model, AppState.scaler = load_model()
        logger.info("✓ ML model and scaler loaded")

        AppState.road_graph = load_graph()
        logger.info("✓ Road network graph loaded")

        AppState.hazard_processor = HazardProcessor()
        logger.info("✓ Hazard processor initialized")

        logger.info("✓ All systems initialized")
    except Exception as e:
        logger.error(f"❌ Startup error: {e}")
        raise

    yield

    # Shutdown
    logger.info("🛑 Shutting down application...")


# Create FastAPI app
app = FastAPI(
    title="Flood Route Safety Navigator",
    description="ML-powered flood-aware route optimization with LLM advisories",
    version="1.0.0",
    lifespan=lifespan,
)

# Include routers
app.include_router(api_router)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return JSONResponse(
        {
            "status": "ok",
            "service": "Flood Route Safety Navigator",
            "version": "1.0.0",
        },
        status_code=200,
    )


@app.get("/")
async def root():
    """Root endpoint."""
    return JSONResponse(
        {
            "message": "Flood Route Safety Navigator API",
            "endpoints": {
                "health": "/health",
                "route": "/route/safe",
            },
        }
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG,
    )
