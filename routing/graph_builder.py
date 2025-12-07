"""
Road network graph builder.
Loads OSM roads and converts to networkx graph.
"""
import logging
import pickle
from pathlib import Path
from typing import Optional, Tuple
import numpy as np

import networkx as nx

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


def load_graph() -> nx.Graph:
    """
    Load or create road network graph.

    Returns:
        NetworkX graph with roads
    """
    graph_path = Config.GRAPH_PATH

    if graph_path.exists():
        try:
            with open(graph_path, "rb") as f:
                graph = pickle.load(f)
            logger.info(f"✓ Loaded pre-built graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
            return graph
        except Exception as e:
            logger.warning(f"⚠ Failed to load graph: {e}, building new graph")

    # Build new graph
    logger.info("🔨 Building road network graph...")
    graph = build_graph()
    save_graph(graph)
    return graph


def build_graph() -> nx.Graph:
    """
    Build road network from OSM data or synthetic data.

    Returns:
        NetworkX graph
    """
    osm_dir = Config.OSM_DIR

    # Try to load OSM data
    roads_file = osm_dir / "roads.geojson"
    if roads_file.exists():
        return _load_from_geojson(roads_file)
    else:
        logger.warning("⚠ OSM data not found, generating synthetic road network")
        return _create_synthetic_graph()


def _load_from_geojson(filepath: Path) -> nx.Graph:
    """Load graph from GeoJSON file."""
    try:
        import geopandas as gpd

        gdf = gpd.read_file(filepath)
        logger.info(f"✓ Loaded {len(gdf)} road segments from GeoJSON")

        graph = nx.Graph()

        for idx, row in gdf.iterrows():
            if row.geometry.type == "LineString":
                coords = list(row.geometry.coords)
                for i in range(len(coords) - 1):
                    lat1, lon1 = coords[i]
                    lat2, lon2 = coords[i + 1]

                    node1 = (lat1, lon1)
                    node2 = (lat2, lon2)

                    # Calculate distance using haversine
                    distance = haversine_distance(lat1, lon1, lat2, lon2)

                    graph.add_edge(node1, node2, weight=distance, distance_km=distance)

        return graph

    except Exception as e:
        logger.error(f"Failed to load GeoJSON: {e}")
        return _create_synthetic_graph()


def _create_synthetic_graph() -> nx.Graph:
    """Create synthetic road network."""
    graph = nx.Graph()

    # Create a grid of roads in a region
    # Simulating a 10x10 km area with 0.5 km spacing
    n_points = 20
    lat_min, lat_max = 20.0, 20.1  # India region
    lon_min, lon_max = 72.0, 72.1

    nodes = []
    for i in range(n_points):
        for j in range(n_points):
            lat = lat_min + (lat_max - lat_min) * i / (n_points - 1)
            lon = lon_min + (lon_max - lon_min) * j / (n_points - 1)
            node = (lat, lon)
            nodes.append(node)
            graph.add_node(node, lat=lat, lon=lon)

    # Connect nodes to create roads (grid pattern + random connections)
    # Horizontal connections
    for i in range(n_points):
        for j in range(n_points - 1):
            node1 = nodes[i * n_points + j]
            node2 = nodes[i * n_points + j + 1]
            dist = haversine_distance(node1[0], node1[1], node2[0], node2[1])
            graph.add_edge(node1, node2, weight=dist, distance_km=dist)

    # Vertical connections
    for i in range(n_points - 1):
        for j in range(n_points):
            node1 = nodes[i * n_points + j]
            node2 = nodes[(i + 1) * n_points + j]
            dist = haversine_distance(node1[0], node1[1], node2[0], node2[1])
            graph.add_edge(node1, node2, weight=dist, distance_km=dist)

    logger.info(f"✓ Created synthetic graph: {graph.number_of_nodes()} nodes, {graph.number_of_edges()} edges")
    return graph


def save_graph(graph: nx.Graph):
    """Save graph to file."""
    Config.GRAPH_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(Config.GRAPH_PATH, "wb") as f:
        pickle.dump(graph, f)
    logger.info(f"✓ Graph saved to {Config.GRAPH_PATH}")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two points in km.

    Args:
        lat1, lon1: Point 1 (degrees)
        lat2, lon2: Point 2 (degrees)

    Returns:
        Distance in km
    """
    R = 6371  # Earth radius in km

    lat1_rad = np.radians(lat1)
    lat2_rad = np.radians(lat2)
    delta_lat = np.radians(lat2 - lat1)
    delta_lon = np.radians(lon2 - lon1)

    a = np.sin(delta_lat / 2) ** 2 + np.cos(lat1_rad) * np.cos(lat2_rad) * np.sin(delta_lon / 2) ** 2
    c = 2 * np.arcsin(np.sqrt(a))
    distance = R * c

    return distance


def find_nearest_node(graph: nx.Graph, lat: float, lon: float) -> Tuple[Tuple[float, float], float]:
    """
    Find nearest graph node to given coordinates.

    Args:
        graph: NetworkX graph
        lat, lon: Target coordinates

    Returns:
        (nearest_node, distance_km)
    """
    min_dist = float("inf")
    nearest = None

    for node in graph.nodes():
        dist = haversine_distance(lat, lon, node[0], node[1])
        if dist < min_dist:
            min_dist = dist
            nearest = node

    return nearest, min_dist
