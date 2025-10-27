from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import pandas as pd
from datetime import datetime, timedelta
import numpy as np

router = APIRouter()


def _col(df, *candidates, default=None):
    """Return first existing column name from candidates, or None."""
    for c in candidates:
        if c in df.columns:
            return c
    return default


@router.get("/trends")
async def analyze_trends(
    disaster_type: Optional[str] = Query(None, description="Type of disaster to analyze"),
    region: Optional[str] = Query(None, description="Region to analyze"),
    days: int = Query(30, description="Number of days for analysis")
):
    try:
        df = pd.read_csv("Final_data.csv")

        # Determine date column or synthesize dates if missing
        date_col = _col(df, 'UTC_Date_Time', 'date', 'Date')
        if date_col:
            df['Date'] = pd.to_datetime(df[date_col], errors='coerce')
        else:
            # generate synthetic timestamps across last N days
            df['Date'] = pd.date_range(end=datetime.now(), periods=len(df), freq='H')

        # Column mappings for magnitude/depth/lat/lon
        mag_col = _col(df, 'Magnitude', 'magnitude', 'Mag', 'mag')
        depth_col = _col(df, 'Depth', 'depth')
        lat_col = _col(df, 'Latitude', 'latitude', 'Lat')
        lon_col = _col(df, 'Longitude', 'longitude', 'Lon')
        region_col = _col(df, 'Region', 'region')

        # Filter by region if provided and column exists
        if region and region_col:
            df = df[df[region_col].astype(str).str.contains(region, case=False, na=False)]

        # Filter to requested time window
        cutoff = datetime.now() - timedelta(days=days)
        df = df[df['Date'] >= cutoff]

        if df.empty:
            return {"status": "success", "message": "No data found", "data": {"frequency": 0}}

        # Build stats safely
        def safe_stat(column, func):
            if column and column in df.columns:
                return float(func(df[column].dropna()))
            return None

        trends = {
            "frequency": int(len(df)),
            "magnitude_stats": {
                "mean": safe_stat(mag_col, np.mean),
                "max": safe_stat(mag_col, np.max),
                "min": safe_stat(mag_col, np.min)
            },
            "depth_stats": {
                "mean": safe_stat(depth_col, np.mean),
                "max": safe_stat(depth_col, np.max),
                "min": safe_stat(depth_col, np.min)
            }
        }

        # hourly distribution
        df['hour'] = df['Date'].dt.hour
        trends['hourly_distribution'] = df.groupby('hour').size().to_dict()

        # top regions if available
        if region_col:
            trends['regions'] = df[region_col].value_counts().head(5).to_dict()

        # location clusters if lat/lon available
        if lat_col and lon_col:
            try:
                from sklearn.cluster import KMeans
                coords = df[[lat_col, lon_col]].dropna().values
                n = min(5, len(coords)) if len(coords) > 0 else 0
                if n > 0:
                    kmeans = KMeans(n_clusters=n, random_state=42).fit(coords)
                    centers = kmeans.cluster_centers_
                    labels = kmeans.labels_
                    counts = pd.Series(labels).value_counts().to_dict()
                    clusters = []
                    for i, center in enumerate(centers):
                        clusters.append({"center": {"lat": float(center[0]), "lon": float(center[1])}, "count": int(counts.get(i, 0))})
                    trends['location_clusters'] = clusters
            except Exception:
                # clustering is optional
                pass

        return {"status": "success", "data": trends}

    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Final_data.csv not found in project root")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


