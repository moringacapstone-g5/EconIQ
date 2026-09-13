from pathlib import Path
from datetime import date

import joblib
import pandas as pd
from dateutil.relativedelta import relativedelta
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import text

from app.db.session import engine


router = APIRouter(
    prefix="/forecasts",
    tags=["Forecasts"],
)


BASE_DIR = Path(__file__).resolve().parents[3]

INFLATION_MODEL_PATH = (
    BASE_DIR
    / "data"
    / "models"
    / "macro_inflation_forecast_rf.joblib"
)

FOOD_MODEL_PATH = (
    BASE_DIR
    / "data"
    / "models"
    / "food_price_forecast.joblib"
)


INFLATION_FEATURES = [
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


FOOD_FEATURES = [
    "commodity",
    "food_price",
    "inflation_annual_avg",
    "inflation_12m",
    "central_bank_rate",
    "rainfall",
    "temperature",
    "temperature_max",
    "temperature_min",
    "humidity",
    "wind_speed",
    "food_price_lag_1",
    "food_price_lag_3",
    "food_price_lag_6",
    "food_price_lag_12",
    "food_price_change_1m",
    "food_price_ma_3",
    "food_price_ma_6",
    "central_bank_rate_change_1m",
]


class FoodPricePredictionRequest(BaseModel):
    commodity: str


class FoodPriceProjectionRequest(BaseModel):
    commodity: str
    months: int = 6


def load_inflation_model():
    if not INFLATION_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Inflation model not found: {INFLATION_MODEL_PATH}"
        )

    artifact = joblib.load(INFLATION_MODEL_PATH)

    if isinstance(artifact, dict) and "model" in artifact:
        return artifact["model"]

    return artifact


def load_food_model():
    if not FOOD_MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Food-price model not found: {FOOD_MODEL_PATH}"
        )

    return joblib.load(FOOD_MODEL_PATH)


def get_available_food_commodities():
    query = text(
        """
        SELECT
            commodity,
            MAX(date) AS latest_complete_date,
            COUNT(*) AS complete_rows
        FROM modeling.econiq_final_modeling
        WHERE
            food_price IS NOT NULL
            AND inflation_annual_avg IS NOT NULL
            AND inflation_12m IS NOT NULL
            AND central_bank_rate IS NOT NULL
            AND rainfall IS NOT NULL
            AND temperature IS NOT NULL
            AND temperature_max IS NOT NULL
            AND temperature_min IS NOT NULL
            AND humidity IS NOT NULL
            AND wind_speed IS NOT NULL
            AND food_price_lag_1 IS NOT NULL
            AND food_price_lag_3 IS NOT NULL
            AND food_price_lag_6 IS NOT NULL
            AND food_price_lag_12 IS NOT NULL
            AND food_price_change_1m IS NOT NULL
            AND food_price_ma_3 IS NOT NULL
            AND food_price_ma_6 IS NOT NULL
            AND central_bank_rate_change_1m IS NOT NULL
        GROUP BY commodity
        ORDER BY commodity;
        """
    )

    with engine.connect() as connection:
        rows = connection.execute(query).mappings().all()

    return [
        {
            "commodity": row["commodity"],
            "latest_complete_date": str(row["latest_complete_date"]),
            "complete_rows": int(row["complete_rows"]),
        }
        for row in rows
    ]


