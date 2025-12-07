"""
ML model prediction module.
"""
import logging
import pickle
from pathlib import Path
from typing import Tuple

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


def load_model() -> Tuple[RandomForestClassifier, StandardScaler]:
    """
    Load trained model and scaler.
    If not found, train from scratch.

    Returns:
        (model, scaler)
    """
    model_path = Config.MODEL_PATH
    scaler_path = Config.SCALER_PATH

    if model_path.exists() and scaler_path.exists():
        try:
            with open(model_path, "rb") as f:
                model = pickle.load(f)
            with open(scaler_path, "rb") as f:
                scaler = pickle.load(f)
            logger.info("✓ Loaded pre-trained model and scaler")
            return model, scaler
        except Exception as e:
            logger.warning(f"⚠ Failed to load model: {e}, training new model")

    # Train new model
    logger.info("🔨 Training new model...")
    from ml.train_model import train_and_save_model

    model, scaler = train_and_save_model()
    return model, scaler


def predict_flood_risk(
    features: np.ndarray, model: RandomForestClassifier, scaler: StandardScaler
) -> Tuple[float, int, dict]:
    """
    Predict flood risk for given features.

    Args:
        features: Input feature array (shape: (n_features,) or (n_samples, n_features))
        model: Trained RandomForest model
        scaler: StandardScaler for normalization

    Returns:
        (probability, class_label, metadata)
        - probability: float (0-1) flood risk probability
        - class_label: int (0=no flood, 1=flood)
        - metadata: dict with details
    """
    # Ensure 2D array
    if features.ndim == 1:
        features = features.reshape(1, -1)

    # Scale features
    features_scaled = scaler.transform(features)

    # Predict
    proba = model.predict_proba(features_scaled)
    class_label = model.predict(features_scaled)[0]

    # Extract probabilities
    prob_no_flood = float(proba[0, 0])
    prob_flood = float(proba[0, 1])

    # Create metadata
    metadata = {
        "class_label": int(class_label),
        "confidence": float(max(proba[0])),
        "prob_no_flood": prob_no_flood,
        "prob_flood": prob_flood,
        "feature_importance": None,  # Can add if needed
    }

    return prob_flood, int(class_label), metadata


def predict_batch(
    features_batch: np.ndarray,
    model: RandomForestClassifier,
    scaler: StandardScaler,
) -> np.ndarray:
    """
    Predict for batch of samples.

    Args:
        features_batch: (n_samples, n_features)
        model: Trained model
        scaler: Scaler

    Returns:
        Probabilities array (n_samples,)
    """
    features_scaled = scaler.transform(features_batch)
    probas = model.predict_proba(features_scaled)
    return probas[:, 1]  # Flood probability
