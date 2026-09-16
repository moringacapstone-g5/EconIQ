"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  LineChart,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import FoodPricePrediction from "@/components/dashboard/FoodPricePrediction";

import {
  getFoodPriceForecast,
  getInflationForecast,
  type FoodPriceForecast,
  type InflationForecast,
} from "@/lib/api";

function formatNumber(value: number, decimals = 2) {
  return new Intl.NumberFormat("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function ForecastCard({
  label,
  title,
  current,
  forecast,
  unit,
  change,
  forecastLabel = "Forecast",
}: {
  label: string;
  title: string;
  current: number;
  forecast: number;
  unit: string;
  change: number;
  forecastLabel?: string;
}) {
  const positive = change >= 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6">
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/[0.06] blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
              {label}
            </p>

            <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
              {title}
            </h2>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
            <TrendingUp size={17} className="text-white/55" />
          </div>
        </div>

        <div className="mt-9 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-white/30">Current</p>

            <p className="mt-2 text-3xl font-medium tracking-[-0.04em]">
              {formatNumber(current)}
              <span className="ml-1 text-sm text-white/30">
                {unit}
              </span>
            </p>
          </div>

          <div>
            <p className="text-xs text-white/30">
              {forecastLabel}
            </p>

            <p className="mt-2 text-3xl font-medium tracking-[-0.04em]">
              {formatNumber(forecast)}
              <span className="ml-1 text-sm text-white/30">
                {unit}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-white/[0.06] pt-5">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs ${
                positive
                  ? "bg-amber-400/10 text-amber-300"
                  : "bg-emerald-400/10 text-emerald-300"
              }`}
            >
              {positive ? "+" : ""}
              {formatNumber(change)} {unit}
            </span>

            <span className="text-xs text-white/25">
              expected change
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function InflationPrediction() {
  const [inflation, setInflation] =
    useState<InflationForecast | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handlePredict() {
    try {
      setLoading(true);
      setError(null);

      const result = await getInflationForecast();

      setInflation(result);
    } catch (err) {
      console.error("Inflation prediction failed:", err);

      setError(
        "Unable to generate the inflation prediction. Please check that the EconIQ API is running."
      );
    } finally {
      setLoading(false);
    }
  }

  const change = inflation
    ? inflation.forecast_inflation -
      inflation.current_inflation
    : 0;

  const positive = change >= 0;

  return (
    <section className="relative mt-8 overflow-hidden rounded-2xl border border-blue-400/[0.12] bg-gradient-to-br from-blue-500/[0.08] via-white/[0.025] to-transparent p-7">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.08] blur-3xl" />

      <div className="relative">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/10 bg-blue-400/[0.06] px-3 py-1.5 text-xs text-blue-200/60">
              <Sparkles size={13} />
              Short-term outlook
            </div>

            <h2 className="mt-4 text-2xl font-medium tracking-[-0.035em]">
              Inflation prediction
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/35">
              Generate EconIQ&apos;s next-month inflation
              prediction using the latest available economic data.
            </p>

            <button
              type="button"
              onClick={handlePredict}
              disabled={loading}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Predicting..." : "Predict inflation"}

              {!loading && <TrendingUp size={16} />}
            </button>

            {error && (
              <p className="mt-4 text-sm text-red-300/80">
                {error}
              </p>
            )}
          </div>

          {inflation && (
            <div className="shrink-0">
              <p className="text-xs uppercase tracking-[0.15em] text-white/25">
                Predicted inflation
              </p>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-medium tracking-[-0.05em]">
                  {formatNumber(
                    inflation.forecast_inflation
                  )}
                </span>

                <span className="text-lg text-white/30">
                  %
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    positive
                      ? "bg-amber-400/10 text-amber-300"
                      : "bg-emerald-400/10 text-emerald-300"
                  }`}
                >
                  {positive ? "+" : ""}
                  {formatNumber(change)}%
                </span>

                <span className="text-xs text-white/25">
                  vs current inflation
                </span>
              </div>
            </div>
          )}
        </div>

        {inflation && (
          <div className="mt-7 grid gap-3 border-t border-white/[0.06] pt-6 sm:grid-cols-2">
            <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Current
              </p>

              <p className="mt-2 text-lg font-medium">
                {formatNumber(
                  inflation.current_inflation
                )}
                %
              </p>
            </div>

            <div className="rounded-xl border border-blue-400/[0.10] bg-blue-500/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">
                Next month
              </p>

              <p className="mt-2 text-lg font-medium text-blue-300">
                {formatNumber(
                  inflation.forecast_inflation
                )}
                %
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default function ForecastsPage() {
  const [food, setFood] =
    useState<FoodPriceForecast | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const foodResult =
          await getFoodPriceForecast("Beans (dry)");

        setFood(foodResult);
      } catch (err) {
        console.error(
          "Food price forecast failed:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar />

        {/* HERO */}
        <section className="relative overflow-hidden pb-14 pt-20 lg:pt-24">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/[0.07] blur-[100px]" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/45">
              <Sparkles size={13} />
              Predictive intelligence
            </div>

            <h1 className="text-5xl font-medium tracking-[-0.055em] sm:text-6xl">
              What could happen
              <span className="block text-white/40">
                next?
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/40">
              EconIQ uses machine learning models to generate
              forward-looking signals for inflation and food prices.
              Forecasts are estimates, not official statistics.
            </p>
          </div>
        </section>

        {/* MAIN FORECAST CARDS */}
        <section className="grid gap-5 lg:grid-cols-2">
          {loading ? (
            <>
              <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
              <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
            </>
          ) : (
            <>
              {food && (
                <ForecastCard
                  label="Commodity forecast"
                  title={food.commodity}
                  current={food.current_price}
                  forecast={food.forecast_price}
                  unit="KES"
                  change={food.price_change}
                  forecastLabel="Forecast"
                />
              )}

              <div className="hidden lg:block" />
            </>
          )}
        </section>

        {/* INFLATION PREDICTION */}
        <InflationPrediction />

        {/* FOOD PRICE PREDICTION */}
        <section className="mt-8">
          <FoodPricePrediction />
        </section>

        {/* ECONOMIC INTELLIGENCE */}
        <section className="mt-14">
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />

              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-blue-300/60">
                Economic intelligence
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-medium tracking-[-0.035em]">
              Turn economic data into signals
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
              EconIQ connects historical data, predictive models,
              and economic evidence to surface signals that are
              easier to understand.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">

            {/* INFLATION */}
            <div className="group relative overflow-hidden rounded-2xl border border-blue-400/[0.10] bg-gradient-to-br from-blue-500/[0.08] to-white/[0.02] p-6 transition hover:border-blue-400/[0.20]">
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/[0.10] blur-3xl transition group-hover:bg-blue-500/[0.15]" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    Inflation signal
                  </span>

                  <TrendingUp
                    size={17}
                    className="text-blue-300/70"
                  />
                </div>

                <p className="mt-6 text-2xl font-medium tracking-[-0.04em]">
                  Inflation pressure
                </p>

                <p className="mt-3 text-sm leading-6 text-white/30">
                  Compare current inflation conditions with the
                  forward-looking prediction generated by EconIQ.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs text-blue-300">
                    Forecast
                  </span>

                  <span className="text-xs text-white/25">
                    Next month
                  </span>
                </div>
              </div>
            </div>

            {/* FOOD */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition hover:border-white/[0.15]">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    Food market
                  </span>

                  <LineChart
                    size={17}
                    className="text-white/50"
                  />
                </div>

                <p className="mt-6 text-2xl font-medium tracking-[-0.04em]">
                  Commodity movement
                </p>

                <p className="mt-3 text-sm leading-6 text-white/30">
                  Track expected movements in essential food
                  commodities and compare them with recent prices.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/50">
                    Food prices
                  </span>

                  <span className="text-xs text-white/25">
                    Market signal
                  </span>
                </div>
              </div>
            </div>

            {/* EVIDENCE */}
            <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 transition hover:border-white/[0.15]">
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    Intelligence layer
                  </span>

                  <Search
                    size={17}
                    className="text-white/50"
                  />
                </div>

                <p className="mt-6 text-2xl font-medium tracking-[-0.04em]">
                  Evidence → insight
                </p>

                <p className="mt-3 text-sm leading-6 text-white/30">
                  Connect forecasts with economic evidence to
                  understand the context behind changing conditions.
                </p>

                <div className="mt-6 flex items-center gap-2">
                  <span className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/50">
                    RAG
                  </span>

                  <span className="text-xs text-white/25">
                    Evidence-backed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* SIGNAL FLOW */}
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080b10]">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                  EconIQ intelligence flow
                </p>

                <p className="mt-2 text-sm text-white/45">
                  From economic data to an interpretable signal.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-white/45">
                  Economic data
                </span>

                <ArrowUpRight
                  size={14}
                  className="rotate-45 text-white/20"
                />

                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-white/45">
                  Analysis
                </span>

                <ArrowUpRight
                  size={14}
                  className="rotate-45 text-white/20"
                />

                <span className="rounded-lg border border-blue-400/[0.12] bg-blue-500/[0.06] px-3 py-2 text-blue-300/70">
                  Forecast
                </span>

                <ArrowUpRight
                  size={14}
                  className="rotate-45 text-white/20"
                />

                <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-white/45">
                  Insight
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LIVE SIGNALS */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          <div className="flex flex-col gap-6 p-7 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />

                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/60">
                  Intelligence at a glance
                </p>
              </div>

              <h2 className="mt-3 text-xl font-medium tracking-[-0.03em]">
                One platform. Multiple economic signals.
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/35">
                EconIQ brings together structured economic data,
                predictive analytics, and evidence so users can move
                from a number to the context behind it.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center">
                <p className="text-lg font-medium">
                  ML
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  Forecasts
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center">
                <p className="text-lg font-medium">
                  RAG
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  Evidence
                </p>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-center">
                <p className="text-lg font-medium">
                  API
                </p>

                <p className="mt-1 text-[10px] text-white/25">
                  Live data
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NEXT LAYER */}
        <section className="mt-12 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.045] to-white/[0.015] p-7">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                Next layer
              </p>

              <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                From prediction to explanation
              </h2>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/35">
                Combine forecasts with EconIQ&apos;s evidence and
                analytics to understand not only what may happen,
                but the economic context behind it.
              </p>
            </div>

            <a
              href="/explore"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/65 transition hover:bg-white/[0.08] hover:text-white"
            >
              Explore evidence
              <ArrowUpRight size={15} />
            </a>
          </div>
        </section>

        {/* FOOTER */}
        <section className="mt-12 border-t border-white/[0.06] py-10">
          <div className="text-xs text-white/25">
            Forecasts are model estimates and should not be interpreted
            as official economic statistics.
          </div>
        </section>
      </div>
    </main>
  );
}
