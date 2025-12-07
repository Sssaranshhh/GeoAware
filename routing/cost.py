"""
Edge cost computation for routing.
Incorporates hazard exposure into path cost.
"""
import logging
from typing import Tuple

import numpy as np

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


class CostComputer:
    """Compute edge costs based on distance and hazard."""

    def __init__(self, hazard_processor=None):
        """
        Initialize cost computer.

        Args:
            hazard_processor: HazardProcessor instance for hazard access
        """
        self.hazard_processor = hazard_processor

    def compute_edge_cost(
        self,
        distance_km: float,
        start_hazard: float,
        end_hazard: float,
        node_pair_hazard: float = None,
    ) -> float:
        """
        Compute cost for an edge.

        Cost formula:
        cost = base_distance * (1 + alpha * hazard_score)

        Args:
            distance_km: Edge distance in km
            start_hazard: Hazard at start node (0-1)
            end_hazard: Hazard at end node (0-1)
            node_pair_hazard: Optional average hazard for the edge

        Returns:
            Cost (higher = avoid)
        """
        # Use average hazard or provided value
        if node_pair_hazard is None:
            hazard_score = (start_hazard + end_hazard) / 2
        else:
            hazard_score = node_pair_hazard

        # Ensure hazard in [0, 1]
        hazard_score = np.clip(hazard_score, 0, 1)

        # Base cost is distance
        base_cost = distance_km * Config.DISTANCE_WEIGHT

        # Add hazard penalty
        hazard_multiplier = 1 + Config.HAZARD_WEIGHT_ALPHA * hazard_score

        cost = base_cost * hazard_multiplier

        return cost

    def compute_path_cost(self, path: list, distances: list, hazards: list) -> float:
        """
        Compute total cost for a path.

        Args:
            path: List of nodes
            distances: List of edge distances (km)
            hazards: List of node hazard scores (0-1)

        Returns:
            Total path cost
        """
        total_cost = 0.0

        for i in range(len(path) - 1):
            dist = distances[i]
            hazard_score = (hazards[i] + hazards[i + 1]) / 2
            edge_cost = self.compute_edge_cost(dist, hazards[i], hazards[i + 1], hazard_score)
            total_cost += edge_cost

        return total_cost

    def classify_cost_efficiency(self, hazard_score: float) -> str:
        """
        Classify route efficiency based on hazard exposure.

        Args:
            hazard_score: Average hazard (0-1)

        Returns:
            Efficiency classification
        """
        if hazard_score < 0.2:
            return "OPTIMAL"
        elif hazard_score < 0.5:
            return "GOOD"
        elif hazard_score < 0.75:
            return "ACCEPTABLE"
        else:
            return "RISKY"
