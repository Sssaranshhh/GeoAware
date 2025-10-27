from flask import Flask, render_template, request, jsonify
import requests
import json

app = Flask(__name__)

# API endpoint configuration
API_BASE_URL = "http://localhost:8000"

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/test/predict', methods=['POST'])
def test_predict():
    try:
        data = {
            "latitude": float(request.form['latitude']),
            "longitude": float(request.form['longitude']),
            "depth": float(request.form['depth']),
            "magnitude": float(request.form['magnitude']),
            #"rainfall": float(request.form['rainfall']),
            #"temperature": float(request.form['temperature'])
        }
        
        response = requests.post(f"{API_BASE_URL}/predict", json=data)
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test/weather')
def test_weather():
    try:
        response = requests.get(f"{API_BASE_URL}/data/weather")
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test/seismic')
def test_seismic():
    try:
        response = requests.get(f"{API_BASE_URL}/data/seismic")
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/test/trends')
def test_trends():
    try:
        response = requests.get(f"{API_BASE_URL}/analyze/trends")
        return jsonify(response.json())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)