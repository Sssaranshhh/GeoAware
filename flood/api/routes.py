from fastapi import APIRouter, HTTPException
from .schemas import FloodInput, FloodOutput, ErrorResponse
from ..ml.predict import FloodRiskPredictor
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

router = APIRouter(prefix="/api/v1", tags=["flood-prediction"])

# Initialize predictor (will be loaded once at startup)
predictor = None


def set_predictor(pred: FloodRiskPredictor):
    """Set the predictor instance."""
    global predictor
    predictor = pred


@router.post(
    "/predict",
    response_model=FloodOutput,
    summary="Predict flood risk",
    description="Predict flood risk level based on environmental features"
)
async def predict_flood_risk(input_data: FloodInput) -> FloodOutput:
    """
    Predict flood risk from environmental features.
    
    Request body:
    - rainfall: mm
    - river_level: m
    - soil_moisture: %
    - land_slope: degrees
    - population_density: persons/km²
    
    Response:
    - risk_level: "low", "medium", or "high"
    - confidence: probability score
    - probability_distribution: scores for each level
    """
    try:
        if predictor is None:
            logger.error("Predictor not initialized")
            raise HTTPException(
                status_code=500,
                detail="Model not loaded"
            )

        logger.info(f"Received prediction request: {input_data}")

        # Convert input to dictionary
        features_dict = {
            "rainfall": input_data.rainfall,
            "river_level": input_data.river_level,
            "soil_moisture": input_data.soil_moisture,
            "land_slope": input_data.land_slope,
            "population_density": input_data.population_density
        }

        # Get prediction
        result = predictor.predict_flood_risk(features_dict)

        logger.info(f"Prediction result: {result}")

        return FloodOutput(**result)

    except ValueError as e:
        logger.error(f"Validation error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail="Prediction failed")


@router.get(
    "/info",
    summary="Get model information",
    description="Get information about the flood risk model"
)
async def get_model_info():
    """Get information about the loaded model."""
    try:
        if predictor is None or predictor.model is None:
            raise HTTPException(status_code=500, detail="Model not loaded")

        model_info = {
            "model_type": "RandomForestClassifier",
            "features": [
                "rainfall",
                "river_level",
                "soil_moisture",
                "land_slope",
                "population_density"
            ],
            "classes": ["low", "medium", "high"],
            "status": "ready"
        }

        return model_info

    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        raise HTTPException(status_code=500, detail="Error retrieving model info")
