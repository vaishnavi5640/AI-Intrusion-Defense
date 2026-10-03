import sys
import os

# Add project root to Python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

from app import app


def test_home_page():
    """Test whether the dashboard loads successfully."""
    client = app.test_client()

    response = client.get("/")

    assert response.status_code == 200
    assert b"SentinelAI" in response.data


def test_api_status():
    """Test the API status endpoint."""
    client = app.test_client()

    response = client.get("/api/status")

    assert response.status_code == 200

    data = response.get_json()

    assert data["status"] == "running"
    assert data["project"] == "AI Intrusion Defense"


def test_dashboard_api():
    """Test the dashboard data endpoint."""
    client = app.test_client()

    response = client.get("/api/dashboard")

    assert response.status_code == 200

    data = response.get_json()

    assert "total_events" in data
    assert "threats" in data
    assert "blocked" in data
    assert "normal" in data
    assert "events" in data


def test_prediction_api():
    """Test the intrusion prediction API."""
    client = app.test_client()

    test_data = {
        "Init_Win_bytes_forward": 8192,
        "Fwd Packet Length Max": 1500,
        "Total Length of Fwd Packets": 5000,
        "Avg Fwd Segment Size": 1000,
        "Fwd Packet Length Mean": 1000,
        "Destination Port": 80,
        "Subflow Fwd Bytes": 5000,
        "Bwd Packet Length Min": 0,
        "Subflow Fwd Packets": 5,
        "Fwd IAT Total": 1000,
        "Fwd IAT Max": 500,
        "Fwd IAT Mean": 200,
        "act_data_pkt_fwd": 5,
        "Fwd IAT Std": 100,
        "Fwd Packet Length Std": 100
    }

    response = client.post("/predict", json=test_data)

    assert response.status_code == 200

    data = response.get_json()

    assert "prediction" in data
    assert "action" in data
    assert "status" in data
    assert "timestamp" in data
