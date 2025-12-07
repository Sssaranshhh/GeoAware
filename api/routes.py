"""
API routes for Flood Route Safety Navigator.
"""
import logging
from datetime import datetime
from typing import List

from fastapi import APIRouter, HTTPException, status
import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from api.schemas import RouteSafeRequest, RouteSafeResponse, RouteResponse
from api.advisory import AdvisoryGenerator
from hazard.forecast_processor import HazardProcessor
from hazard.hazard_layer import HazardLayer
from routing.graph_builder import find_nearest_node
from routing.pathfinder import FloodAwarePathfinder
from routing.cost import CostComputer
from ml.predict import predict_flood_risk
from config import Config
from state import AppState

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/route/safe", response_model=RouteSafeResponse)
async def compute_safe_route(request: RouteSafeRequest) -> RouteSafeResponse:
    """
    Compute flood-aware safe route.

    Steps:
    1. Validate request
    2. Generate hazard layer
    3. Find nearest road nodes
    4. Run pathfinder (A*)
    5. Compute hazard exposure
    6. Generate LLM advisory
    7. Return JSON response

    Args:
        request: Route request with origin, destination, time horizon

    Returns:
        RouteSafeResponse with primary + optional alternative routes
    """
    try:
        logger.info(f"Route request: ({request.origin_lat}, {request.origin_lon}) to ({request.dest_lat}, {request.dest_lon})")

        # Validate time horizon
        if request.time_horizon not in Config.TIME_HORIZONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid time_horizon. Must be one of {Config.TIME_HORIZONS}",
            )

        # Initialize components
        if not AppState.flood_model or not AppState.road_graph or not AppState.hazard_processor:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="System not fully initialized",
            )

        logger.info("Components initialized, starting route computation...")

        # Initialize modules
        hazard_layer = HazardLayer()
        pathfinder = FloodAwarePathfinder(AppState.road_graph)
        cost_computer = CostComputer(AppState.hazard_processor)
        advisory_gen = AdvisoryGenerator()

        # Prepare hazard input
        hazard_input = AppState.hazard_processor.prepare_hazard_input(request.time_horizon)
        logger.info(f"Hazard context: discharge_ratio={hazard_input['discharge_ratio']:.2f}")

        # Compute hazard grid
        hazard_grid = hazard_layer.compute_hazard_grid(
            hazard_input["forecast_discharge"],
            hazard_input["baseline_discharge"],
        )
        logger.info(f"✓ Hazard grid computed: shape={hazard_grid.shape}, range=[{hazard_grid.min():.2f}, {hazard_grid.max():.2f}]")

        # Find nearest nodes to origin and destination
        origin_node, origin_dist = find_nearest_node(
            AppState.road_graph,
            request.origin_lat,
            request.origin_lon,
        )
        dest_node, dest_dist = find_nearest_node(
            AppState.road_graph,
            request.dest_lat,
            request.dest_lon,
        )

        logger.info(f"Nearest nodes: origin_dist={origin_dist:.3f}km, dest_dist={dest_dist:.3f}km")

        if origin_dist > 1.0 or dest_dist > 1.0:
            logger.warning(f"⚠ Large distance to nearest road node (origin={origin_dist:.3f}km, dest={dest_dist:.3f}km)")

        # Compute primary route
        primary_path_result = pathfinder.find_path(origin_node, dest_node, hazard_grid)
        logger.info(f"✓ Primary path found: {len(primary_path_result['path'])} nodes, {primary_path_result['distance_km']:.2f}km")

        # Prepare route response
        path_coords = [(node[0], node[1]) for node in primary_path_result["path"]]

        # ML flood risk prediction on path
        if len(primary_path_result["path"]) > 0:
            sample_nodes = primary_path_result["path"][::max(1, len(primary_path_result["path"]) // 5)]
            if sample_nodes:
                # Create feature vector from nodes (6 features matching model training)
                sample_lat = np.mean([n[0] for n in sample_nodes])
                sample_lon = np.mean([n[1] for n in sample_nodes])
                mean_hazard = np.mean(primary_path_result.get("hazards_per_node", [0.3]))
                
                features = np.array([
                    mean_hazard * 2000,  # elevation (0-2000m)
                    5.0,  # slope (0-45°)
                    mean_hazard * 5000,  # river_proximity (0-5000m)
                    hazard_input["discharge_ratio"],  # discharge_ratio (1+)
                    mean_hazard,  # curvature (0-1)
                    2,  # land_cover_type (0-4, integer)
                ]).reshape(1, -1)

                flood_prob, _, _ = predict_flood_risk(features, AppState.flood_model, AppState.scaler)
                logger.info(f"ML flood risk prediction: {flood_prob:.2%}")

        # Generate advisory
        advisory = advisory_gen.generate_advisory(primary_path_result, hazard_input)
        logger.info(f"Advisory: {advisory}")

        # Compute efficiency class
        efficiency = cost_computer.classify_cost_efficiency(primary_path_result["hazard_exposure"])

        # Build primary route response
        primary_route = RouteResponse(
            route=path_coords,
            distance_km=primary_path_result["distance_km"],
            eta_minutes=primary_path_result["eta_minutes"],
            hazard_exposure=primary_path_result["hazard_exposure"],
            max_hazard=primary_path_result["max_hazard"],
            mean_hazard=primary_path_result["mean_hazard"],
            advisory=advisory,
            efficiency_class=efficiency,
        )

        # Alternative routes if requested
        alternative_routes = []
        if request.include_alternatives:
            logger.info("Computing alternative routes...")
            try:
                alt_results = pathfinder.find_alternative_paths(origin_node, dest_node, hazard_grid, num_alternatives=2)
                for i, alt_result in enumerate(alt_results[1:], 1):  # Skip primary
                    if alt_result.get("status") == "SUCCESS":
                        alt_coords = [(n[0], n[1]) for n in alt_result["path"]]
                        alt_advisory = advisory_gen.generate_advisory(alt_result, hazard_input)
                        alt_efficiency = cost_computer.classify_cost_efficiency(alt_result["hazard_exposure"])

                        alt_route = RouteResponse(
                            route=alt_coords,
                            distance_km=alt_result["distance_km"],
                            eta_minutes=alt_result["eta_minutes"],
                            hazard_exposure=alt_result["hazard_exposure"],
                            max_hazard=alt_result["max_hazard"],
                            mean_hazard=alt_result["mean_hazard"],
                            advisory=alt_advisory,
                            efficiency_class=alt_efficiency,
                        )
                        alternative_routes.append(alt_route)
                        logger.info(f"  Alt {i}: {alt_result['distance_km']:.2f}km, exposure={alt_result['hazard_exposure']:.2f}")
            except Exception as e:
                logger.warning(f"⚠ Alternative route computation failed: {e}")

        # Metadata
        metadata = {
            "timestamp": datetime.now().isoformat(),
            "time_horizon": request.time_horizon,
            "origin_snap_distance_km": origin_dist,
            "dest_snap_distance_km": dest_dist,
            "discharge_ratio": hazard_input["discharge_ratio"],
            "baseline_discharge": hazard_input["baseline_discharge"],
            "current_discharge": hazard_input["current_discharge"],
        }

        response = RouteSafeResponse(
            status="SUCCESS",
            primary_route=primary_route,
            alternative_routes=alternative_routes,
            metadata=metadata,
        )

        logger.info(f"✓ Route computation complete: status=SUCCESS")
        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error computing route: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route computation failed: {str(e)}",
        )
