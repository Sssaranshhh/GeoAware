"""
Download or prepare OSM road network data.
"""
import logging
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


def download_osm_data():
    """
    Download OSM data for a region.
    Uses overpass API or local files.

    In production, use osmnx or similar tools.
    """
    logger.info("📥 Downloading OSM data...")

    osm_dir = Config.OSM_DIR
    osm_dir.mkdir(parents=True, exist_ok=True)

    roads_file = osm_dir / "roads.geojson"

    # Check if already downloaded
    if roads_file.exists():
        logger.info(f"✓ OSM data already exists: {roads_file}")
        return

    try:
        # Try to use osmnx to download
        import osmnx as ox

        logger.info("Using osmnx to download OSM data...")

        # Example region: Mumbai, India
        place = "Mumbai, India"
        tags = {"highway": True}

        G = ox.graph_from_place(place, network_type="drive", simplify=True, truncate_by_edge=True)
        logger.info(f"✓ Downloaded graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges")

        # Save as GeoJSON
        gdf = ox.graph_to_gdfs(G)[1]  # Get edges
        gdf.to_file(roads_file, driver="GeoJSON")
        logger.info(f"✓ Saved roads to {roads_file}")

    except ImportError:
        logger.warning("⚠ osmnx not installed, skipping OSM download")
        logger.info("To download OSM data: pip install osmnx")
        return
    except Exception as e:
        logger.error(f"❌ Failed to download OSM data: {e}")
        logger.info("Continuing with synthetic road network...")


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    download_osm_data()
