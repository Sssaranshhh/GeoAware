from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from ml.model_predict import HazardPredictor

router = APIRouter()
predictor = HazardPredictor()

class PredictionRequest(BaseModel):
    latitude: float = Field(..., description="Latitude of the location", ge=-90, le=90)
    longitude: float = Field(..., description="Longitude of the location", ge=-180, le=180)
    depth: float = Field(..., description="Depth of the earthquake in kilometers", ge=0)
    magnitude: float = Field(..., description="Magnitude of the earthquake", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "latitude": 34.0522,
                "longitude": -118.2437,
                "depth": 10.5,
                "magnitude": 5.4
            }
        }

@router.post("")  # This becomes /predict when mounted
async def predict_hazard(request: PredictionRequest):
    """
    Predict hazard level based on seismic parameters.
    Returns a hazard prediction on a scale where higher values indicate greater risk.
    """
    try:
        prediction = predictor.predict_hazard({
            "latitude": request.latitude,
            "longitude": request.longitude,
            "depth": request.depth,
            "magnitude": request.magnitude
        })
        
        return {
            "status": "success",
            "data": {
                "hazard_prediction": prediction,
                "input_params": {
                    "latitude": request.latitude,
                    "longitude": request.longitude,
                    "depth": request.depth,
                    "magnitude": request.magnitude
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
