from ml.model_training import HazardModelTrainer
from config import settings
import pandas as pd
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    # Paths
    os.makedirs('ml/models', exist_ok=True)
    os.makedirs('data', exist_ok=True)

    data_path = os.path.join('data', 'Final_data.csv')

    # Check if Final_data.csv exists
    if not os.path.exists(data_path):
        logger.error(f"❌ File not found: {data_path}")
        return

    logger.info(f"Reading data from {data_path}")
    df = pd.read_csv(data_path)

    # Required columns check
    required_columns = {'Latitude', 'Longitude', 'Magnitude', 'Depth', 'Hazard_Level'}
    missing_cols = required_columns - set(df.columns)
    if missing_cols:
        logger.warning(f"⚠️ Missing columns in Final_data.csv: {missing_cols}")
    else:
        logger.info("✅ All required columns present")

    # Proceed to training
    logger.info("Training model using Final_data.csv...")
    trainer = HazardModelTrainer()
    trainer.train()
    logger.info(f"✅ Model trained and saved to {settings.MODEL_PATH}")

if __name__ == "__main__":
    main()
