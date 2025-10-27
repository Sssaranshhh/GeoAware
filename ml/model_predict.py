import joblib
import os
import pandas as pd
from config import settings
from .preprocess import DataPreprocessor

class HazardPredictor:
    def __init__(self):
        if not os.path.exists(settings.MODEL_PATH):
            raise FileNotFoundError(
                f"Model file not found at {settings.MODEL_PATH}. "
                "Please run train_model.py first to train the model."
            )
        model_bundle = joblib.load(settings.MODEL_PATH)
        self.model = model_bundle['model']
        scaler = model_bundle['scaler']
        self.preprocessor = DataPreprocessor(scaler=scaler)

    def predict(self, features: dict):
        """Standardize input and predict hazard."""
        df = pd.DataFrame([features])
        # Do not fit scaler, just transform
        X, _ = self.preprocessor.prepare_data(df, fit_scaler=False)
        prediction = self.model.predict(X)[0]
        probabilities = self.model.predict_proba(X)[0]
        return {
            'hazard_level': int(prediction),
            'confidence': float(max(probabilities))
        }

    def predict_hazard(self, features: dict):
        return self.predict(features)