import os
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib
from .preprocess import DataPreprocessor
from config import settings

class HazardModelTrainer:
    def __init__(self):
        # Use more robust RandomForest params
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=42,
            class_weight='balanced_subsample',
            n_jobs=-1
        )
        self.preprocessor = DataPreprocessor()

    def train(self, data_path: str = None):
        data_path = data_path or settings.KAGGLE_DATA_PATH
        print(f"Loading data from {data_path}")
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"Training data not found at: {data_path}")
        df = pd.read_csv(data_path)
        print("Preprocessing data and fitting scaler...")
        # Fit scaler on training data
        X, y = self.preprocessor.prepare_data(df, for_training=True, fit_scaler=True)

        print("Training model...")
        self.model.fit(X, y)

        model_dir = os.path.dirname(settings.MODEL_PATH)
        if model_dir:
            os.makedirs(model_dir, exist_ok=True)
        print(f"Saving model to {settings.MODEL_PATH}")
        joblib.dump({
            'model': self.model,
            'scaler': self.preprocessor.scaler
        }, settings.MODEL_PATH)
        return self.model