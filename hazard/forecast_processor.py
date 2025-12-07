"""
Flood forecast processor.
Parses and normalizes discharge data.
"""
import logging
from datetime import datetime, timedelta
from typing import Dict, Any
import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


class HazardProcessor:
    """Process flood forecasts and compute hazard layers."""

    def __init__(self):
        """Initialize processor."""
        self.historical_baseline = self._load_baseline()
        logger.info(f"✓ Hazard processor initialized with baseline: {self.historical_baseline:.2f} m³/s")

    def _load_baseline(self) -> float:
        """
        Load historical discharge baseline.
        In production, load from database or file.
        """
        # Mock baseline (75th percentile of historical data)
        return 850.0  # m³/s

    def get_current_discharge(self) -> float:
        """
        Get current river discharge.
        In production, fetch from USGS/IMD API.
        """
        # Mock data with daily variation
        now = datetime.now()
        hour = now.hour
        base = 500.0
        variation = 200 * np.sin(2 * np.pi * hour / 24)
        return base + variation

    def get_forecast_discharge(self, hours_ahead: int) -> float:
        """
        Get forecasted river discharge.
        In production, use flood forecasting models.

        Args:
            hours_ahead: Hours in future (24, 48, etc)

        Returns:
            Forecasted discharge (m³/s)
        """
        # Mock forecast with uncertainty
        base = self.get_current_discharge()
        # Simulate increasing discharge trend
        trend = 50 * (hours_ahead / 24)
        uncertainty = np.random.uniform(-100, 100)
        return max(base + trend + uncertainty, 100)

    def prepare_hazard_input(self, time_horizon: str) -> Dict[str, Any]:
        """
        Prepare hazard layer input based on time horizon.

        Args:
            time_horizon: "now", "24h", or "48h"

        Returns:
            Dict with discharge data
        """
        if time_horizon == "now":
            discharge = self.get_current_discharge()
        elif time_horizon == "24h":
            discharge = self.get_forecast_discharge(24)
        elif time_horizon == "48h":
            discharge = self.get_forecast_discharge(48)
        else:
            discharge = self.get_current_discharge()

        # Normalize vs baseline
        discharge_ratio = discharge / self.historical_baseline
        normalized_discharge = np.clip(discharge_ratio, 0.5, 3.0)

        return {
            "timestamp": datetime.now().isoformat(),
            "time_horizon": time_horizon,
            "current_discharge": self.get_current_discharge(),
            "forecast_discharge": discharge,
            "baseline_discharge": self.historical_baseline,
            "discharge_ratio": discharge_ratio,
            "normalized_discharge": normalized_discharge,
        }

    def compute_hazard_exposure(
        self, path_coords: list, hazard_grid: np.ndarray
    ) -> Dict[str, float]:
        """
        Compute total hazard exposure along a path.

        Args:
            path_coords: List of (lat, lon) tuples
            hazard_grid: Hazard grid

        Returns:
            Dict with max hazard, mean hazard, exposure score
        """
        if not path_coords:
            return {"max_hazard": 0.0, "mean_hazard": 0.0, "exposure_score": 0.0}

        hazard_scores = []
        for lat, lon in path_coords:
            # Map to grid
            grid_x = int((lon % 180) / 180 * hazard_grid.shape[1])
            grid_y = int((lat % 90) / 90 * hazard_grid.shape[0])
            grid_x = np.clip(grid_x, 0, hazard_grid.shape[1] - 1)
            grid_y = np.clip(grid_y, 0, hazard_grid.shape[0] - 1)
            hazard_scores.append(hazard_grid[grid_y, grid_x])

        hazard_scores = np.array(hazard_scores)
        max_hazard = float(hazard_scores.max())
        mean_hazard = float(hazard_scores.mean())
        # Exposure = weighted combination
        exposure_score = 0.4 * max_hazard + 0.6 * mean_hazard

        return {
            "max_hazard": max_hazard,
            "mean_hazard": mean_hazard,
            "exposure_score": exposure_score,
        }
