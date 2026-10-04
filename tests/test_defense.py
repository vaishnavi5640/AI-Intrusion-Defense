import sys
import os

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

sys.path.insert(0, PROJECT_ROOT)

from src.defense import take_defensive_action


def test_benign_action():
    result = take_defensive_action("BENIGN")

    assert result["action"] == "ALLOW"
    assert result["prediction"] == "BENIGN"


def test_ddos_action():
    result = take_defensive_action("DDoS")

    assert result["action"] == "BLOCK"
    assert result["prediction"] == "DDoS"


def test_other_attack_action():
    result = take_defensive_action("PortScan")

    assert result["action"] == "ALERT"
    assert result["prediction"] == "PortScan"