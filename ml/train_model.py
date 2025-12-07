"""
ML model training module.
"""
import logging
import pickle
from pathlib import Path

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    roc_auc_score,
    accuracy_score,
)

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config
from ml.features import FeatureEngineer

logger = logging.getLogger(__name__)


def train_and_save_model():
    """
    Train RandomForest flood risk classifier and save model + scaler.

    Returns:
        (model, scaler)
    """
    logger.info("🔨 Starting model training...")

    # Load and engineer features
    engineer = FeatureEngineer()
    X, y = engineer.load_dataset()
    X = engineer.engineer_features(X)

    logger.info(f"Dataset shape: {X.shape}")
    logger.info(f"Target distribution: {np.bincount(y)}")

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=Config.ML_TEST_SIZE,
        random_state=Config.ML_RANDOM_STATE,
        stratify=y,
    )

    logger.info(f"Train set: {X_train.shape}, Test set: {X_test.shape}")

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train RandomForest
    model = RandomForestClassifier(
        n_estimators=Config.ML_N_ESTIMATORS,
        max_depth=Config.ML_MAX_DEPTH,
        random_state=Config.ML_RANDOM_STATE,
        n_jobs=-1,
        verbose=1,
    )

    model.fit(X_train_scaled, y_train)
    logger.info("✓ Model training complete")

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    y_proba = model.predict_proba(X_test_scaled)[:, 1]

    accuracy = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    logger.info(f"Accuracy: {accuracy:.4f}")
    logger.info(f"ROC-AUC: {auc:.4f}")
    logger.info("\nClassification Report:")
    logger.info(classification_report(y_test, y_pred))
    logger.info(f"\nConfusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

    # Feature importance
    feature_names = engineer.feature_names
    importances = model.feature_importances_
    for name, imp in zip(feature_names, importances):
        logger.info(f"  {name}: {imp:.4f}")

    # Save model and scaler
    Config.MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)

    with open(Config.MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    logger.info(f"✓ Model saved to {Config.MODEL_PATH}")

    with open(Config.SCALER_PATH, "wb") as f:
        pickle.dump(scaler, f)
    logger.info(f"✓ Scaler saved to {Config.SCALER_PATH}")

    return model, scaler


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )
    train_and_save_model()
