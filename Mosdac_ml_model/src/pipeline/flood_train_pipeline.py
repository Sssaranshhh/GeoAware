import os
import sys
from src.exception import CustomException
from src.logger import logging

from src.components.flood_data_processor import FloodDataProcessor
from src.components.flood_model_trainer import FloodModelTrainer


def run_flood_prediction_pipeline():
    """Execute complete flood risk prediction pipeline"""
    logging.info("Starting flood risk prediction pipeline")
    try:
        # Step 1: Data Processing
        logging.info("\n" + "="*50)
        logging.info("STEP 1: DATA PROCESSING")
        logging.info("="*50)
        
        data_processor = FloodDataProcessor()
        merged_data_path = data_processor.initiate_flood_data_processing()
        
        # Step 2: Model Training
        logging.info("\n" + "="*50)
        logging.info("STEP 2: MODEL TRAINING")
        logging.info("="*50)
        
        model_trainer = FloodModelTrainer()
        test_accuracy = model_trainer.initiate_flood_model_training(merged_data_path)
        
        logging.info("\n" + "="*50)
        logging.info("FLOOD PREDICTION PIPELINE COMPLETED SUCCESSFULLY")
        logging.info("="*50)
        
        return test_accuracy

    except Exception as e:
        logging.error(f"Pipeline failed: {str(e)}")
        raise CustomException(e, sys)


if __name__ == "__main__":
    accuracy = run_flood_prediction_pipeline()
    print(f"\nFinal Model Accuracy: {accuracy:.4f}")
