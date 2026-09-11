"use client";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";

export default function ForecastsPage() {
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
            <a href="/discover">
              Discover
            </a>

            <a
              href="/forecasts"
              className="text-white"
            >
              Forecasts
            </a>

            <a href="/predictions">
              Predictions
            </a>
          </div>

          <span className="text-xs text-white/30">
            Kenya
          </span>
        </nav>

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
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
            ECONIQ forecasting models will use
            historical economic observations to
            estimate future trends and uncertainty.
          </p>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-3">

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <span className="text-xs text-white/30">
              Indicator
            </span>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">
                Inflation
              </span>

              <ChevronDown size={15} className="text-white/30" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <span className="text-xs text-white/30">
              Horizon
            </span>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">
                6 months
              </span>

              <CalendarDays size={15} className="text-white/30" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <span className="text-xs text-white/30">
              Model
            </span>

            <div className="mt-3 text-sm">
              Coming soon
            </div>
          </div>

        </div>

        <div className="mt-6 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-8">

          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-white/40" />

            <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Forecast preview
            </span>
          </div>

          <div className="mt-10 flex h-72 items-center justify-center rounded-xl border border-dashed border-white/[0.08]">
            <div className="text-center">
              <Sparkles
                size={20}
                className="mx-auto text-white/25"
              />

              <p className="mt-4 text-sm text-white/40">
                Forecast model coming next
              </p>

              <p className="mt-2 text-xs text-white/20">
                Historical observations will feed
                the forecasting engine.
              </p>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}