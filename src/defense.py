from datetime import datetime
import os


LOG_DIR = "logs"
LOG_FILE = os.path.join(LOG_DIR, "security.log")


def take_defensive_action(prediction):

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if prediction == "DDoS":
        action = "BLOCK"
        message = "DDoS attack detected. Traffic should be blocked."
    else:
        action = "ALLOW"
        message = "Normal traffic detected. Connection allowed."

    # Create logs folder if it doesn't exist
    os.makedirs(LOG_DIR, exist_ok=True)

    # Save detection to log
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

    result = take_defensive_action("DDoS")
    print(result)

    print()

    result = take_defensive_action("BENIGN")
    print(result)