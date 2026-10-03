import joblib
import pandas as pd
import os


# Get project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Model paths
MODEL_PATH = os.path.join(
    BASE_DIR, "models", "intrusion_detection_model.pkl"
)

FEATURES_PATH = os.path.join(
    BASE_DIR, "models", "selected_features.pkl"
)


# Load model and selected features
model = joblib.load(MODEL_PATH)
selected_features = joblib.load(FEATURES_PATH)


def predict_intrusion(data):
    """
    Predict whether network traffic is BENIGN or DDoS.
    """

    # Convert input into DataFrame
    input_data = pd.DataFrame([data])

    # Make sure all required features exist
    for feature in selected_features:
        if feature not in input_data.columns:
            input_data[feature] = 0

    # Keep only the features used during training
    input_data = input_data[selected_features]

    # Make prediction
    prediction = model.predict(input_data)[0]

    return prediction


if __name__ == "__main__":
    print("Intrusion Detection Model Loaded Successfully!")
    print("Number of selected features:", len(selected_features))
    print("Prediction module is ready.")