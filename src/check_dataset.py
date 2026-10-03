import pandas as pd

file_path = "data/raw/Friday-WorkingHours-Afternoon-DDos.pcap_ISCX.csv"

df = pd.read_csv(file_path)

print("Dataset loaded successfully!")
print("Rows:", len(df))
print("Columns:", len(df.columns))

print("\nColumn names:")
print(df.columns.tolist())

print("\nTraffic labels:")
print(df[" Label"].value_counts())