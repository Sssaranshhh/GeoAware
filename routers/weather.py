from fastapi import APIRouter, HTTPException
from services import imd_service

router = APIRouter()

@router.get("/weather")
async def get_weather_data():
    try:
        weather = await imd_service.get_current_weather()
        rainfall = await imd_service.get_rainfall_data()
        
        return {
            "status": "success",
            "source": "IMD",
            "data": {
                "weather": weather,
                "rainfall": rainfall
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
