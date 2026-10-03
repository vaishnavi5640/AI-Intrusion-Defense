from flask import Flask, request, jsonify, send_from_directory
from src.predict import predict_intrusion
from src.defense import take_defensive_action
import os

app = Flask(__name__)


# ==============================
# DASHBOARD
# ==============================

@app.route("/")
def dashboard():
    return send_from_directory("dashboard", "index.html")


# ==============================
# DASHBOARD FILES
# ==============================

@app.route("/<path:filename>")
def dashboard_files(filename):
    return send_from_directory("dashboard", filename)


# ==============================
# HOME API
# ==============================

@app.route("/api/status")
def api_status():
    return jsonify({
        "project": "AI Intrusion Defense",
        "status": "running",
        "message": "Intrusion Detection API is active"
    })


# ==============================
# PREDICTION API
# ==============================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "error": "No input data provided"
            }), 400

        # ML prediction
        prediction = predict_intrusion(data)

        # Adaptive defense
        defense = take_defensive_action(prediction)

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


# ==============================
# READ SECURITY LOG
# ==============================

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


# ==============================
# DASHBOARD DATA
# ==============================

@app.route("/api/dashboard")
def dashboard_data():

    events = read_security_logs()

    total_events = len(events)

    threats = sum(
        1 for event in events
        if event["prediction"] != "BENIGN"
    )

    blocked = sum(
        1 for event in events
        if event["action"] == "BLOCK"
    )

    normal = sum(
        1 for event in events
        if event["prediction"] == "BENIGN"
    )

    return jsonify({

        "total_events": total_events,

        "threats": threats,

        "blocked": blocked,

        "normal": normal,

        "events": events[-10:][::-1]

    })


# ==============================
# START SERVER
# ==============================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )