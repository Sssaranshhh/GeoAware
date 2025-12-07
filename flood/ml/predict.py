import pickle
import numpy as np
from typing import Dict
from ..config import FLOOD_MODEL_PATH, RISK_THRESHOLDS
from .features import FeatureProcessor
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class FloodRiskPredictor:
    """Predict flood risk using trained ML model."""

    def __init__(self):
        self.model = None
        self.feature_processor = None
        self.load_model()

    def load_model(self):
        """Load trained model and initialize feature processor."""
        try:
            with open(FLOOD_MODEL_PATH, "rb") as f:
                self.model = pickle.load(f)
            logger.info(f"Model loaded from {FLOOD_MODEL_PATH}")
        except FileNotFoundError:
            logger.error(f"Model file not found at {FLOOD_MODEL_PATH}")
            raise
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise

        # Initialize feature processor with scaler
        scaler = FeatureProcessor.load_scaler()
        if scaler is None:
            raise RuntimeError("Failed to load scaler")
        
        self.feature_processor = FeatureProcessor(scaler=scaler)

    def predict_flood_risk(self, features_dict: Dict[str, float]) -> Dict:
        """
        Predict flood risk from input features.
        
        Args:
            features_dict: Dictionary with keys:
                - rainfall (mm)
                - river_level (m)
                - soil_moisture (%)
                - land_slope (degrees)
                - population_density (persons/km²)
        
        Returns:
            Dictionary with:
                - risk_level: "low", "medium", or "high"
                - confidence: probability score (0-1)
                - probability_distribution: scores for each class
        """
        try:
            # Preprocess features
            scaled_features = self.feature_processor.preprocess(features_dict)
            
            # Get prediction probability
            probabilities = self.model.predict_proba(scaled_features)[0]
            
            # Get predicted class
            prediction = self.model.predict(scaled_features)[0]
            
            # Map to risk level
            risk_map = {0: "low", 1: "medium", 2: "high"}
            risk_level = risk_map.get(prediction, "unknown")
            confidence = float(probabilities[prediction])
            
            logger.info(
                f"Prediction: {risk_level} (confidence: {confidence:.2f})"
            )
            
            return {
                "risk_level": risk_level,
                "confidence": round(confidence, 4),
                "probability_distribution": {
                    "low": round(float(probabilities[0]), 4),
                    "medium": round(float(probabilities[1]), 4),
                    "high": round(float(probabilities[2]), 4)
                }
            }
        except ValueError as e:
            logger.error(f"Validation error: {e}")
            raise
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            raise
