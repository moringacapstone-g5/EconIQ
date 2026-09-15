"use client";

import { useEffect, useState } from "react";
import {
  getFoodPriceForecast,
  getInflationForecast,
  getLatestAnalytics,
  type FoodPriceForecast,
  type InflationForecast,
  type LatestAnalytics,
} from "@/lib/api";
import MetricCard from "./MetricCard";

export default function EconomicPulse() {
  const [inflation, setInflation] = useState<LatestAnalytics | null>(null);
  const [gdp, setGdp] = useState<LatestAnalytics | null>(null);
  const [exchangeRate, setExchangeRate] = useState<LatestAnalytics | null>(null);
  const [interestRate, setInterestRate] = useState<LatestAnalytics | null>(null);
  const [inflationForecast, setInflationForecast] =
    useState<InflationForecast | null>(null);
  const [foodForecast, setFoodForecast] =
    useState<FoodPriceForecast | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [
          inflationData,
          gdpData,
          exchangeRateData,
          interestRateData,
          inflationForecastData,
          foodForecastData,
        ] = await Promise.all([
          getLatestAnalytics("KE", "INFLATION"),
          getLatestAnalytics("KE", "GDP_GROWTH"),
          getLatestAnalytics("KE", "EXCHANGE_RATE"),
          getLatestAnalytics("KE", "INTEREST_RATE"),
          getInflationForecast(),
          getFoodPriceForecast("Beans (dry)"),
        ]);

        setInflation(inflationData);
        setGdp(gdpData);
        setExchangeRate(exchangeRateData);
        setInterestRate(interestRateData);
        setInflationForecast(inflationForecastData);
        setFoodForecast(foodForecastData);
      } catch (err) {
        console.error("ECONIQ dashboard error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load economic data.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
          />
        ))}
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
        <p className="text-sm font-medium text-red-300">
          Unable to load economic data
        </p>
        <p className="mt-2 text-sm text-white/50">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Inflation"
          value={inflation ? `${inflation.value.toFixed(2)}%` : "—"}
          detail={
            inflation
              ? `Latest · ${inflation.date}`
              : "No data available"
          }
        />

        <MetricCard
          label="GDP Growth"
          value={gdp ? `${gdp.value.toFixed(2)}%` : "—"}
          detail={
            gdp
              ? `Latest · ${gdp.date}`
              : "No data available"
          }
        />

        <MetricCard
          label="Exchange Rate"
          value={
            exchangeRate
              ? `KES ${exchangeRate.value.toFixed(2)}`
              : "—"
          }
          detail={
            exchangeRate
              ? `KES / USD · ${exchangeRate.date}`
              : "No data available"
          }
        />

        <MetricCard
          label="Central Bank Rate"
          value={
            interestRate
              ? `${interestRate.value.toFixed(2)}%`
              : "—"
          }
          detail={
            interestRate
              ? `Latest · ${interestRate.date}`
              : "No data available"
          }
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {inflationForecast && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Inflation Forecast
                </p>
                <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                  {inflationForecast.forecast_inflation.toFixed(2)}%
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/35">
                {inflationForecast.model}
              </span>
            </div>

            <p className="mt-3 text-sm text-white/45">
              {inflationForecast.forecast_period}
            </p>

            <p className="mt-1 text-xs text-white/25">
              Model data through {inflationForecast.latest_data_date}
            </p>
          </div>
        )}

        {foodForecast && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Beans Forecast
                </p>

                <p className="mt-3 text-3xl font-medium tracking-[-0.04em]">
                  KES {foodForecast.forecast_price.toFixed(2)}
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/35">
                {foodForecast.percentage_change >= 0 ? "+" : ""}
                {foodForecast.percentage_change.toFixed(2)}%
              </span>
            </div>

            <p className="mt-3 text-sm text-white/45">
              {foodForecast.commodity} · Forecast for{" "}
              {foodForecast.forecast_date ?? "next period"}
            </p>

            <p className="mt-1 text-xs text-white/25">
              Model data through {foodForecast.latest_model_data_date}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
