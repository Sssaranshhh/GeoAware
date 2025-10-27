import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ml.model_training import HazardModelTrainer
from routers import predict, weather, seismic, trends

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs("data/cache", exist_ok=True)
    
    if not os.path.exists("ml/models/hazard_model.pkl"):
        logging.info("Training initial ML model...")
        trainer = HazardModelTrainer()
        trainer.train()
    
    logging.info("GeoAware API started successfully")
    yield
    # Cleanup (if needed)
    logging.info("Shutting down GeoAware API")

app = FastAPI(
    title="GeoAware API",
    description="Real-time Geospatial Hazard Monitoring and Prediction",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(predict.router, prefix="/predict", tags=["predictions"])
app.include_router(weather.router, prefix="/data", tags=["data"])
app.include_router(seismic.router, prefix="/data", tags=["data"])
app.include_router(trends.router, prefix="/analyze", tags=["analysis"])

@app.get("/")
async def root():
    return {"message": "Welcome to GeoAware API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)