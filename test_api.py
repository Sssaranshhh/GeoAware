"""
Example test cases for Flood Route Safety Navigator API.
Run these to verify the system is working correctly.
"""

import requests
import json
from typing import Dict, Any


BASE_URL = "http://localhost:8000"


def test_health():
    """Test health check endpoint."""
    print("\n" + "="*80)
    print("TEST 1: Health Check")
    print("="*80)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    print("✅ PASSED")


def test_basic_route():
    """Test basic route computation."""
    print("\n" + "="*80)
    print("TEST 2: Basic Route (Now)")
    print("="*80)
    
    payload = {
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "now",
        "include_alternatives": False,
    }
    
    print(f"Request: {json.dumps(payload, indent=2)}")
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    print(f"Status: {response.status_code}")
    
    result = response.json()
    print(f"Response:")
    print(f"  Status: {result['status']}")
    print(f"  Distance: {result['primary_route']['distance_km']:.2f} km")
    print(f"  ETA: {result['primary_route']['eta_minutes']} min")
    print(f"  Hazard Exposure: {result['primary_route']['hazard_exposure']:.2f}")
    print(f"  Max Hazard: {result['primary_route']['max_hazard']:.2f}")
    print(f"  Efficiency: {result['primary_route']['efficiency_class']}")
    print(f"  Advisory: {result['primary_route']['advisory']}")
    
    assert response.status_code == 200
    assert result["status"] == "SUCCESS"
    assert "primary_route" in result
    assert "distance_km" in result["primary_route"]
    print("✅ PASSED")


def test_24h_forecast():
    """Test route with 24-hour forecast."""
    print("\n" + "="*80)
    print("TEST 3: Route with 24h Forecast")
    print("="*80)
    
    payload = {
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "24h",
        "include_alternatives": False,
    }
    
    print(f"Request time_horizon: 24h")
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    
    result = response.json()
    print(f"  Discharge Ratio: {result['metadata']['discharge_ratio']:.2f}x")
    print(f"  Advisory: {result['primary_route']['advisory']}")
    
    assert response.status_code == 200
    assert result["metadata"]["time_horizon"] == "24h"
    print("✅ PASSED")


def test_48h_forecast():
    """Test route with 48-hour forecast."""
    print("\n" + "="*80)
    print("TEST 4: Route with 48h Forecast")
    print("="*80)
    
    payload = {
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "48h",
        "include_alternatives": False,
    }
    
    print(f"Request time_horizon: 48h")
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    
    result = response.json()
    print(f"  Discharge Ratio: {result['metadata']['discharge_ratio']:.2f}x")
    print(f"  Advisory: {result['primary_route']['advisory']}")
    
    assert response.status_code == 200
    assert result["metadata"]["time_horizon"] == "48h"
    print("✅ PASSED")


def test_alternatives():
    """Test route with alternative paths."""
    print("\n" + "="*80)
    print("TEST 5: Route with Alternatives")
    print("="*80)
    
    payload = {
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "now",
        "include_alternatives": True,
    }
    
    print(f"Request: include_alternatives=true")
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    
    result = response.json()
    print(f"  Primary Route Distance: {result['primary_route']['distance_km']:.2f} km")
    
    if result.get("alternative_routes"):
        print(f"  Alternative Routes Found: {len(result['alternative_routes'])}")
        for i, alt in enumerate(result["alternative_routes"], 1):
            print(f"    Alt {i}: {alt['distance_km']:.2f} km, exposure={alt['hazard_exposure']:.2f}")
    else:
        print("  Alternative Routes: None (algorithm variation)")
    
    assert response.status_code == 200
    print("✅ PASSED")


def test_invalid_request():
    """Test with invalid request (wrong time_horizon)."""
    print("\n" + "="*80)
    print("TEST 6: Invalid Request Handling")
    print("="*80)
    
    payload = {
        "origin_lat": 20.5937,
        "origin_lon": 72.9629,
        "dest_lat": 20.6845,
        "dest_lon": 73.0524,
        "time_horizon": "invalid",
    }
    
    print(f"Request with invalid time_horizon: 'invalid'")
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    print(f"Status: {response.status_code}")
    
    assert response.status_code == 400
    print("✅ PASSED - Correctly rejected invalid input")


def test_different_locations():
    """Test with different origin/destination locations."""
    print("\n" + "="*80)
    print("TEST 7: Different Locations (Longer Route)")
    print("="*80)
    
    # Longer distance route
    payload = {
        "origin_lat": 20.5,
        "origin_lon": 72.8,
        "dest_lat": 20.8,
        "dest_lon": 73.2,
        "time_horizon": "now",
    }
    
    print(f"Origin: ({payload['origin_lat']}, {payload['origin_lon']})")
    print(f"Destination: ({payload['dest_lat']}, {payload['dest_lon']})")
    
    response = requests.post(f"{BASE_URL}/route/safe", json=payload)
    result = response.json()
    
    print(f"  Distance: {result['primary_route']['distance_km']:.2f} km")
    print(f"  ETA: {result['primary_route']['eta_minutes']} min")
    
    assert response.status_code == 200
    print("✅ PASSED")


def run_all_tests():
    """Run all test cases."""
    print("\n" + "╔" + "="*78 + "╗")
    print("║" + " "*20 + "FLOOD ROUTE SAFETY NAVIGATOR - TEST SUITE" + " "*17 + "║")
    print("╚" + "="*78 + "╝")
    
    try:
        test_health()
        test_basic_route()
        test_24h_forecast()
        test_48h_forecast()
        test_alternatives()
        test_invalid_request()
        test_different_locations()
        
        print("\n" + "="*80)
        print("🎉 ALL TESTS PASSED!")
        print("="*80)
        print("\nSystem is ready for production use.")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        return False
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server")
        print("Make sure the API is running: uvicorn main:app --reload")
        return False
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")
        return False
    
    return True


if __name__ == "__main__":
    import sys
    
    success = run_all_tests()
    sys.exit(0 if success else 1)
