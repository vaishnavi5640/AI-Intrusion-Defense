import pandas as pd
import os

# Dataset location
input_file = "data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"

# Output location
output_file = "data/processed/ddos_clean.csv"

print("Loading dataset...")

df = pd.read_csv(input_file)

print("Original shape:", df.shape)

# Remove leading/trailing spaces from column names
df.columns = df.columns.str.strip()

# Remove duplicate rows
df = df.drop_duplicates()

# Replace infinity values with NaN
df = df.replace([float("inf"), float("-inf")], float("nan"))

# Remove rows containing missing values
df = df.dropna()

print("Shape after cleaning:", df.shape)

# Make sure output directory exists
os.makedirs("data/processed", exist_ok=True)

# Save cleaned dataset
df.to_csv(output_file, index=False)

print("\nCleaned dataset saved successfully!")
print("File:", output_file)

print("\nTraffic labels:")
print(df["Label"].value_counts())python src/preprocess.py