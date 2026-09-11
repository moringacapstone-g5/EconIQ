"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Database,
  Globe2,
  LineChart,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";

import Navbar from "@/components/layout/Navbar";

const indicators = [
  {
    name: "Inflation",
    code: "INFLATION",
    value: "6.5%",
    period: "July 2026",
    change: "+0.2%",
    direction: "up",
  },
  {
    name: "GDP Growth",
    code: "GDP_GROWTH",
    value: "—",
    period: "Latest",
    change: "Awaiting data",
    direction: "neutral",
  },
  {
    name: "Unemployment",
    code: "UNEMPLOYMENT",
    value: "—",
    period: "Latest",
    change: "Awaiting data",
    direction: "neutral",
  },
  {
    name: "Interest Rate",
    code: "INTEREST_RATE",
    value: "—",
    period: "Latest",
    change: "Awaiting data",
    direction: "neutral",
  },
];

const periods = [
  "2025",
  "Q1 2026",
  "Q2 2026",
  "Jul 2026",
];

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">

        <Navbar />

        {/* Hero */}

        <motion.section
          initial={{
            opacity: 0,
            y: 24,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="py-20"
        >
          <div className="flex items-center gap-2 text-white/30">
            <LineChart size={15} />

            <span className="text-[10px] uppercase tracking-[0.2em]">
              Economic analytics
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-7xl">
            Understand the
            <br />

            <span className="text-white/30">
              numbers behind Africa.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
            Explore historical economic indicators,
            compare trends and uncover relationships
            across African economies.
          </p>
        </motion.section>

        {/* Controls */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.2,
          }}
          transition={{
            duration: 0.6,
          }}
          className="grid gap-3 md:grid-cols-3"
        >
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
              Country
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">
                Kenya
              </span>

              <Globe2
                size={15}
                className="text-white/25"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
              Indicator
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm">
                Inflation
              </span>

              <TrendingUp
                size={15}
                className="text-white/25"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
              Period
            </p>

            <div className="mt-3 text-sm">
              2025 — 2026
            </div>
          </div>
        </motion.section>

        {/* Indicator cards */}

        <section className="mt-16">

          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              Economic indicators
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Kenya
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {indicators.map((indicator, index) => (
              <motion.div
                key={indicator.code}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.07,
                }}
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  p-5
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-white/15
                  hover:bg-white/[0.045]
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/40">
                      {indicator.name}
                    </p>

                    <p className="mt-1 text-[9px] uppercase tracking-[0.15em] text-white/15">
                      {indicator.code}
                    </p>
                  </div>

                  <BarChart3
                    size={15}
                    className="text-white/20"
                  />
                </div>

                <div className="mt-7 text-3xl font-medium tracking-tight">
                  {indicator.value}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/20">
                    {indicator.period}
                  </span>

                  {indicator.direction === "up" ? (
                    <span className="flex items-center gap-1 text-xs text-white/40">
                      <ArrowUpRight size={12} />
                      {indicator.change}
                    </span>
                  ) : (
                    <span className="text-xs text-white/20">
                      {indicator.change}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main chart */}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
            }}
            className="
              lg:col-span-2
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-6
            "
          >
            <div className="flex items-start justify-between">

              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={15}
                    className="text-white/35"
                  />

                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                    Historical trend
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-medium">
                  Inflation
                </h2>

                <p className="mt-1 text-xs text-white/25">
                  Kenya · annual consumer price inflation
                </p>
              </div>

              <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/30">
                YoY
              </span>

            </div>

            {/* Chart placeholder */}

            <div
              className="
                relative
                mt-8
                h-80
                overflow-hidden
                rounded-xl
                border
                border-white/[0.06]
                bg-black/20
              "
            >

              {/* Grid */}

              <div className="absolute inset-0 flex flex-col justify-between p-6">
                {[1, 2, 3, 4, 5].map((line) => (
                  <div
                    key={line}
                    className="border-t border-white/[0.045]"
                  />
                ))}
              </div>

              {/* Empty chart state */}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">

                  <LineChart
                    size={22}
                    className="mx-auto text-white/20"
                  />

                  <p className="mt-4 text-sm text-white/40">
                    Historical series ready for connection
                  </p>

                  <p className="mt-2 max-w-sm text-xs leading-5 text-white/20">
                    The chart will read observations from
                    PostgreSQL through the FastAPI analytics
                    endpoint.
                  </p>

                </div>
              </div>

              {/* X axis */}

              <div className="absolute bottom-4 left-6 right-6 flex justify-between">
                {periods.map((period) => (
                  <span
                    key={period}
                    className="text-[9px] text-white/15"
                  >
                    {period}
                  </span>
                ))}
              </div>

            </div>
          </motion.div>

          {/* Insight panel */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-6
            "
          >

            <div className="flex items-center gap-2">
              <TrendingUp
                size={15}
                className="text-white/35"
              />

              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Signal
              </span>
            </div>

            <h2 className="mt-6 text-xl font-medium">
              Inflation remains elevated
            </h2>

            <p className="mt-4 text-sm leading-7 text-white/35">
              Kenya&apos;s annual consumer price
              inflation was 6.5% in July 2026.
              Monthly inflation between June and
              July was 0.2%.
            </p>

            <div className="mt-8 border-t border-white/[0.06] pt-6">

              <p className="text-[10px] uppercase tracking-[0.18em] text-white/20">
                Latest observation
              </p>

              <div className="mt-3 flex items-end justify-between">
                <span className="text-3xl font-medium">
                  6.5%
                </span>

                <span className="text-xs text-white/25">
                  July 2026
                </span>
              </div>

            </div>

          </motion.div>

        </section>

        {/* Data provenance */}

        <section className="mt-16 pb-20">

          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
              Data intelligence
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Data provenance
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-3">

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

              <Database
                size={17}
                className="text-white/30"
              />

              <h3 className="mt-5 text-sm font-medium">
                PostgreSQL
              </h3>

              <p className="mt-3 text-xs leading-6 text-white/30">
                Structured economic observations,
                indicators, countries and source
                metadata are stored in the relational
                data layer.
              </p>

            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

              <Globe2
                size={17}
                className="text-white/30"
              />

              <h3 className="mt-5 text-sm font-medium">
                Multiple sources
              </h3>

              <p className="mt-3 text-xs leading-6 text-white/30">
                ECONIQ can combine KNBS, CBK,
                World Bank and eventually additional
                African data sources.
              </p>

            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">

              <BarChart3
                size={17}
                className="text-white/30"
              />

              <h3 className="mt-5 text-sm font-medium">
                Analytics layer
              </h3>

              <p className="mt-3 text-xs leading-6 text-white/30">
                Historical observations will feed
                visualization, statistical analysis,
                forecasting and prediction models.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}