import pandas as pd
import numpy as np
import pickle
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
from ..config import (
    FLOOD_DATASET_PATH,
    FLOOD_MODEL_PATH,
    SCALER_PATH,
    TEST_SIZE,
    RANDOM_STATE,
    N_ESTIMATORS,
    MAX_DEPTH,
    FEATURE_NAMES,
    MODEL_DIR
)
from ..utils.logger import setup_logger

logger = setup_logger(__name__)

class FloodRiskTrainer:
    """Train flood risk prediction model."""

    def __init__(self):
        self.model = None
        self.scaler = None
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.features = FEATURE_NAMES

    def load_data(self) -> pd.DataFrame:
        """Load flood dataset."""
        try:
            df = pd.read_csv(FLOOD_DATASET_PATH)
            logger.info(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
            return df
        except FileNotFoundError:
            logger.error(f"Dataset not found at {FLOOD_DATASET_PATH}")
            raise
        except Exception as e:
            logger.error(f"Error loading dataset: {e}")
            raise

    def preprocess_data(self, df: pd.DataFrame) -> tuple:
        """
        Preprocess dataset.
        
        Returns:
            Tuple of (X, y) features and target
        """
        logger.info("Starting data preprocessing...")

        # Check required columns
        required_cols = self.features + ["flood_risk"]
        missing_cols = [col for col in required_cols if col not in df.columns]
        
        if missing_cols:
            logger.error(f"Missing columns: {missing_cols}")
            raise ValueError(f"Missing columns: {missing_cols}")

        # Handle missing values
        df = df.dropna(subset=required_cols)
        logger.info(f"Rows after removing NaN: {df.shape[0]}")

        # Extract features and target
        X = df[self.features].copy()
        y = df["flood_risk"].copy()

        logger.info(f"Features shape: {X.shape}")
        logger.info(f"Target distribution:\n{y.value_counts()}")

        return X, y

    def split_data(self, X: pd.DataFrame, y: pd.Series):
        """Split data into train and test sets."""
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y,
            test_size=TEST_SIZE,
            random_state=RANDOM_STATE,
            stratify=y
        )
        logger.info(
            f"Train set: {self.X_train.shape[0]}, Test set: {self.X_test.shape[0]}"
        )

    def scale_features(self):
        """Fit and apply scaler."""
        self.scaler = StandardScaler()
        self.X_train = self.scaler.fit_transform(self.X_train)
        self.X_test = self.scaler.transform(self.X_test)
        logger.info("Features scaled using StandardScaler")

    def train_model(self):
        """Train RandomForestClassifier."""
        logger.info("Training RandomForestClassifier...")
        
        self.model = RandomForestClassifier(
            n_estimators=N_ESTIMATORS,
            max_depth=MAX_DEPTH,
            random_state=RANDOM_STATE,
            n_jobs=-1,
            verbose=1
        )
        
        self.model.fit(self.X_train, self.y_train)
        
        train_score = self.model.score(self.X_train, self.y_train)
        test_score = self.model.score(self.X_test, self.y_test)
        
        logger.info(f"Training accuracy: {train_score:.4f}")
        logger.info(f"Testing accuracy: {test_score:.4f}")

    def evaluate_model(self):
        """Evaluate model performance."""
        y_pred = self.model.predict(self.X_test)
        
        logger.info("\n=== Classification Report ===")
        logger.info("\n" + classification_report(self.y_test, y_pred))
        
        logger.info("\n=== Confusion Matrix ===")
        logger.info("\n" + str(confusion_matrix(self.y_test, y_pred)))

    def save_model(self):
        """Save model and scaler."""
        MODEL_DIR.mkdir(parents=True, exist_ok=True)
        
        with open(FLOOD_MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)
        logger.info(f"Model saved to {FLOOD_MODEL_PATH}")
        
        with open(SCALER_PATH, "wb") as f:
            pickle.dump(self.scaler, f)
        logger.info(f"Scaler saved to {SCALER_PATH}")

    def train(self):
        """Execute complete training pipeline."""
        try:
            logger.info("="*50)
            logger.info("Starting Flood Risk Model Training")
            logger.info("="*50)
            
            # Load and preprocess
            df = self.load_data()
            X, y = self.preprocess_data(df)
            
            # Split and scale
            self.split_data(X, y)
            self.scale_features()
            
            # Train and evaluate
            self.train_model()
            self.evaluate_model()
            
            # Save artifacts
            self.save_model()
            
            logger.info("="*50)
            logger.info("Training completed successfully!")
            logger.info("="*50)
            
            return True
        except Exception as e:
            logger.error(f"Training failed: {e}")
            return False


def main():
    """Entry point for training script."""
    trainer = FloodRiskTrainer()
    success = trainer.train()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
