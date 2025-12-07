"""
Preprocess elevation, slope, and river-proximity grids.
"""
import logging
import sys
from pathlib import Path

import numpy as np

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


def preprocess_grids():
    """
    Compute or load elevation, slope, and river-proximity grids.

    In production:
    - Load DEM (Digital Elevation Model) from USGS/SRTM
    - Compute slope from DEM
    - Use hydrological data to find river networks
    - Compute distance to nearest river
    """
    logger.info("🔨 Preprocessing grids...")

    grids_dir = Config.GRIDS_DIR
    grids_dir.mkdir(parents=True, exist_ok=True)

    elevation_path = grids_dir / "elevation.npy"
    slope_path = grids_dir / "slope.npy"
    river_proximity_path = grids_dir / "river_proximity.npy"

    # Check if already exist
    if all(p.exists() for p in [elevation_path, slope_path, river_proximity_path]):
        logger.info("✓ Grid files already exist")
        return

    try:
        logger.info("Creating synthetic grid data...")

        # Grid parameters
        grid_size = (500, 500)
        
        # Create elevation grid (0-2000m, with valleys and peaks)
        elevation = np.random.uniform(0, 2000, grid_size)
        # Add some spatial correlation (smoothing)
        from scipy.ndimage import gaussian_filter
        elevation = gaussian_filter(elevation, sigma=10)
        logger.info(f"✓ Elevation grid: shape={elevation.shape}, range=[{elevation.min():.0f}, {elevation.max():.0f}]m")

        # Compute slope from elevation
        gy, gx = np.gradient(elevation)
        slope = np.degrees(np.arctan(np.sqrt(gx**2 + gy**2)))
        slope = np.clip(slope, 0, 90)
        logger.info(f"✓ Slope grid: range=[{slope.min():.1f}, {slope.max():.1f}]°")

        # River proximity (simulate river network)
        # Create synthetic river network
        river_network = np.zeros(grid_size)
        # Add main river (vertical line)
        river_network[:, 250] = 1
        # Add tributaries
        river_network[100:200, 100:300] = np.where(elevation[100:200, 100:300] < 500, 1, 0)
        river_network[300:450, 150:350] = np.where(elevation[300:450, 150:350] < 400, 1, 0)
        
        # Compute distance to nearest river
        river_proximity = np.zeros(grid_size)
        for i in range(grid_size[0]):
            for j in range(grid_size[1]):
                if river_network[i, j] > 0:
                    river_proximity[i, j] = 0
                else:
                    distances = np.where(river_network > 0)
                    if len(distances[0]) > 0:
                        min_dist = np.min(np.sqrt((distances[0] - i)**2 + (distances[1] - j)**2))
                        river_proximity[i, j] = min_dist * 100  # Convert to meters
        
        logger.info(f"✓ River proximity grid: range=[{river_proximity.min():.0f}, {river_proximity.max():.0f}]m")

        # Save grids
        np.save(elevation_path, elevation)
        np.save(slope_path, slope)
        np.save(river_proximity_path, river_proximity)

        logger.info(f"✓ Grids saved:")
        logger.info(f"  - {elevation_path}")
        logger.info(f"  - {slope_path}")
        logger.info(f"  - {river_proximity_path}")

    except ImportError as e:
        logger.warning(f"⚠ scipy not available: {e}")
        logger.info("Installing scipy: pip install scipy")
        # Create without smoothing
        grid_size = (500, 500)
        elevation = np.random.uniform(0, 2000, grid_size)
        slope = np.random.uniform(0, 45, grid_size)
        river_proximity = np.random.uniform(0, 5000, grid_size)
        
        np.save(elevation_path, elevation)
        np.save(slope_path, slope)
        np.save(river_proximity_path, river_proximity)
        
        logger.info("✓ Created synthetic grids (without smoothing)")

    except Exception as e:
        logger.error(f"❌ Failed to preprocess grids: {e}")
        raise


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    preprocess_grids()
