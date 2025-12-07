"""
Global application state holder.
Prevents circular imports between main and api modules.
"""


class AppState:
    """Global application state for shared resources."""

    flood_model = None
    scaler = None
    road_graph = None
    hazard_processor = None