def get_food_model_data(commodity: str):
    query = text(
        """
        SELECT
            date,
            commodity,
            food_price,
            inflation_annual_avg,
            inflation_12m,
            central_bank_rate,
            rainfall,
            temperature,
            temperature_max,
            temperature_min,
            humidity,
            wind_speed,
            food_price_lag_1,
            food_price_lag_3,
            food_price_lag_6,
            food_price_lag_12,
            food_price_change_1m,
            food_price_ma_3,
            food_price_ma_6,
            central_bank_rate_change_1m,
            target_date
        FROM modeling.econiq_final_modeling
        WHERE commodity = :commodity
          AND food_price IS NOT NULL
          AND inflation_annual_avg IS NOT NULL
          AND inflation_12m IS NOT NULL
          AND central_bank_rate IS NOT NULL
          AND rainfall IS NOT NULL
          AND temperature IS NOT NULL
          AND temperature_max IS NOT NULL
          AND temperature_min IS NOT NULL
          AND humidity IS NOT NULL
          AND wind_speed IS NOT NULL
          AND food_price_lag_1 IS NOT NULL
          AND food_price_lag_3 IS NOT NULL
          AND food_price_lag_6 IS NOT NULL
          AND food_price_lag_12 IS NOT NULL
          AND food_price_change_1m IS NOT NULL
          AND food_price_ma_3 IS NOT NULL
          AND food_price_ma_6 IS NOT NULL
          AND central_bank_rate_change_1m IS NOT NULL
        ORDER BY date DESC
        LIMIT 1;
        """
    )

    with engine.connect() as connection:
        return connection.execute(
            query,
            {"commodity": commodity},
        ).mappings().first()


def generate_food_prediction(commodity: str):
    row = get_food_model_data(commodity)

    if row is None:
        raise HTTPException(
            status_code=404,
            detail=(
                f"No complete forecasting data found for commodity: "
                f"{commodity}"
            ),
        )

    data = dict(row)

    model = load_food_model()

    input_data = pd.DataFrame(
        [[data[feature] for feature in FOOD_FEATURES]],
        columns=FOOD_FEATURES,
    )

    prediction = float(model.predict(input_data)[0])

    current_price = float(data["food_price"])
    price_change = prediction - current_price

    percentage_change = (
        (price_change / current_price) * 100
        if current_price != 0
        else 0.0
    )

    return {
        "country": "Kenya",
        "country_code": "KE",
        "commodity": data["commodity"],
        "latest_model_data_date": str(data["date"]),
        "forecast_date": (
            str(data["target_date"])
            if data["target_date"] is not None
            else None
        ),
        "current_price": round(current_price, 2),
        "forecast_price": round(prediction, 2),
        "price_change": round(price_change, 2),
        "percentage_change": round(percentage_change, 2),
        "unit": "KES",
        "forecast_period": "Next month",
        "data_status": "latest_complete_model_data",
        "weather_data_available_through": "2025-12-31",
        "model": "RandomForestRegressor",
        "model_file": "food_price_forecast.joblib",
    }


@router.get("/inflation")
def forecast_inflation():
    query = text(
        """
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
            savings
        FROM modeling.macro_inflation_forecast_final
        ORDER BY date DESC
        LIMIT 1;
        """
    )

    try:
        with engine.connect() as connection:
            row = connection.execute(query).mappings().first()

        if row is None:
            raise HTTPException(
                status_code=404,
                detail="No inflation forecasting data found.",
            )

        data = dict(row)
        model = load_inflation_model()

        input_data = pd.DataFrame(
            [[data[feature] for feature in INFLATION_FEATURES]],
            columns=INFLATION_FEATURES,
        )

        prediction = float(model.predict(input_data)[0])

        return {
            "country": "Kenya",
            "country_code": "KE",
            "indicator": "Inflation",
            "indicator_code": "INFLATION",
            "forecast_period": "Next month",
            "latest_data_date": str(data["date"]),
            "current_inflation": float(data["inflation_12m"]),
            "forecast_inflation": round(prediction, 4),
            "unit": "%",
            "model": "RandomForestRegressor",
            "model_file": "macro_inflation_forecast_rf.joblib",
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Inflation forecast failed: {str(exc)}",
        )


@router.get("/food-prices/commodities")
def available_food_commodities():
    try:
        return get_available_food_commodities()

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load available food commodities: {str(exc)}",
        )


@router.get("/food-prices")
def forecast_food_price(
    commodity: str = Query(
        ...,
        description="Commodity to forecast, e.g. Beans (dry)",
    )
):
    try:
        return generate_food_prediction(commodity)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Food-price forecast failed: {str(exc)}",
        )


@router.post("/food-prices")
def predict_food_price(request: FoodPricePredictionRequest):
    try:
        return generate_food_prediction(request.commodity)

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Food-price prediction failed: {str(exc)}",
        )
