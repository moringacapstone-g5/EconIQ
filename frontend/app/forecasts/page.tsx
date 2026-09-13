"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  Brain,
  CalendarDays,
  Database,
  RefreshCw,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  getFoodPriceForecast,
  getHistoricalAnalytics,
  getInflationForecast,
  type FoodPriceForecast,
  type HistoricalAnalytics,
  type InflationForecast,
} from "@/lib/api";

import { useEffect, useMemo, useState } from "react";

export default function ForecastsPage() {
  const [inflation, setInflation] =
    useState<InflationForecast | null>(null);

  const [food, setFood] =
    useState<FoodPriceForecast | null>(null);

  const [history, setHistory] =
    useState<HistoricalAnalytics | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadForecasts() {
    try {
      setLoading(true);
      setError(null);

      const [inflationData, foodData, historyData] =
        await Promise.all([
          getInflationForecast(),
          getFoodPriceForecast("Beans (dry)"),
          getHistoricalAnalytics({
            country: "KE",
            indicator: "INFLATION",
          }),
        ]);

      setInflation(inflationData);
      setFood(foodData);
      setHistory(historyData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load forecast data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadForecasts();
  }, []);

  const chartData = useMemo(() => {
    if (!history) return [];

    return history.observations.map((item) => ({
      date: item.date.slice(0, 7),
      value: Number(item.value.toFixed(2)),
    }));
  }, [history]);

  const inflationChange =
    inflation
      ? inflation.forecast_inflation -
        inflation.current_inflation
      : 0;

  const inflationRising = inflationChange >= 0;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        <nav className="flex items-center justify-between">
          <a
            href="/"
            className="text-sm font-semibold tracking-[0.18em]"
          >
            ECONIQ
          </a>

          <div className="hidden gap-8 text-sm text-white/40 md:flex">
            <a href="/discover">Discover</a>
            <a
              href="/forecasts"
              className="text-white"
            >
              Forecasts
            </a>
            <a href="/predictions">Predictions</a>
          </div>

          <span className="text-xs text-white/30">
            Kenya
          </span>
        </nav>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-20"
        >
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Economic forecasting
          </p>

          <h1 className="mt-5 text-5xl font-medium tracking-[-0.05em] sm:text-7xl">
            What happens
            <br />
            <span className="text-white/30">
              next?
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40">
            Machine-learning forecasts built from
            historical economic, market, and
            environmental signals.
          </p>
        </motion.section>

        {loading && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-10">
            <div className="flex items-center gap-3 text-sm text-white/40">
              <RefreshCw
                size={15}
                className="animate-spin"
              />
              Loading ECONIQ forecasts...
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-6">
            <p className="text-sm text-red-300">
              Unable to load forecast data.
            </p>

            <p className="mt-2 text-xs text-red-300/60">
              {error}
            </p>

            <button
              onClick={loadForecasts}
              className="mt-5 rounded-lg border border-white/10 px-4 py-2 text-xs text-white/60 hover:bg-white/[0.05]"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && inflation && food && (
          <>
            <section className="grid gap-4 md:grid-cols-2">

              <ForecastCard
                eyebrow="KENYA INFLATION"
                title="Inflation"
                current={`${inflation.current_inflation.toFixed(2)}%`}
                forecast={`${inflation.forecast_inflation.toFixed(2)}%`}
                change={`${inflationRising ? "+" : ""}${inflationChange.toFixed(2)} pp`}
                rising={inflationRising}
                icon={<TrendingUp size={17} />}
              />

              <ForecastCard
                eyebrow="FOOD PRICE"
                title={food.commodity}
                current={`KES ${food.current_price.toFixed(2)}`}
                forecast={`KES ${food.forecast_price.toFixed(2)}`}
                change={`${food.percentage_change >= 0 ? "+" : ""}${food.percentage_change.toFixed(2)}%`}
                rising={food.percentage_change >= 0}
                icon={<Database size={17} />}
              />

            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[1.7fr_1fr]">

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        size={15}
                        className="text-white/40"
                      />

                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                        Historical trend
                      </span>
                    </div>

                    <h2 className="mt-3 text-xl font-medium">
                      Kenya inflation
                    </h2>

                    <p className="mt-1 text-xs text-white/30">
                      Historical observations from ECONIQ
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                      Forecast
                    </p>

                    <p className="mt-1 text-lg font-medium">
                      {inflation.forecast_inflation.toFixed(2)}%
                    </p>
                  </div>
                </div>

                <div className="mt-8 h-[330px]">
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                  >
                    <LineChart data={chartData}>
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.06)"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="date"
                        tick={{
                          fill: "rgba(255,255,255,0.28)",
                          fontSize: 10,
                        }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={40}
                      />

                      <YAxis
                        tick={{
                          fill: "rgba(255,255,255,0.28)",
                          fontSize: 10,
                        }}
                        tickLine={false}
                        axisLine={false}
                        width={35}
                      />

                      <Tooltip
                        contentStyle={{
                          background: "#0b0b0b",
                          border:
                            "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                        labelStyle={{
                          color:
                            "rgba(255,255,255,0.45)",
                          fontSize: 11,
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="white"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{
                          r: 4,
                        }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>

              <div className="space-y-4">

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                  <div className="flex items-center gap-2">
                    <Brain
                      size={15}
                      className="text-white/40"
                    />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                      Model intelligence
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-medium">
                    Random Forest
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/35">
                    ECONIQ uses a Random Forest
                    regression model to estimate the
                    next month's inflation rate from
                    historical inflation and financial
                    indicators.
                  </p>

                  <div className="mt-6 space-y-3">

                    <InfoRow
                      label="Model"
                      value={inflation.model}
                    />

                    <InfoRow
                      label="Forecast horizon"
                      value="Next month"
                    />

                    <InfoRow
                      label="Latest data"
                      value={inflation.latest_data_date}
                    />

                    <InfoRow
                      label="Model artifact"
                      value={inflation.model_file}
                    />

                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={15}
                      className="text-white/40"
                    />

                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                      Food forecast
                    </span>
                  </div>

                  <p className="mt-5 text-2xl font-medium">
                    KES {food.forecast_price.toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    {food.commodity} · {food.forecast_date}
                  </p>

                  <div className="mt-5 border-t border-white/[0.06] pt-5">
                    <p className="text-xs leading-6 text-white/35">
                      Data through{" "}
                      {food.latest_model_data_date}.
                      Forecast generated from the
                      latest complete model-ready
                      observation.
                    </p>
                  </div>

                </div>

              </div>

            </section>

            <section className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

              <div className="flex items-center gap-2">
                <Database
                  size={15}
                  className="text-white/35"
                />

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                  Forecast methodology
                </span>
              </div>

              <div className="mt-6 grid gap-6 md:grid-cols-3">

                <Method
                  number="01"
                  title="Historical data"
                  text="ECONIQ retrieves structured economic observations and historical market data."
                />

                <Method
                  number="02"
                  title="Feature engineering"
                  text="Lagged values, moving averages, financial indicators, weather and price signals are prepared for modelling."
                />

                <Method
                  number="03"
                  title="Prediction"
                  text="The trained Random Forest model produces the next-period estimate."
                />

              </div>

            </section>
          </>
        )}

      </div>
    </main>
  );
}

function ForecastCard({
  eyebrow,
  title,
  current,
  forecast,
  change,
  rising,
  icon,
}: {
  eyebrow: string;
  title: string;
  current: string;
  forecast: string;
  change: string;
  rising: boolean;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
    >
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04]">
            {icon}
          </div>

          <span className="text-[10px] uppercase tracking-[0.18em] text-white/25">
            {eyebrow}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 text-xs ${
            rising
              ? "text-white/60"
              : "text-white/35"
          }`}
        >
          {rising ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {change}
        </span>

      </div>

      <h2 className="mt-7 text-lg font-medium">
        {title}
      </h2>

      <div className="mt-6 grid grid-cols-2 gap-4">

        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
            Current
          </p>

          <p className="mt-2 text-2xl font-medium">
            {current}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
            Forecast
          </p>

          <p className="mt-2 text-2xl font-medium">
            {forecast}
          </p>
        </div>

      </div>
    </motion.div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] pb-3 last:border-0 last:pb-0">
      <span className="text-xs text-white/25">
        {label}
      </span>

      <span className="max-w-[190px] truncate text-right text-xs text-white/55">
        {value}
      </span>
    </div>
  );
}

function Method({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div>
      <span className="text-[10px] tracking-[0.2em] text-white/20">
        {number}
      </span>

      <h3 className="mt-3 text-sm font-medium">
        {title}
      </h3>

      <p className="mt-2 text-xs leading-6 text-white/30">
        {text}
      </p>
    </div>
  );
}
