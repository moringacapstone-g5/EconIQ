"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  Brain,
  CalendarDays,
  Database,
  Info,
  LineChart,
  Sparkles,
  Target,
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
  model,
  cutoff,
}: {
  label: string;
  title: string;
  current: number;
  forecast: number;
  unit: string;
  change: number;
  model: string;
  cutoff: string;
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
              <span className="ml-1 text-sm text-white/30">{unit}</span>
            </p>
          </div>

          <div>
            <p className="text-xs text-white/30">Forecast</p>
            <p className="mt-2 text-3xl font-medium tracking-[-0.04em]">
              {formatNumber(forecast)}
              <span className="ml-1 text-sm text-white/30">{unit}</span>
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

            <span className="text-xs text-white/25">expected change</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/30">
          <span className="rounded-full border border-white/[0.06] px-2.5 py-1">
            {model}
          </span>

          <span className="rounded-full border border-white/[0.06] px-2.5 py-1">
            Data through {cutoff}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ForecastsPage() {
  const [inflation, setInflation] = useState<InflationForecast | null>(null);
  const [food, setFood] = useState<FoodPriceForecast | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [inflationResult, foodResult] = await Promise.all([
          getInflationForecast(),
          getFoodPriceForecast("Beans (dry)"),
        ]);

        setInflation(inflationResult);
        setFood(foodResult);
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

        <section className="relative overflow-hidden pb-14 pt-20 lg:pt-24">
          <div className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full bg-blue-500/[0.07] blur-[100px]" />

          <div className="relative max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/45">
              <Sparkles size={13} />
              Predictive intelligence
            </div>

            <h1 className="text-5xl font-medium tracking-[-0.055em] sm:text-6xl">
              What could happen
              <span className="block text-white/40">next?</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-white/40">
              EconIQ uses machine learning models to generate forward-looking
              signals for inflation and food prices. Forecasts are estimates,
              not official statistics.
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          {loading ? (
            <>
              <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
              <div className="h-72 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.025]" />
            </>
          ) : (
            <>
              {inflation && (
                <ForecastCard
                  label="Macro forecast"
                  title="Inflation"
                  current={inflation.current_inflation}
                  forecast={inflation.forecast_inflation}
                  unit="%"
                  change={
                    inflation.forecast_inflation -
                    inflation.current_inflation
                  }
                  model={inflation.model}
                  cutoff={inflation.latest_data_date}
                />
              )}

              {food && (
                <ForecastCard
                  label="Commodity forecast"
                  title={food.commodity}
                  current={food.current_price}
                  forecast={food.forecast_price}
                  unit="KES"
                  change={food.price_change}
                  model={food.model}
                  cutoff={food.latest_model_data_date}
                />
              )}
            </>
          )}
        </section>

        <section className="mt-8">
          <FoodPricePrediction />
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
              Model intelligence
            </p>

            <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
              How EconIQ makes predictions
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
              Predictions are generated from historical economic observations
              and forecasting features prepared from the underlying datasets.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <Database size={18} className="text-white/45" />

              <p className="mt-6 text-sm font-medium">1. Historical data</p>

              <p className="mt-2 text-sm leading-6 text-white/30">
                Historical economic and commodity observations provide the
                foundation for model training.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <Brain size={18} className="text-white/45" />

              <p className="mt-6 text-sm font-medium">2. Machine learning</p>

              <p className="mt-2 text-sm leading-6 text-white/30">
                Random Forest models are used for the current inflation and
                food-price forecasting workflows.
              </p>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
              <Target size={18} className="text-white/45" />

              <p className="mt-6 text-sm font-medium">3. Forecast</p>

              <p className="mt-2 text-sm leading-6 text-white/30">
                The trained models generate forward-looking estimates that can
                be monitored alongside historical data.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="flex items-center gap-3">
              <LineChart size={18} className="text-white/45" />

              <h3 className="text-sm font-medium">
                What the forecasts are for
              </h3>
            </div>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-white/35">
              <li>• Monitor potential short-term movements</li>
              <li>• Support economic analysis and planning</li>
              <li>• Compare expected and historical conditions</li>
              <li>• Identify signals worth investigating further</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.025] p-6">
            <div className="flex items-center gap-3">
              <Info size={18} className="text-amber-300/70" />

              <h3 className="text-sm font-medium">
                Forecast transparency
              </h3>
            </div>

            <p className="mt-5 text-sm leading-6 text-white/35">
              Forecasts depend on the historical data available to the model.
              The model cutoff is shown explicitly so users can distinguish
              model estimates from the latest official economic observation.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {inflation && (
                <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-xs text-white/35">
                  Inflation data: {inflation.latest_data_date}
                </span>
              )}

              {food && (
                <span className="rounded-full border border-white/[0.07] px-3 py-1.5 text-xs text-white/35">
                  Food model: {food.latest_model_data_date}
                </span>
              )}
            </div>
          </div>
        </section>

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
                Combine forecasts with EconIQ's evidence and analytics to
                understand not only what may happen, but the economic context
                behind it.
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

        <section className="mt-12 border-t border-white/[0.06] py-10">
          <div className="flex items-center gap-2 text-xs text-white/25">
            <CalendarDays size={13} />
            Forecasts are model estimates and should not be interpreted as
            official economic statistics.
          </div>
        </section>
      </div>
    </main>
  );
}
