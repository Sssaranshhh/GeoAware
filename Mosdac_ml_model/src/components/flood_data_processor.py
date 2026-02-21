import os
import sys
from dataclasses import dataclass
import pandas as pd
import numpy as np

from src.exception import CustomException
from src.logger import logging


@dataclass
class FloodDataProcessorConfig:
    merged_data_path: str = os.path.join('artifacts', 'flood_merged_data.csv')
    train_data_path: str = os.path.join('artifacts', 'flood_train.csv')
    test_data_path: str = os.path.join('artifacts', 'flood_test.csv')


class FloodDataProcessor:
    def __init__(self):
        self.config = FloodDataProcessorConfig()

    def merge_datasets(self):
        """Merge IMC, OLR, and CTP datasets by filename time component"""
        logging.info("Starting dataset merge for flood prediction")
        try:
            # Read datasets
            imc_df = pd.read_csv('artifacts/IMC_raw_flood_dataset.csv')
            olr_df = pd.read_csv('artifacts/OLR_features_dataset.csv')
            ctp_df = pd.read_csv('artifacts/CTP_features_dataset.csv')
            
            logging.info(f"IMC shape: {imc_df.shape}, OLR shape: {olr_df.shape}, CTP shape: {ctp_df.shape}")

            # Extract time component from filename for merging (e.g., "3RIMG_23JAN2026_0015_L2B_IMC_V01R00.h5" -> "23JAN2026_0015")
            imc_df['time_key'] = imc_df['filename'].str.extract(r'_(\d{2}[A-Z]{3}\d{4}_\d{4})_')[0]
            olr_df['time_key'] = olr_df['filename'].str.extract(r'_(\d{2}[A-Z]{3}\d{4}_\d{4})_')[0]
            ctp_df['time_key'] = ctp_df['filename'].str.extract(r'_(\d{2}[A-Z]{3}\d{4}_\d{4})_')[0]

            # Select required features from each dataset
            imc_features = imc_df[['time_key', 'mean', 'pct_gt_5', 'pct_gt_10']].copy()
            imc_features.columns = ['time_key', 'imc_mean', 'imc_pct_gt_5', 'imc_pct_gt_10']

            olr_features = olr_df[['time_key', 'mean', 'pct_lt_220', 'pct_lt_240']].copy()
            olr_features.columns = ['time_key', 'olr_mean', 'olr_pct_lt_220', 'olr_pct_lt_240']

            ctp_features = ctp_df[['time_key', 'ctp_mean', 'pct_ctp_lt_200', 'pct_ctp_lt_300']].copy()
            ctp_features.columns = ['time_key', 'ctp_mean', 'ctp_pct_lt_200', 'ctp_pct_lt_300']

            # Merge datasets on time_key (filename time component)
            merged_df = imc_features.merge(olr_features, on='time_key', how='inner')
            merged_df = merged_df.merge(ctp_features, on='time_key', how='inner')
            
            merged_df = merged_df.drop(columns=['time_key'])

            logging.info(f"Merged dataset shape: {merged_df.shape}")
            
            return merged_df

        except Exception as e:
            raise CustomException(e, sys)

    def handle_invalid_values(self, df):
        """Replace -999 values with NaN and drop rows"""
        logging.info("Handling invalid values (-999)")
        try:
            feature_cols = [col for col in df.columns if col != 'timestamp']
            
            # Replace -999 with NaN
            df[feature_cols] = df[feature_cols].replace(-999, np.nan)
            
            # Drop rows with NaN values
            initial_shape = df.shape[0]
            df = df.dropna()
            dropped_rows = initial_shape - df.shape[0]
            
            logging.info(f"Dropped {dropped_rows} rows with invalid values")
            
            return df

        except Exception as e:
            raise CustomException(e, sys)

    def create_flood_risk_label(self, df):
        """Create rule-based flood risk labels: Low, Medium, High"""
        logging.info("Creating flood risk labels")
        try:
            df['flood_risk_score'] = 0
            
            # Heavy rainfall increases risk (IMC - percentage of pixels with high intensity)
            # Use percentile-based thresholds
            imc_high = df['imc_pct_gt_10'].quantile(0.75)
            imc_low = df['imc_pct_gt_10'].quantile(0.25)
            df.loc[df['imc_pct_gt_10'] > imc_high, 'flood_risk_score'] += 2
            df.loc[(df['imc_pct_gt_10'] >= imc_low) & (df['imc_pct_gt_10'] <= imc_high), 'flood_risk_score'] += 1
            
            # OLR intensity (lower = more clouds = higher risk)
            olr_high = df['olr_mean'].quantile(0.75)
            olr_low = df['olr_mean'].quantile(0.25)
            df.loc[df['olr_mean'] < olr_low, 'flood_risk_score'] += 2
            df.loc[(df['olr_mean'] >= olr_low) & (df['olr_mean'] <= olr_high), 'flood_risk_score'] += 1
            
            # CTP (lower = higher convection = higher risk)
            ctp_high = df['ctp_mean'].quantile(0.75)
            ctp_low = df['ctp_mean'].quantile(0.25)
            df.loc[df['ctp_mean'] < ctp_low, 'flood_risk_score'] += 2
            df.loc[(df['ctp_mean'] >= ctp_low) & (df['ctp_mean'] <= ctp_high), 'flood_risk_score'] += 1
            
            # Classify into risk categories
            df['flood_risk'] = pd.cut(df['flood_risk_score'], 
                                      bins=[-np.inf, 2, 4, np.inf], 
                                      labels=['Low', 'Medium', 'High'])
            
            df = df.drop(columns=['flood_risk_score'])
            
            logging.info(f"Flood risk distribution:\n{df['flood_risk'].value_counts()}")
            
            return df

        except Exception as e:
            raise CustomException(e, sys)

    def initiate_flood_data_processing(self):
        """Orchestrate the entire data processing pipeline"""
        logging.info("Initiating flood data processing pipeline")
        try:
            # Merge datasets
            merged_df = self.merge_datasets()
            
            # Handle invalid values
            merged_df = self.handle_invalid_values(merged_df)
            
            # Create labels
            processed_df = self.create_flood_risk_label(merged_df)
            
            # Save merged data
            os.makedirs(os.path.dirname(self.config.merged_data_path), exist_ok=True)
            processed_df.to_csv(self.config.merged_data_path, index=False, header=True)
            
            logging.info(f"Merged data shape: {processed_df.shape}")
            logging.info("Flood data processing completed")
            
            return self.config.merged_data_path

        except Exception as e:
            raise CustomException(e, sys)
