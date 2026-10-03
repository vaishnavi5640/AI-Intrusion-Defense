import requests
import pandas as pd
import sys
import os

# Allow importing from src
sys.path.append(os.path.abspath("src"))

from predict import selected_features

# Load dataset
df = pd.read_csv("data/processed/ddos_clean.csv")

# Select one DDoS sample
sample = df[df["Label"] == "DDoS"].iloc[0]

# Create API input using the 15 selected features
data = {
    feature: float(sample[feature])
    for feature in selected_features
}

# Send request to Flask API
response = requests.post(
    "http://127.0.0.1:5000/predict",
    json=data
)

print("API Response:")
print(response.json())