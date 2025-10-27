import requests
from bs4 import BeautifulSoup
import csv
from datetime import datetime
from meteostat import Point, Daily
import pandas as pd
import time

# -----------------------------
# Configuration
# -----------------------------
OUTPUT_CSV = "earthquake_data.csv"

# Example seismic IDs (replace with actual IDs from Geoscope)
SEISMIC_IDS = ['us7000qdyl', 'us6000rft9', 'us7000qcrv']

# -----------------------------
# Functions
# -----------------------------

def fetch_earthquake_data(seismic_id):
    url = f"http://geoscope.ipgp.fr/index.php/en/catalog/earthquake-description?seis={seismic_id}"
    response = requests.get(url)
    soup = BeautifulSoup(response.content, 'html.parser')

    try:
        data = {
            'seismic_id': seismic_id,
            'latitude': float(soup.find(text='Latitude (USGS)').find_next('td').text.strip()),
            'longitude': float(soup.find(text='Longitude (USGS)').find_next('td').text.strip()),
            'depth': float(soup.find(text='Depth (km)').find_next('td').text.strip()),
            'magnitude': float(soup.find(text='Magnitude').find_next('td').text.strip()),
            'date': soup.find(text='UTC Date (USGS)').find_next('td').text.strip(),
        }
    except Exception as e:
        print(f"Error fetching seismic data for {seismic_id}: {e}")
        return None

    return data

def fetch_weather_data(latitude, longitude, date_str):
    # Convert date string to datetime
    try:
        dt_obj = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
    except:
        dt_obj = datetime.utcnow()

    # Create Meteostat Point
    location = Point(latitude, longitude)

    # Fetch daily historical data
    try:
        data = Daily(location, dt_obj, dt_obj)
        data = data.fetch()
        if not data.empty:
            temp = data['tavg'].values[0]  # Average temperature (°C)
            rainfall = data['prcp'].values[0]  # Precipitation (mm)
        else:
            temp = None
            rainfall = 0
    except Exception as e:
        print(f"Error fetching weather for {latitude}, {longitude}: {e}")
        temp = None
        rainfall = 0

    return {
        'temperature': temp,
        'rainfall': rainfall
    }

def determine_hazard_level(magnitude, depth, rainfall, temperature):
    # Simple if-else rules
    if magnitude >= 6.0 or depth < 10:
        return 'High'
    elif magnitude >= 4.5 or (rainfall is not None and rainfall > 50):
        return 'Medium'
    else:
        return 'Low'

def save_to_csv(data_list, filename=OUTPUT_CSV):
    if not data_list:
        print("No data to save.")
        return

    keys = data_list[0].keys()
    with open(filename, 'w', newline='', encoding='utf-8') as f:
        dict_writer = csv.DictWriter(f, keys)
        dict_writer.writeheader()
        dict_writer.writerows(data_list)
    print(f"Data saved to {filename}")

# -----------------------------
# Main Execution
# -----------------------------

def main():
    all_data = []

    for seismic_id in SEISMIC_IDS:
        print(f"Processing {seismic_id}...")
        eq_data = fetch_earthquake_data(seismic_id)
        if not eq_data:
            continue

        weather_data = fetch_weather_data(eq_data['latitude'], eq_data['longitude'], eq_data['date'])
        hazard_level = determine_hazard_level(eq_data['magnitude'], eq_data['depth'], weather_data['rainfall'], weather_data['temperature'])

        combined_data = {**eq_data, **weather_data, 'hazard_level': hazard_level}
        all_data.append(combined_data)

        # Pause to avoid rate limits
        time.sleep(1)

    save_to_csv(all_data)

if __name__ == "__main__":
    main()
