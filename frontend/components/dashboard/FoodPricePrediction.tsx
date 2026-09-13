"use client";

import { useEffect, useState } from "react";
import {
  getAvailableFoodCommodities,
  predictFoodPrice,
  type FoodCommodity,
  type FoodPriceForecast,
} from "@/lib/api";

export default function FoodPricePrediction() {
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [commodity, setCommodity] = useState("");
  const [prediction, setPrediction] =
    useState<FoodPriceForecast | null>(null);
  const [loadingCommodities, setLoadingCommodities] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCommodities() {
      try {
        setLoadingCommodities(true);
        setError("");

        const result = await getAvailableFoodCommodities();

        setCommodities(result);

        if (result.length > 0) {
          setCommodity(result[0].commodity);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load available commodities.",
        );
      } finally {
        setLoadingCommodities(false);
      }
    }

    loadCommodities();
  }, []);

  async function handlePredict() {
    if (!commodity) return;

    setLoading(true);
    setError("");
    setPrediction(null);

    try {
      const result = await predictFoodPrice(commodity);
      setPrediction(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate prediction.",
      );
    } finally {
      setLoading(false);
    }
  }

  const isIncrease =
    prediction !== null && prediction.price_change >= 0;

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Food Price Prediction
        </h2>

        <p className="mt-2 text-sm text-white/50">
          One-month-ahead food price prediction using the trained
          Random Forest model.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="food-commodity"
            className="mb-2 block text-sm text-white/60"
          >
            Commodity
          </label>

          <select
            id="food-commodity"
            value={commodity}
            onChange={(event) => setCommodity(event.target.value)}
            disabled={loadingCommodities || commodities.length === 0}
            className="w-full rounded-xl border border-white/[0.08] bg-black/30 px-4 py-3 text-sm text-white outline-none transition focus:border-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingCommodities ? (
              <option value="">Loading commodities...</option>
            ) : (
              commodities.map((item) => (
                <option
                  key={item.commodity}
                  value={item.commodity}
                >
                  {item.commodity}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={handlePredict}
          disabled={
            loading ||
            loadingCommodities ||
            !commodity
          }
          className="rounded-xl border border-white/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Predicting..." : "Predict price"}
        </button>
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {prediction && (
        <div className="mt-8">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Current price
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {prediction.current_price.toFixed(2)}{" "}
                {prediction.unit}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Predicted price
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {prediction.forecast_price.toFixed(2)}{" "}
                {prediction.unit}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Expected change
              </p>
              <p
                className={`mt-2 text-2xl font-semibold ${
                  isIncrease ? "text-white" : "text-white/70"
                }`}
              >
                {isIncrease ? "+" : ""}
                {prediction.price_change.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <p className="text-xs uppercase tracking-wide text-white/40">
                Percentage change
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {isIncrease ? "+" : ""}
                {prediction.percentage_change.toFixed(2)}%
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-white/40">Forecast date</p>
              <p className="mt-1 text-sm text-white/80">
                {prediction.forecast_date ?? "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">
                Model data through
              </p>
              <p className="mt-1 text-sm text-white/80">
                {prediction.latest_model_data_date}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">Model</p>
              <p className="mt-1 text-sm text-white/80">
                {prediction.model}
              </p>
            </div>

            <div>
              <p className="text-xs text-white/40">
                Weather data through
              </p>
              <p className="mt-1 text-sm text-white/80">
                {prediction.weather_data_available_through}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <p className="text-xs uppercase tracking-wide text-white/40">
              Forecast note
            </p>

            <p className="mt-2 text-sm leading-6 text-white/60">
              EconIQ&apos;s food-price model generates a one-month-ahead
              forecast from the latest complete modeling data available
              for the selected commodity.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
