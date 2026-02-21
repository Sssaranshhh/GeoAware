import os
import sys
from dataclasses import dataclass
import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, StratifiedShuffleSplit
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder

from src.exception import CustomException
from src.logger import logging
from src.utils import save_object


@dataclass
class FloodModelTrainerConfig:
    trained_model_file_path: str = os.path.join("models", "flood_risk_model.pkl")
    label_encoder_path: str = os.path.join("models", "flood_label_encoder.pkl")


class FloodModelTrainer:
    def __init__(self):
        self.config = FloodModelTrainerConfig()
        self.label_encoder = LabelEncoder()

    def initiate_flood_model_training(self, data_path):
        """Train RandomForestClassifier for flood risk prediction"""
        logging.info("Starting flood risk model training")
        try:
            # Load data
            df = pd.read_csv(data_path)
            logging.info(f"Data shape: {df.shape}")

            # Separate features and target
            X = df.drop(columns=['flood_risk'])
            y = df['flood_risk']

            # Encode target labels
            y_encoded = self.label_encoder.fit_transform(y)
            logging.info(f"Class labels: {self.label_encoder.classes_}")
            logging.info(f"Class distribution:\n{pd.Series(y_encoded).value_counts()}")

            # Stratified split to maintain class balance
            sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
            
            for train_idx, test_idx in sss.split(X, y_encoded):
                X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
                y_train, y_test = y_encoded[train_idx], y_encoded[test_idx]

            logging.info(f"Training set size: {X_train.shape[0]}, Test set size: {X_test.shape[0]}")

            # Train RandomForestClassifier with anti-overfitting constraints
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=6,
                min_samples_leaf=5,
                class_weight='balanced',
                random_state=42,
                n_jobs=-1
            )

            logging.info("Training RandomForestClassifier")
            model.fit(X_train, y_train)

            # Predictions
            y_train_pred = model.predict(X_train)
            y_test_pred = model.predict(X_test)

            # Evaluation
            train_accuracy = accuracy_score(y_train, y_train_pred)
            test_accuracy = accuracy_score(y_test, y_test_pred)

            logging.info(f"\n{'='*50}")
            logging.info(f"Training Accuracy: {train_accuracy:.4f}")
            logging.info(f"Testing Accuracy: {test_accuracy:.4f}")
            logging.info(f"{'='*50}")

            logging.info(f"\nClassification Report:\n{classification_report(y_test, y_test_pred, target_names=self.label_encoder.classes_)}")

            cm = confusion_matrix(y_test, y_test_pred)
            logging.info(f"\nConfusion Matrix:\n{cm}")

            # Print to console as well
            print(f"\n{'='*50}")
            print(f"FLOOD RISK MODEL EVALUATION")
            print(f"{'='*50}")
            print(f"Training Accuracy: {train_accuracy:.4f}")
            print(f"Testing Accuracy: {test_accuracy:.4f}")
            print(f"\nClassification Report:\n{classification_report(y_test, y_test_pred, target_names=self.label_encoder.classes_)}")
            print(f"\nConfusion Matrix:\n{cm}")
            print(f"{'='*50}\n")

            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': X.columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            logging.info(f"\nFeature Importance:\n{feature_importance}")

            # Save model and label encoder
            os.makedirs(os.path.dirname(self.config.trained_model_file_path), exist_ok=True)
            
            save_object(file_path=self.config.trained_model_file_path, obj=model)
            save_object(file_path=self.config.label_encoder_path, obj=self.label_encoder)
            
            logging.info(f"Model saved to {self.config.trained_model_file_path}")
            logging.info(f"Label encoder saved to {self.config.label_encoder_path}")

            return test_accuracy

        except Exception as e:
            raise CustomException(e, sys)
