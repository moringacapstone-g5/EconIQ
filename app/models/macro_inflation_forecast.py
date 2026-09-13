import os
from pathlib import Path

import joblib
import pandas as pd
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# Configuration

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL was not found. Make sure your .env file exists "
        "and contains DATABASE_URL."
    )

BASE_DIR = Path(__file__).resolve().parents[2]

PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODELS_DIR = BASE_DIR / "data" / "models"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)

CSV_PATH = PROCESSED_DIR / "macro_inflation_forecast.csv"
MODEL_PATH = MODELS_DIR / "macro_inflation_forecast_rf.joblib"

# Load data from PostgreSQL

engine = create_engine(DATABASE_URL)

query = """
SELECT
    date,
    inflation_12m,
    inflation_lag_1,
    inflation_lag_3,
    inflation_lag_6,
    inflation_lag_12,
    cbr,
    tbill_91,
    tbill_182,
    interbank,
    lending,
    deposit,
    savings,
    target_inflation_next_month
FROM modeling.macro_inflation_forecast_final
ORDER BY date;
"""

df = pd.read_sql(query, engine)

# Basic validation

print("\n=== Model 2: Macroeconomic Inflation Forecast ===")
print(f"Rows: {len(df)}")
print(f"Columns: {len(df.columns)}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")

if df["date"].duplicated().any():
    raise ValueError("Duplicate dates detected.")

if df.isnull().any().any():
    print("\nWARNING: Missing values detected:")
    print(df.isnull().sum()[df.isnull().sum() > 0])
    raise ValueError("Modeling dataset contains missing values.")

# Save canonical processed CSV

df.to_csv(CSV_PATH, index=False)

print(f"\nProcessed CSV saved to:")
print(CSV_PATH)

# Features and target

features = [
    "inflation_12m",
    "inflation_lag_1",
    "inflation_lag_3",
    "inflation_lag_6",
    "inflation_lag_12",
    "cbr",
    "tbill_91",
    "tbill_182",
    "interbank",
    "lending",
    "deposit",
    "savings",
]

target = "target_inflation_next_month"

X = df[features]
y = df[target]

# Chronological train / validation / test split

n = len(df)

train_end = int(n * 0.70)
val_end = int(n * 0.85)

X_train = X.iloc[:train_end]
y_train = y.iloc[:train_end]

X_val = X.iloc[train_end:val_end]
y_val = y.iloc[train_end:val_end]

X_test = X.iloc[val_end:]
y_test = y.iloc[val_end:]

print("\n=== Chronological Split ===")
print(f"Training:   {len(X_train)} rows")
print(f"Validation: {len(X_val)} rows")
print(f"Test:       {len(X_test)} rows")

print("\nTraining period:")
print(df["date"].iloc[0], "to", df["date"].iloc[train_end - 1])

print("Validation period:")
print(df["date"].iloc[train_end], "to", df["date"].iloc[val_end - 1])

print("Test period:")
print(df["date"].iloc[val_end], "to", df["date"].iloc[-1])

# ---------------------------------------------------------
# Evaluation helper
# ---------------------------------------------------------

def evaluate_model(name, y_true, predictions):
    mae = mean_absolute_error(y_true, predictions)
    rmse = mean_squared_error(y_true, predictions) ** 0.5
    r2 = r2_score(y_true, predictions)

    print(f"\n{name}")
    print(f"MAE:  {mae:.4f}")
    print(f"RMSE: {rmse:.4f}")
    print(f"R²:   {r2:.4f}")

    return {
        "model": name,
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
    }

# Naive baseline
# Prediction = current month's inflation

baseline_val_predictions = X_val["inflation_12m"].values

baseline_test_predictions = X_test["inflation_12m"].values

baseline_val = evaluate_model(
    "Naive Baseline - Validation",
    y_val,
    baseline_val_predictions,
)

baseline_test = evaluate_model(
    "Naive Baseline - Test",
    y_test,
    baseline_test_predictions,
)

# Random Forest

rf = RandomForestRegressor(
    n_estimators=500,
    max_depth=8,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)

rf.fit(X_train, y_train)

# Validation evaluation
rf_val_predictions = rf.predict(X_val)

rf_val = evaluate_model(
    "Random Forest - Validation",
    y_val,
    rf_val_predictions,
)

# Compare validation performance

print("\n=== Validation Comparison ===")

if rf_val["mae"] < baseline_val["mae"]:
    print("Random Forest beats the naive baseline on MAE.")
else:
    print("Random Forest does NOT beat the naive baseline on MAE.")

if rf_val["rmse"] < baseline_val["rmse"]:
    print("Random Forest beats the naive baseline on RMSE.")
else:
    print("Random Forest does NOT beat the naive baseline on RMSE.")

# Retrain Random Forest on train + validation

X_train_val = X.iloc[:val_end]
y_train_val = y.iloc[:val_end]

final_rf = RandomForestRegressor(
    n_estimators=500,
    max_depth=8,
    min_samples_leaf=2,
    random_state=42,
    n_jobs=-1,
)

final_rf.fit(X_train_val, y_train_val)

# Final untouched test evaluation

final_test_predictions = final_rf.predict(X_test)

final_rf_test = evaluate_model(
    "Random Forest - Final Test",
    y_test,
    final_test_predictions,
)

# Feature importance

importance = pd.DataFrame(
    {
        "feature": features,
        "importance": final_rf.feature_importances_,
    }
).sort_values("importance", ascending=False)

print("\n=== Feature Importance ===")
print(importance.to_string(index=False))

# Save model

model_artifact = {
    "model": final_rf,
    "features": features,
    "target": target,
    "model_name": "RandomForestRegressor",
    "training_rows": len(X_train_val),
    "test_rows": len(X_test),
}

joblib.dump(model_artifact, MODEL_PATH)

print("\nTrained model saved to:")
print(MODEL_PATH)

print("\n Model 2 Complete ")
