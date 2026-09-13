"use client";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";
import { useEffect, useState } from "react";

import {
  InflationForecast,
  getInflationForecast,
} from "@/lib/api";

export default function AIInsight() {
  const [forecast, setForecast] =
    useState<InflationForecast | null>(null);

  useEffect(() => {
    getInflationForecast()
      .then(setForecast)
      .catch((error) =>
        console.error(
          "Failed to load inflation forecast:",
          error,
        ),
      );
  }, []);

  const current = forecast?.current_inflation;
  const predicted = forecast?.forecast_inflation;

  const change =
    current !== undefined &&
    current !== 0 &&
    predicted !== undefined
      ? ((predicted - current) / current) * 100
      : undefined;

  const direction =
    change === undefined
      ? "stable"
      : change > 0
        ? "higher"
        : change < 0
          ? "lower"
          : "stable";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
        delay: 0.2,
      }}
      className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6"
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.03] blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2">
          <Sparkles
            size={15}
            className="text-white/50"
          />

          <span className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            ECONIQ Intelligence
          </span>
        </div>

        <h3 className="mt-5 text-xl font-medium">
          Inflation outlook
        </h3>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45">
          {forecast ? (
            <>
              Kenya&apos;s latest model-ready inflation
              reading is{" "}
              <span className="text-white">
                {current?.toFixed(2)}%
              </span>
              . The Random Forest forecasting model
              estimates{" "}
              <span className="text-white">
                {predicted?.toFixed(2)}%
              </span>{" "}
              for the next month.
            </>
          ) : (
            "Loading the latest ECONIQ inflation forecast..."
          )}
        </p>

        {forecast && (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
            The model points to a{" "}
            <span className="text-white">
              {Math.abs(change ?? 0).toFixed(1)}%
            </span>{" "}
            relative{" "}
            {direction} movement compared with the
            current model input. This is a model estimate,
            not a guaranteed outcome.
          </p>
        )}

        <a
          href="/forecasts"
          className="mt-6 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
        >
          View forecast intelligence
          <ArrowUpRight size={13} />
        </a>
      </div>
    </motion.div>
  );
}
