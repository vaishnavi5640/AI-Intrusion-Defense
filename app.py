from flask import Flask, request, jsonify, send_from_directory
from src.predict import predict_intrusion
from src.defense import take_defensive_action

from prometheus_client import Counter, Gauge, generate_latest, CONTENT_TYPE_LATEST

import os


app = Flask(__name__)


# ============================================================
# PROMETHEUS METRICS
# ============================================================

TOTAL_PREDICTIONS = Counter(
    "intrusion_detection_predictions_total",
    "Total number of intrusion detection predictions"
)

THREATS_DETECTED = Counter(
    "intrusion_detection_threats_total",
    "Total number of threats detected"
)

TRAFFIC_BLOCKED = Counter(
    "intrusion_detection_blocked_total",
    "Total number of blocked attacks"
)

NORMAL_TRAFFIC = Counter(
    "intrusion_detection_normal_total",
    "Total number of normal traffic predictions"
)

ACTIVE_STATUS = Gauge(
    "intrusion_detection_api_status",
    "Current status of the intrusion detection API"
)

ACTIVE_STATUS.set(1)


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/")
def dashboard():
    return send_from_directory(
        os.path.join(app.root_path, "dashboard"),
        "index.html"
    )


@app.route("/style.css")
def style_css():
    response = send_from_directory(
        os.path.join(app.root_path, "dashboard"),
        "style.css"
    )
    response.headers["Content-Type"] = "text/css"
    return response


@app.route("/script.js")
def script_js():
    response = send_from_directory(
        os.path.join(app.root_path, "dashboard"),
        "script.js"
    )
    response.headers["Content-Type"] = "application/javascript"
    return response


@app.route("/<path:filename>")
def dashboard_files(filename):
    return send_from_directory(
        os.path.join(app.root_path, "dashboard"),
        filename
    )


# ============================================================
# API STATUS
# ============================================================

@app.route("/api/status")
def api_status():
    return jsonify({
        "project": "AI Intrusion Defense",
        "status": "running",
        "message": "Intrusion Detection API is active"
    })


# ============================================================
# PROMETHEUS METRICS ENDPOINT
# ============================================================

@app.route("/metrics")
def metrics():
    return generate_latest(), 200, {
        "Content-Type": CONTENT_TYPE_LATEST
    }


# ============================================================
# PREDICTION API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No input data provided"
            }), 400

        prediction = predict_intrusion(data)

        # Update total prediction metric
        TOTAL_PREDICTIONS.inc()

        # Perform defensive action
        defense = take_defensive_action(prediction)

        # Update metrics
        if prediction == "BENIGN":

            NORMAL_TRAFFIC.inc()

        else:

            THREATS_DETECTED.inc()

            if defense["action"] == "BLOCK":
                TRAFFIC_BLOCKED.inc()

        return jsonify({
            "prediction": prediction,
            "status": defense["message"],
            "action": defense["action"],
            "timestamp": defense["timestamp"]
        })

    except Exception as e:

        return jsonify({
            "error": str(e)
        }), 500


# ============================================================
# SECURITY LOG READER
# ============================================================

def read_security_logs():

    log_file = os.path.join(
        "logs",
        "security.log"
    )

    if not os.path.exists(log_file):
        return []

    events = []

    with open(log_file, "r") as file:

        for line in file:

            line = line.strip()

            if not line:
                continue

            try:

                parts = line.split(" | ")

                timestamp = parts[0]

                prediction = parts[1].replace(
                    "Prediction: ",
                    ""
                )

                action = parts[2].replace(
                    "Action: ",
                    ""
                )

                message = parts[3]

                events.append({
                    "timestamp": timestamp,
                    "prediction": prediction,
                    "action": action,
                    "message": message
                })

            except Exception:

                continue

    return events


# ============================================================
# DASHBOARD DATA API
# ============================================================

@app.route("/api/dashboard")
def dashboard_data():

    events = read_security_logs()

    total_events = len(events)

    threats = sum(
        1
        for event in events
        if event["prediction"] != "BENIGN"
    )

    blocked = sum(
        1
        for event in events
        if event["action"] == "BLOCK"
    )

    normal = sum(
        1
        for event in events
        if event["prediction"] == "BENIGN"
    )

    return jsonify({

        "total_events": total_events,

        "threats": threats,

        "blocked": blocked,

        "normal": normal,

        "events": events[-10:][::-1]

    })


# ============================================================
# APPLICATION START
# ============================================================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )