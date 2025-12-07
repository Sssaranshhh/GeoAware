"""
Pathfinder using A* algorithm for flood-aware route optimization.
"""
import logging
import heapq
from typing import List, Tuple, Optional, Dict, Any
import numpy as np

import networkx as nx

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config
from routing.cost import CostComputer

logger = logging.getLogger(__name__)


class FloodAwarePathfinder:
    """A* pathfinder with hazard awareness."""

    def __init__(self, graph: nx.Graph, cost_computer: CostComputer = None):
        """
        Initialize pathfinder.

        Args:
            graph: NetworkX graph of roads
            cost_computer: CostComputer instance
        """
        self.graph = graph
        self.cost_computer = cost_computer or CostComputer()

    def heuristic(self, node: Tuple[float, float], goal: Tuple[float, float]) -> float:
        """
        Euclidean heuristic (straight-line distance).

        Args:
            node: Current node (lat, lon)
            goal: Goal node (lat, lon)

        Returns:
            Estimated distance in km
        """
        from routing.graph_builder import haversine_distance

        return haversine_distance(node[0], node[1], goal[0], goal[1])

    def find_path(
        self,
        start: Tuple[float, float],
        goal: Tuple[float, float],
        hazard_grid: np.ndarray,
    ) -> Dict[str, Any]:
        """
        Find optimal path using A* with hazard consideration.

        Args:
            start: Start node (lat, lon)
            goal: Goal node (lat, lon)
            hazard_grid: Hazard grid (0-1)

        Returns:
            Dict with path, distance, hazard exposure, etc.
        """
        # A* priority queue: (cost, counter, node, path, distance, hazards)
        counter = 0
        open_set = [(0, counter, start, [start], 0, [0])]
        counter += 1

        closed_set = set()
        g_score = {start: 0}  # Cost from start to node
        hazard_scores = {start: self._get_node_hazard(start, hazard_grid)}

        best_path = None
        best_cost = float("inf")

        while open_set:
            _, _, current, path, distance, hazards = heapq.heappop(open_set)

            if current in closed_set:
                continue

            closed_set.add(current)

            # Goal reached
            if self._is_close_to_goal(current, goal):
                path_cost = self._compute_path_cost(path, hazard_grid)
                if path_cost < best_cost:
                    best_path = path
                    best_cost = path_cost
                continue

            # Explore neighbors
            if current in self.graph:
                for neighbor in self.graph.neighbors(current):
                    if neighbor in closed_set:
                        continue

                    # Edge cost
                    edge_data = self.graph.get_edge_data(current, neighbor)
                    edge_distance = edge_data.get("distance_km", 1.0)

                    current_hazard = self._get_node_hazard(current, hazard_grid)
                    neighbor_hazard = self._get_node_hazard(neighbor, hazard_grid)
                    edge_cost = self.cost_computer.compute_edge_cost(
                        edge_distance, current_hazard, neighbor_hazard
                    )

                    tentative_g_score = g_score[current] + edge_cost

                    if neighbor not in g_score or tentative_g_score < g_score[neighbor]:
                        g_score[neighbor] = tentative_g_score
                        f_score = tentative_g_score + self.heuristic(neighbor, goal)

                        new_path = path + [neighbor]
                        new_distance = distance + edge_distance
                        new_hazards = hazards + [neighbor_hazard]

                        heapq.heappush(
                            open_set,
                            (f_score, counter, neighbor, new_path, new_distance, new_hazards),
                        )
                        counter += 1

        if best_path is None:
            logger.warning("⚠ No path found, returning direct route")
            return self._create_direct_route(start, goal, hazard_grid)

        # Compute path metrics
        path_coords = best_path
        total_distance = sum(
            [
                self.graph.get_edge_data(best_path[i], best_path[i + 1])["distance_km"]
                for i in range(len(best_path) - 1)
            ]
        )
        path_hazards = [self._get_node_hazard(node, hazard_grid) for node in best_path]
        max_hazard = max(path_hazards) if path_hazards else 0
        mean_hazard = np.mean(path_hazards) if path_hazards else 0
        exposure_score = 0.4 * max_hazard + 0.6 * mean_hazard

        return {
            "path": path_coords,
            "distance_km": total_distance,
            "eta_minutes": int(total_distance * 2),  # Assume 30 km/h avg
            "hazard_exposure": exposure_score,
            "max_hazard": max_hazard,
            "mean_hazard": mean_hazard,
            "hazards_per_node": path_hazards,
            "status": "SUCCESS",
        }

    def find_alternative_paths(
        self,
        start: Tuple[float, float],
        goal: Tuple[float, float],
        hazard_grid: np.ndarray,
        num_alternatives: int = 2,
    ) -> List[Dict[str, Any]]:
        """
        Find multiple alternative paths.

        Args:
            start: Start node
            goal: Goal node
            hazard_grid: Hazard grid
            num_alternatives: Number of alternatives to find

        Returns:
            List of path results
        """
        paths = []

        # Primary path
        primary = self.find_path(start, goal, hazard_grid)
        if primary["status"] == "SUCCESS":
            paths.append(primary)

        # For alternatives, we could modify the cost function or use Yen's k-shortest paths
        # Simple implementation: find path again with different hazard weight
        for _ in range(num_alternatives - 1):
            # Temporarily modify hazard weight to explore different routes
            original_alpha = Config.HAZARD_WEIGHT_ALPHA
            Config.HAZARD_WEIGHT_ALPHA *= 0.5  # Less weight on hazard for alternatives
            try:
                alt_path = self.find_path(start, goal, hazard_grid)
                if alt_path["status"] == "SUCCESS" and alt_path not in paths:
                    paths.append(alt_path)
            finally:
                Config.HAZARD_WEIGHT_ALPHA = original_alpha

        return paths

    def _get_node_hazard(self, node: Tuple[float, float], hazard_grid: np.ndarray) -> float:
        """Get hazard score for a node."""
        lat, lon = node
        grid_x = int((lon % 180) / 180 * hazard_grid.shape[1])
        grid_y = int((lat % 90) / 90 * hazard_grid.shape[0])
        grid_x = np.clip(grid_x, 0, hazard_grid.shape[1] - 1)
        grid_y = np.clip(grid_y, 0, hazard_grid.shape[0] - 1)
        return float(hazard_grid[grid_y, grid_x])

    def _is_close_to_goal(self, node: Tuple[float, float], goal: Tuple[float, float]) -> bool:
        """Check if node is close enough to goal."""
        dist = self.heuristic(node, goal)
        return dist < 0.1  # Within 100m

    def _compute_path_cost(self, path: list, hazard_grid: np.ndarray) -> float:
        """Compute total cost for path."""
        total_cost = 0
        for i in range(len(path) - 1):
            if self.graph.has_edge(path[i], path[i + 1]):
                edge_data = self.graph.get_edge_data(path[i], path[i + 1])
                distance = edge_data.get("distance_km", 1.0)
                h1 = self._get_node_hazard(path[i], hazard_grid)
                h2 = self._get_node_hazard(path[i + 1], hazard_grid)
                cost = self.cost_computer.compute_edge_cost(distance, h1, h2)
                total_cost += cost
        return total_cost

    def _create_direct_route(
        self,
        start: Tuple[float, float],
        goal: Tuple[float, float],
        hazard_grid: np.ndarray,
    ) -> Dict[str, Any]:
        """Create direct route when pathfinding fails."""
        from routing.graph_builder import haversine_distance

        distance = haversine_distance(start[0], start[1], goal[0], goal[1])
        start_hazard = self._get_node_hazard(start, hazard_grid)
        goal_hazard = self._get_node_hazard(goal, hazard_grid)
        exposure = (start_hazard + goal_hazard) / 2

        return {
            "path": [start, goal],
            "distance_km": distance,
            "eta_minutes": int(distance * 2),
            "hazard_exposure": exposure,
            "max_hazard": max(start_hazard, goal_hazard),
            "mean_hazard": exposure,
            "hazards_per_node": [start_hazard, goal_hazard],
            "status": "DIRECT_ROUTE",
        }
