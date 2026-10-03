import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load cleaned dataset
file_path = "data/processed/ddos_clean.csv"

print("Loading cleaned dataset...")
df = pd.read_csv(file_path)

# Separate features and target
X = df.drop("Label", axis=1)
y = df["Label"]

# Convert any non-numeric columns to numeric
X = X.apply(pd.to_numeric, errors="coerce")

# Remove invalid values created during conversion
X = X.fillna(0)

print("Features:", X.shape)
print("Labels:", y.value_counts())

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("\nTraining Random Forest model...")

model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    n_jobs=-1
)

model.fit(X_train, y_train)

# Predictions
y_pred = model.predict(X_test)

# Evaluation
accuracy = accuracy_score(y_test, y_pred)

print("\n==============================")
print("MODEL RESULTS")
print("==============================")

print(f"Accuracy: {accuracy * 100:.2f}%")

print("\nClassification Report:")
print(classification_report(y_test, y_pred))

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, y_pred))

# Save model
model_path = "models/random_forest.pkl"

joblib.dump(model, model_path)

print("\nModel saved successfully!")
print("Location:", model_path)