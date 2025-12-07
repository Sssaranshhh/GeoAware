"""
Hazard layer computation.
Combines elevation, slope, river proximity, and discharge data.
"""
import numpy as np
import logging
from pathlib import Path
from typing import Tuple

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


class HazardLayer:
    """Compute hazard scores per grid cell based on multiple factors."""

    def __init__(self):
        """Initialize hazard layer."""
        self.grid_resolution = Config.HAZARD_GRID_RESOLUTION
        self.grid_data = {}
        self._load_or_create_grids()

    def _load_or_create_grids(self):
        """Load grid data or create synthetic data."""
        grids_dir = Config.GRIDS_DIR

        # Try to load existing grids
        elevation_path = grids_dir / "elevation.npy"
        slope_path = grids_dir / "slope.npy"
        river_proximity_path = grids_dir / "river_proximity.npy"

        if elevation_path.exists():
            self.grid_data["elevation"] = np.load(elevation_path)
            self.grid_data["slope"] = np.load(slope_path)
            self.grid_data["river_proximity"] = np.load(river_proximity_path)
            logger.info("✓ Loaded existing grid data")
        else:
            logger.warning("⚠ Grid files not found, using synthetic data")
            # Create synthetic grids (e.g., 500x500 cells)
            size = (500, 500)
            self.grid_data["elevation"] = np.random.uniform(0, 2000, size)  # meters
            self.grid_data["slope"] = np.random.uniform(0, 45, size)  # degrees
            self.grid_data["river_proximity"] = np.random.uniform(0, 5000, size)  # meters

    def compute_hazard_grid(
        self, discharge_current: float, discharge_baseline: float
    ) -> np.ndarray:
        """
        Compute hazard score per grid cell.

        Args:
            discharge_current: Current river discharge (m³/s)
            discharge_baseline: Historical baseline discharge (m³/s)

        Returns:
            Hazard grid (0-1) normalized
        """
        elevation = self.grid_data["elevation"]
        slope = self.grid_data["slope"]
        river_proximity = self.grid_data["river_proximity"]

        # Normalize inputs to 0-1
        elev_norm = (elevation - elevation.min()) / (elevation.max() - elevation.min() + 1e-6)
        slope_norm = slope / 90.0  # Max slope 90 degrees
        prox_norm = 1.0 - np.clip(river_proximity / 5000, 0, 1)  # Closer to river = higher hazard

        # Discharge ratio (discharge above baseline = more hazard)
        discharge_ratio = max(discharge_current / (discharge_baseline + 1e-6), 1.0)
        discharge_norm = np.clip(np.log(discharge_ratio) / np.log(3), 0, 1)  # Log scale

        # Combine factors
        hazard = (
            Config.ELEVATION_WEIGHT * (1 - elev_norm)  # Lower elevation = more flooding risk
            + Config.SLOPE_WEIGHT * (1 - slope_norm)  # Flatter = more pooling
            + Config.RIVER_PROXIMITY_WEIGHT * prox_norm  # Closer to river = more risk
            + Config.DISCHARGE_WEIGHT * discharge_norm  # Increased discharge = more risk
        )

        # Normalize to 0-1
        hazard = np.clip(hazard, 0, 1)
        return hazard

    def get_cell_hazard(self, lat: float, lon: float, hazard_grid: np.ndarray) -> float:
        """
        Get hazard score for a specific lat/lon coordinate.

        Args:
            lat: Latitude
            lon: Longitude
            hazard_grid: Computed hazard grid

        Returns:
            Hazard score (0-1)
        """
        # Simple mapping (in production, use proper geospatial indexing)
        grid_x = int((lon % 180) / 180 * hazard_grid.shape[1])
        grid_y = int((lat % 90) / 90 * hazard_grid.shape[0])

        grid_x = np.clip(grid_x, 0, hazard_grid.shape[1] - 1)
        grid_y = np.clip(grid_y, 0, hazard_grid.shape[0] - 1)

        return float(hazard_grid[grid_y, grid_x])

    def classify_hazard(self, hazard_score: float) -> str:
        """Classify hazard level."""
        if hazard_score < Config.HAZARD_LOW_THRESHOLD:
            return "LOW"
        elif hazard_score < Config.HAZARD_MEDIUM_THRESHOLD:
            return "MEDIUM"
        elif hazard_score < Config.HAZARD_HIGH_THRESHOLD:
            return "HIGH"
        else:
            return "CRITICAL"
