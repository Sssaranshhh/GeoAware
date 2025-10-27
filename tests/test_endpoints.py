import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to GeoAware API"

def test_seismic_data():
    response = client.get("/data/seismic")
    assert response.status_code == 200
    assert "status" in response.json()

def test_weather_data():
    response = client.get("/data/weather")
    assert response.status_code == 200
    assert "status" in response.json()
