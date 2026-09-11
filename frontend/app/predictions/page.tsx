"use client";

import {
  Activity,
  ArrowUpRight,
  Brain,
  ShieldAlert,
} from "lucide-react";

import { motion } from "motion/react";

const predictionAreas = [
  {
    title: "Food price risk",
    description:
      "Estimate the probability of significant food-price movements using market, weather, and historical data.",
    status: "Coming soon",
  },
  {
    title: "Economic risk",
    description:
      "Identify emerging macroeconomic risks from multiple economic indicators.",
    status: "Coming soon",
  },
  {
    title: "Agricultural risk",
    description:
      "Combine weather, crop, market, and historical observations to estimate agricultural risk.",
    status: "Coming soon",
  },
  {
    title: "Catastrophe risk",
    description:
      "Model climate-related risks that could affect agriculture, insurance, and local economies.",
    status: "Coming soon",
  },
];

export default function PredictionsPage() {
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

            <a href="/forecasts">
              Forecasts
            </a>

            <a
              href="/predictions"
              className="text-white"
            >
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
          <div className="flex items-center gap-2 text-white/30">
            <Brain size={15} />

            <span className="text-[10px] uppercase tracking-[0.2em]">
              Predictive intelligence
            </span>
          </div>

          <h1 className="mt-5 text-5xl font-medium tracking-[-0.05em] sm:text-7xl">
            What could
            <br />

            <span className="text-white/30">
              happen?
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40">
            Move beyond historical data. ECONIQ
            will combine economic, agricultural,
            climate, and market signals to estimate
            future risks and outcomes.
          </p>
        </motion.section>

        <div className="grid gap-4 md:grid-cols-2">

          {predictionAreas.map(
            (prediction, index) => (
              <motion.div
                key={prediction.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                }}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    {index === 0 ? (
                      <Activity size={17} />
                    ) : index === 3 ? (
                      <ShieldAlert size={17} />
                    ) : (
                      <Brain size={17} />
                    )}
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                    {prediction.status}
                  </span>
                </div>

                <h2 className="mt-8 text-xl font-medium">
                  {prediction.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-white/35">
                  {prediction.description}
                </p>

                <button className="mt-7 inline-flex items-center gap-2 text-xs text-white/30 transition group-hover:text-white/60">
                  Explore model
                  <ArrowUpRight size={13} />
                </button>
              </motion.div>
            ),
          )}

        </div>

      </div>
    </main>
  );
}