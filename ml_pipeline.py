import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import logging
from datetime import datetime
import os
from pathlib import Path


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AirQualityMLPipeline:
    """Complete ML pipeline for air quality prediction"""
    
    def __init__(self, model_dir: str = "models"):
        self.model_dir = model_dir
        self.models = {}
        self.scaler = None
        self.feature_names = ['latitude', 'longitude', 'hour', 'day_of_week', 
                            'is_weekend', 'temperature', 'humidity', 
                            'wind_speed', 'traffic_density']
        self.pollutants = ['pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide', 'ozone']
        
        # Create model directory if it doesn't exist
        Path(self.model_dir).mkdir(exist_ok=True)
    
    def generate_synthetic_training_data(self, n_samples: int = 1000) -> tuple:
        """
        Generate synthetic air quality training data
        
        Args:
            n_samples: Number of samples to generate
            
        Returns:
            X (features), y_dict (pollutant targets)
        """
        logger.info(f"Generating {n_samples} synthetic training samples...")
        
        np.random.seed(42)
        
        # Generate features
        data = {
            'latitude': np.random.uniform(19.0, 35.0, n_samples),
            'longitude': np.random.uniform(68.0, 97.0, n_samples),
            'hour': np.random.randint(0, 24, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.randint(0, 2, n_samples),
            'temperature': np.random.uniform(10, 40, n_samples),
            'humidity': np.random.uniform(20, 90, n_samples),
            'wind_speed': np.random.uniform(0, 25, n_samples),
            'traffic_density': np.random.uniform(0, 100, n_samples)
        }
        
        X = pd.DataFrame(data)
        
        # Generate targets with some correlation to features
        y_dict = {}
        y_dict['pm10'] = 30 + 2*data['traffic_density'] + 1*data['hour'] + np.random.normal(0, 5, n_samples)
        y_dict['pm2_5'] = 15 + 1.5*data['traffic_density'] + 0.5*data['hour'] + np.random.normal(0, 3, n_samples)
        y_dict['carbon_monoxide'] = 100 + 3*data['traffic_density'] + np.random.normal(0, 10, n_samples)
        y_dict['nitrogen_dioxide'] = 20 + 1.2*data['traffic_density'] + np.random.normal(0, 2, n_samples)
        y_dict['ozone'] = 40 + 0.5*data['hour'] + np.random.normal(0, 4, n_samples)
        
        # Ensure no negative values
        for pollutant in self.pollutants:
            y_dict[pollutant] = np.maximum(y_dict[pollutant], 0)
        
        logger.info("Synthetic data generated successfully")
        return X, y_dict
    
    def preprocess_data(self, X: pd.DataFrame) -> np.ndarray:
        """
        Preprocess features using StandardScaler
        
        Args:
            X: Feature dataframe
            
        Returns:
            Scaled features array
        """
        logger.info("Preprocessing data...")
        
        if self.scaler is None:
            self.scaler = StandardScaler()
            X_scaled = self.scaler.fit_transform(X)
        else:
            X_scaled = self.scaler.transform(X)
        
        return X_scaled
    
    def train_models(self, X_train: np.ndarray, y_train: dict) -> dict:
        """
        Train separate models for each pollutant
        
        Args:
            X_train: Training features
            y_train: Training targets dictionary
            
        Returns:
            Training metrics dictionary
        """
        logger.info("Training models...")
        metrics = {}
        
        for pollutant in self.pollutants:
            logger.info(f"Training {pollutant} model...")
            
            model = GradientBoostingRegressor(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            )
            
            model.fit(X_train, y_train[pollutant])
            self.models[pollutant] = model
            
            # Calculate training metrics
            y_pred = model.predict(X_train)
            mae = np.mean(np.abs(y_pred - y_train[pollutant]))
            rmse = np.sqrt(np.mean((y_pred - y_train[pollutant]) ** 2))
            r2 = model.score(X_train, y_train[pollutant])
            
            metrics[pollutant] = {'mae': mae, 'rmse': rmse, 'r2': r2}
            logger.info(f"{pollutant}: MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.4f}")
        
        return metrics
    
    def full_pipeline(self, n_samples: int = 1000) -> dict:
        """
        Execute complete ML pipeline: data generation -> preprocessing -> training
        
        Args:
            n_samples: Number of training samples
            
        Returns:
            Results dictionary with metrics and model info
        """
        logger.info("Starting full ML pipeline...")
        
        # Generate data
        X, y_dict = self.generate_synthetic_training_data(n_samples)
        
        # Preprocess
        X_scaled = self.preprocess_data(X)
        
        # Split data - create indices first, then apply to all targets
        indices = np.arange(len(X_scaled))
        train_indices, test_indices = train_test_split(indices, test_size=0.2, random_state=42)
        
        X_train = X_scaled[train_indices]
        X_test = X_scaled[test_indices]
        
        y_train = {}
        y_test = {}
        for pollutant in self.pollutants:
            y_train[pollutant] = y_dict[pollutant][train_indices]
            y_test[pollutant] = y_dict[pollutant][test_indices]
        
        # Train models
        train_metrics = self.train_models(X_train, y_train)
        
        # Evaluate on test set
        test_metrics = {}
        for pollutant in self.pollutants:
            y_pred = self.models[pollutant].predict(X_test)
            mae = np.mean(np.abs(y_pred - y_test[pollutant]))
            rmse = np.sqrt(np.mean((y_pred - y_test[pollutant]) ** 2))
            r2 = self.models[pollutant].score(X_test, y_test[pollutant])
            
            test_metrics[pollutant] = {'mae': mae, 'rmse': rmse, 'r2': r2}
            logger.info(f"{pollutant} (test): MAE={mae:.2f}, RMSE={rmse:.2f}, R²={r2:.4f}")
        
        # Save models
        self.save_models()
        
        return {
            'status': 'success',
            'train_metrics': train_metrics,
            'test_metrics': test_metrics,
            'n_samples': n_samples,
            'timestamp': datetime.now().isoformat()
        }
    
    def predict(self, features: dict) -> dict:
        """
        Make predictions for a single location
        
        Args:
            features: Dictionary with feature values
            
        Returns:
            Dictionary with predictions for all pollutants
        """
        # Create feature array in correct order
        feature_array = np.array([[
            features.get('latitude', 0),
            features.get('longitude', 0),
            features.get('hour', 12),
            features.get('day_of_week', 0),
            features.get('is_weekend', 0),
            features.get('temperature', 25),
            features.get('humidity', 50),
            features.get('wind_speed', 5),
            features.get('traffic_density', 50)
        ]])
        
        # Scale
        feature_array_scaled = self.scaler.transform(feature_array)
        
        # Predict
        predictions = {}
        for pollutant in self.pollutants:
            if pollutant in self.models:
                pred = self.models[pollutant].predict(feature_array_scaled)[0]
                predictions[pollutant] = max(0, float(pred))
        
        return predictions
    
    def save_models(self):
        """Save trained models to disk"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        version = "v1.0"
        model_path = os.path.join(self.model_dir, f"{version}_{timestamp}")
        
        Path(model_path).mkdir(parents=True, exist_ok=True)
        
        # Save models
        for pollutant, model in self.models.items():
            model_file = os.path.join(model_path, f"{pollutant}_model.pkl")
            joblib.dump(model, model_file)
        
        # Save scaler
        scaler_file = os.path.join(model_path, "scaler.pkl")
        joblib.dump(self.scaler, scaler_file)
        
        logger.info(f"Models saved to {model_path}")
        return model_path
    
    def load_models(self, model_path: str = None) -> bool:
        """
        Load trained models from disk
        
        Args:
            model_path: Path to model directory, if None finds latest
            
        Returns:
            True if models loaded successfully
        """
        if model_path is None:
            # Find latest model directory
            model_dirs = [d for d in Path(self.model_dir).iterdir() if d.is_dir()]
            if not model_dirs:
                logger.warning("No model directory found")
                return False
            model_path = str(max(model_dirs, key=lambda p: p.stat().st_mtime))
        
        try:
            logger.info(f"Loading existing model: {os.path.basename(model_path)}")
            
            # Load models
            for pollutant in self.pollutants:
                model_file = os.path.join(model_path, f"{pollutant}_model.pkl")
                self.models[pollutant] = joblib.load(model_file)
            
            # Load scaler
            scaler_file = os.path.join(model_path, "scaler.pkl")
            self.scaler = joblib.load(scaler_file)
            
            logger.info(f"Models loaded from {model_path}")
            return True
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            return False
