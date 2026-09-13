"use client";

import {
  Activity,
  ArrowRight,
  Brain,
  Database,
  LineChart,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

import FoodPricePrediction from "@/components/dashboard/FoodPricePrediction";

const models = [
  {
    title: "Inflation forecasting",
    description:
      "Predict Kenya's next-month inflation rate using historical inflation and financial-market indicators.",
    model: "Random Forest Regressor",
    target: "Next-month inflation",
    route: "/forecasts",
    icon: LineChart,
  },
  {
    title: "Food price forecasting",
    description:
      "Estimate next-month food prices using historical prices, lagged price behaviour, inflation, monetary policy and environmental signals.",
    model: "Random Forest Regressor",
    target: "Next-month commodity price",
    route: "/forecasts",
    icon: Activity,
  },
];

const signals = [
  "Historical inflation",
  "Lagged economic indicators",
  "Food price history",
  "Moving averages",
  "Central bank rate",
  "Inflation indicators",
  "Rainfall and temperature",
  "Market price behaviour",
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
            <a href="/discover">Discover</a>

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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
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
            ECONIQ transforms historical economic
            data into forward-looking signals,
            helping users understand what may happen
            next.
          </p>
        </motion.section>

        <section>

          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Active models
              </p>

              <h2 className="mt-2 text-2xl font-medium">
                Predictive engine
              </h2>
            </div>

            <span className="text-xs text-white/25">
              Kenya · v1.0
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">

            {models.map((model, index) => {
              const Icon = model.icon;

              return (
                <motion.div
                  key={model.title}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.08,
                  }}
                  className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
                >

                  <div className="flex items-start justify-between">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Icon size={17} />
                    </div>

                    <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] uppercase tracking-[0.15em] text-white/30">
                      Active
                    </span>

                  </div>

                  <h3 className="mt-8 text-xl font-medium">
                    {model.title}
                  </h3>

                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/35">
                    {model.description}
                  </p>

                  <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                        Model
                      </p>

                      <p className="mt-2 text-xs text-white/55">
                        {model.model}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] text-white/20">
                        Target
                      </p>

                      <p className="mt-2 text-xs text-white/55">
                        {model.target}
                      </p>
                    </div>

                  </div>

                  <a
                    href={model.route}
                    className="mt-7 inline-flex items-center gap-2 text-xs text-white/40 transition group-hover:text-white"
                  >
                    View live forecast
                    <ArrowRight size={13} />
                  </a>

                </motion.div>
              );
            })}

          </div>

        </section>

        <section className="mt-12">
          <FoodPricePrediction />
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.4fr]">

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-white/35"
              />

              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                How predictions work
              </span>
            </div>

            <h2 className="mt-5 text-xl font-medium">
              From signals to prediction
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/35">
              ECONIQ combines structured economic
              observations with engineered time-series
              features before passing them through
              trained machine-learning models.
            </p>

            <div className="mt-7 space-y-4">

              <Step
                number="01"
                title="Collect"
                text="Economic, market and environmental data."
              />

              <Step
                number="02"
                title="Engineer"
                text="Lags, changes and moving averages."
              />

              <Step
                number="03"
                title="Predict"
                text="Generate the next-period estimate."
              />

            </div>

          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

            <div className="flex items-center gap-2">
              <Database
                size={15}
                className="text-white/35"
              />

              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Predictive signals
              </span>
            </div>

            <h2 className="mt-5 text-xl font-medium">
              What feeds the models?
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/35">
              The models use multiple classes of
              information rather than relying on a
              single economic variable.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">

              {signals.map((signal) => (
                <span
                  key={signal}
                  className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs text-white/45"
                >
                  {signal}
                </span>
              ))}

            </div>

            <div className="mt-8 border-t border-white/[0.06] pt-6">

              <div className="flex items-start gap-3">

                <ShieldCheck
                  size={16}
                  className="mt-0.5 text-white/40"
                />

                <div>
                  <p className="text-xs font-medium">
                    Predictions are estimates
                  </p>

                  <p className="mt-2 text-xs leading-6 text-white/30">
                    Model outputs represent statistical
                    forecasts based on historical
                    relationships. They should be
                    interpreted alongside current data
                    and source evidence.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

function Step({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">

      <span className="text-[10px] tracking-[0.2em] text-white/20">
        {number}
      </span>

      <div>
        <p className="text-sm font-medium">
          {title}
        </p>

        <p className="mt-1 text-xs text-white/30">
          {text}
        </p>
      </div>

    </div>
  );
}
