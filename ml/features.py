"""
Feature engineering and preprocessing for ML model.
"""
import numpy as np
import logging
from typing import Tuple
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config import Config

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Feature engineering and preprocessing."""

    def __init__(self):
        """Initialize feature engineer."""
        self.feature_names = [
            "elevation",
            "slope",
            "river_proximity",
            "discharge_ratio",
            "curvature",
            "land_cover_type",
        ]

    def load_dataset(self) -> Tuple[np.ndarray, np.ndarray]:
        """
        Load or generate training dataset.

        Returns:
            (X, y) where X is features and y is labels (flood risk 0/1)
        """
        processed_dir = Config.PROCESSED_DIR
        data_path = processed_dir / "flood_dataset.csv"

        if data_path.exists():
            import pandas as pd

            df = pd.read_csv(data_path)
            logger.info(f"✓ Loaded dataset with {len(df)} samples")

            # Assume last column is target
            X = df.iloc[:, :-1].values
            y = df.iloc[:, -1].values
            return X, y
        else:
            logger.warning("⚠ Dataset not found, generating synthetic data")
            return self._generate_synthetic_dataset()

    def _generate_synthetic_dataset(self) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data."""
        n_samples = 5000
        n_features = len(self.feature_names)

        # Generate features
        X = np.random.randn(n_samples, n_features)

        # Normalize features
        X[:, 0] = np.random.uniform(0, 2000, n_samples)  # elevation (0-2000m)
        X[:, 1] = np.random.uniform(0, 45, n_samples)  # slope (0-45°)
        X[:, 2] = np.random.uniform(0, 5000, n_samples)  # river_proximity (0-5000m)
        X[:, 3] = np.random.exponential(1.5, n_samples)  # discharge_ratio (1+)
        X[:, 4] = np.random.uniform(0, 1, n_samples)  # curvature (0-1)
        X[:, 5] = np.random.randint(0, 5, n_samples)  # land_cover_type (0-4)

        # Generate labels based on feature relationships
        y = (
            (X[:, 0] < 100) * 0.3  # Low elevation -> flood risk
            + (X[:, 1] < 5) * 0.2  # Flat terrain -> flood risk
            + (X[:, 2] < 500) * 0.3  # Close to river -> flood risk
            + (X[:, 3] > 2) * 0.2  # High discharge -> flood risk
        )
        y = (y > 0.5).astype(int)

        logger.info(f"✓ Generated synthetic dataset: {n_samples} samples")
        logger.info(f"  Class distribution: {(y == 0).sum()} non-flood, {(y == 1).sum()} flood")

        return X, y

    def preprocess_features(self, X: np.ndarray) -> np.ndarray:
        """
        Preprocess features (normalization, encoding).

        Args:
            X: Raw feature array

        Returns:
            Preprocessed features
        """
        X_processed = X.copy()

        # Normalize numerical features to 0-1 scale
        for col in range(X_processed.shape[1]):
            col_min = X_processed[:, col].min()
            col_max = X_processed[:, col].max()
            if col_max > col_min:
                X_processed[:, col] = (X_processed[:, col] - col_min) / (col_max - col_min)

        return X_processed

    def add_lag_features(self, X: np.ndarray, window: int = 3) -> np.ndarray:
        """
        Add lag features for temporal patterns.

        Args:
            X: Feature array
            window: Lookback window

        Returns:
            Features with lag features added
        """
        # This would apply to time-series data
        # For now, simple implementation
        return X

    def engineer_features(self, X: np.ndarray) -> np.ndarray:
        """
        Apply all feature engineering steps.

        Args:
            X: Raw features

        Returns:
            Engineered features
        """
        X = self.preprocess_features(X)
        X = self.add_lag_features(X)
        return X
