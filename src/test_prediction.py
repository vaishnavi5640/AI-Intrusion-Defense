import pandas as pd
from predict import predict_intrusion, selected_features

# Load dataset
data_path = "data/processed/ddos_clean.csv"

df = pd.read_csv(data_path)

# Select a DDoS record
ddos_data = df[df["Label"] == "DDoS"]

sample = ddos_data.iloc[0][selected_features].to_dict()

# Predict
result = predict_intrusion(sample)

print("===================================")
print(" AI INTRUSION DETECTION TEST")
print("===================================")
print("Actual Label:", ddos_data.iloc[0]["Label"])
print("Predicted   :", result)

if result == "BENIGN":
    print("Status: Normal Network Traffic")
else:
    print("Status: 🚨 DDoS Intrusion Detected!")

print("===================================")