from fastapi import APIRouter, HTTPException
from services import usgs_service, geoscope_service

router = APIRouter()

@router.get("/seismic")
async def get_seismic_data():
    try:
        usgs_data = await usgs_service.get_recent_earthquakes()
        geoscope_data = await geoscope_service.get_geoscope_earthquakes()
        
        return {
            "status": "success",
            "data": {
                "usgs": usgs_data,
                "geoscope": geoscope_data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
