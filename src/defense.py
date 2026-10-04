from datetime import datetime
import os


LOG_DIR = "logs"
LOG_FILE = os.path.join(LOG_DIR, "security.log")


def take_defensive_action(prediction):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if prediction == "BENIGN":

        action = "ALLOW"
        message = "Normal traffic detected. Connection allowed."

    elif prediction == "DDoS":

        action = "BLOCK"
        message = "DDoS attack detected. Traffic should be blocked."

    else:

        action = "ALERT"
        message = f"{prediction} attack detected. Security alert generated."

    os.makedirs(LOG_DIR, exist_ok=True)

    with open(LOG_FILE, "a") as file:

        file.write(
            f"{timestamp} | "
            f"Prediction: {prediction} | "
            f"Action: {action} | "
            f"{message}\n"
        )

    return {
        "timestamp": timestamp,
        "prediction": prediction,
        "action": action,
        "message": message
    }


if __name__ == "__main__":

    print("Testing Adaptive Defense System")
    print("=" * 40)

    test_predictions = [
        "BENIGN",
        "DDoS",
        "PortScan"
    ]

    for prediction in test_predictions:

        result = take_defensive_action(prediction)

        print(
            f"{prediction:10} → "
            f"{result['action']}"
        )

    print("=" * 40)
    print("Adaptive Defense Test Completed")