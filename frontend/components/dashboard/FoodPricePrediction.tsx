"use client";

import { useState } from "react";
import { ArrowUpRight, Sparkles, TrendingDown, TrendingUp } from "lucide-react";

import {
  getFoodPriceForecast,
  type FoodPriceForecast,
} from "@/lib/api";

const commodities = [
  "Beans (dry)",
  "Maize",
  "Maize flour",
  "Maize (white)",
  "Meat (beef)",
  "Meat (camel)",
  "Meat (goat)",
  "Potatoes (Irish)",
  "Rice",
  "Sorghum",
  "Sugar",
  "Wheat flour",
];

function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function getPercentageChange(current: number, predicted: number) {
  if (!current) return 0;
  return ((predicted - current) / current) * 100;
}

export default function FoodPricePrediction() {
  const [commodity, setCommodity] = useState("Beans (dry)");
  const [prediction, setPrediction] =
    useState<FoodPriceForecast | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function predictPrice() {
    setLoading(true);
    setError("");

    try {
      const result = await getFoodPriceForecast(commodity);
      setPrediction(result);
    } catch (err) {
      console.error(err);
      setError("Unable to generate the food-price prediction.");
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  }

  const percentageChange = prediction
    ? getPercentageChange(
        prediction.current_price,
        prediction.forecast_price
      )
    : 0;

  const priceChange = prediction
    ? prediction.forecast_price - prediction.current_price
    : 0;

  const decreasing = percentageChange < 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-500/[0.06] blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/45">
              <Sparkles size={13} />
              Food price prediction
            </div>

            <h2 className="mt-4 text-2xl font-medium tracking-[-0.035em]">
              One-month-ahead food price prediction
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
              Select a commodity to estimate its expected price for the
              following month.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <select
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-white/10 bg-[#090c10] px-4 text-sm text-white/70 outline-none transition focus:border-blue-400/30"
          >
            {commodities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            onClick={predictPrice}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 text-sm text-white/70 transition hover:bg-white/[0.1] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Predicting..." : "Predict price"}
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-5 rounded-xl border border-red-400/10 bg-red-400/[0.04] px-4 py-3 text-sm text-red-300/70">
            {error}
          </div>
        )}

        {/* Prediction */}
        {prediction && (
          <div className="mt-7">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Current price */}
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Current price
                </p>

                <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                  {formatNumber(prediction.current_price)}
                  <span className="ml-2 text-sm text-white/30">
                    KES
                  </span>
                </p>
              </div>

              {/* Predicted price */}
              <div className="rounded-2xl border border-blue-400/[0.12] bg-blue-400/[0.035] p-6">
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-200/40">
                  Predicted price — next month
                </p>

                <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                  {formatNumber(prediction.forecast_price)}
                  <span className="ml-2 text-sm text-white/30">
                    KES
                  </span>
                </p>
              </div>
            </div>

            {/* Change */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <div className="flex items-center gap-2">
                  {decreasing ? (
                    <TrendingDown size={17} className="text-emerald-300/70" />
                  ) : (
                    <TrendingUp size={17} className="text-amber-300/70" />
                  )}

                  <p className="text-xs text-white/35">
                    Expected change
                  </p>
                </div>

                <p
                  className={`mt-3 text-2xl font-medium ${
                    decreasing
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }`}
                >
                  {priceChange >= 0 ? "+" : ""}
                  {formatNumber(priceChange)} KES
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
                <p className="text-xs text-white/35">
                  Percentage change
                </p>

                <p
                  className={`mt-3 text-2xl font-medium ${
                    decreasing
                      ? "text-emerald-300"
                      : "text-amber-300"
                  }`}
                >
                  {percentageChange >= 0 ? "+" : ""}
                  {formatNumber(percentageChange)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {!prediction && !loading && (
          <div className="mt-7 rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.015] p-8 text-center">
            <p className="text-sm text-white/30">
              Select a commodity and generate a prediction.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}