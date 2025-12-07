"""
Download or prepare flood forecast data.
"""
import logging
import sys
from pathlib import Path
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


def download_forecast_data():
    """
    Download flood discharge forecast data.
    Uses USGS/IMD APIs or mock data.

    In production, integrate with:
    - USGS NWIS API
    - Indian Meteorological Department (IMD)
    - Flood forecast models
    """
    logger.info("📥 Preparing forecast data...")

    # Create a mock discharge CSV for demonstration
    data_dir = Config.DATA_DIR / "forecast"
    data_dir.mkdir(parents=True, exist_ok=True)

    forecast_file = data_dir / "discharge_forecast.csv"

    if forecast_file.exists():
        logger.info(f"✓ Forecast data already exists: {forecast_file}")
        return

    try:
        import csv

        logger.info("Creating synthetic discharge forecast data...")

        # Synthetic data: time series of discharge
        hours = list(range(0, 72, 6))  # 3 days, 6-hour intervals
        baselines = [850.0] * len(hours)
        forecasts = [
            850.0,  # t=0
            900.0,  # t=6
            950.0,  # t=12
            1050.0,  # t=24
            1150.0,  # t=30
            1100.0,  # t=36
            1050.0,  # t=42
            1000.0,  # t=48
            950.0,  # t=54
            900.0,  # t=60
            850.0,  # t=66
            800.0,  # t=72
        ]

        with open(forecast_file, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["hour_ahead", "baseline_discharge", "forecast_discharge"])
            for h, base, forecast in zip(hours, baselines, forecasts):
                writer.writerow([h, base, forecast])

        logger.info(f"✓ Created forecast data: {forecast_file}")

    except Exception as e:
        logger.error(f"❌ Failed to create forecast data: {e}")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    download_forecast_data()
