import numpy as np
from typing import Dict, List
import pickle
from ..config import SCALER_PATH, FEATURE_NAMES
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class FeatureProcessor:
    """Handle feature preprocessing and scaling."""

    def __init__(self, scaler=None):
        self.scaler = scaler

    def validate_input(self, data: Dict[str, float]) -> bool:
        """Validate input features."""
        required_fields = FEATURE_NAMES
        
        for field in required_fields:
            if field not in data:
                logger.warning(f"Missing field: {field}")
                return False
            
            try:
                float(data[field])
            except (TypeError, ValueError):
                logger.warning(f"Invalid type for field {field}: {type(data[field])}")
                return False
        
        return True

    def validate_ranges(self, data: Dict[str, float]) -> bool:
        """Validate feature value ranges."""
        ranges = {
            "rainfall": (0, 500),           # mm
            "river_level": (0, 50),         # m
            "soil_moisture": (0, 100),      # %
            "land_slope": (0, 90),          # degrees
            "population_density": (0, 5000) # persons/km²
        }

        for field, (min_val, max_val) in ranges.items():
            value = data[field]
            if not (min_val <= value <= max_val):
                logger.warning(
                    f"Field {field} value {value} out of range [{min_val}, {max_val}]"
                )
                return False
        
        return True

    def preprocess(self, data: Dict[str, float]) -> np.ndarray:
        """
        Preprocess and scale input features.
        
        Args:
            data: Dictionary with feature values
            
        Returns:
            Scaled feature array
        """
        if not self.validate_input(data):
            raise ValueError("Input validation failed")
        
        if not self.validate_ranges(data):
            raise ValueError("Input values out of acceptable range")

        # Extract features in order
        features = np.array([
            data[field] for field in FEATURE_NAMES
        ]).reshape(1, -1)

        # Scale features
        if self.scaler is None:
            logger.error("Scaler not loaded")
            raise RuntimeError("Scaler not initialized")

        scaled_features = self.scaler.transform(features)
        logger.debug(f"Features scaled: {scaled_features}")
        
        return scaled_features

    @staticmethod
    def load_scaler():
        """Load the fitted scaler."""
        try:
            with open(SCALER_PATH, "rb") as f:
                scaler = pickle.load(f)
            logger.info(f"Scaler loaded from {SCALER_PATH}")
            return scaler
        except FileNotFoundError:
            logger.error(f"Scaler file not found at {SCALER_PATH}")
            return None
        except Exception as e:
            logger.error(f"Error loading scaler: {e}")
            return None
