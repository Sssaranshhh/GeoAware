import pandas as pd
import os
from kaggle.api.kaggle_api_extended import KaggleApi

def download_dataset():
    api = KaggleApi()
    api.authenticate()
    
    # Download dataset
    api.dataset_download_files(
        'vaibhavrmankar/natural-disasters-in-india-1990-2021',
        path='data',
        unzip=True
    )

def prepare_data():
    df = pd.read_csv('data/disasters.csv')
    
    # Clean and preprocess
    df = df.dropna()
    df['date'] = pd.to_datetime(df['date'])
    
    # Save processed data
    df.to_csv('data/processed_disasters.csv', index=False)

if __name__ == "__main__":
    os.makedirs('data', exist_ok=True)
    download_dataset()
    prepare_data()
