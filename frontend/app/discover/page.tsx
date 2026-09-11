"use client";

import {
  ArrowUpRight,
  BarChart3,
  FileText,
  Globe2,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";

const indicators = [
  {
    label: "Inflation",
    value: "6.5%",
    change: "+0.2%",
    period: "July 2026",
  },
  {
    label: "Food inflation",
    value: "9.0%",
    change: "YoY",
    period: "July 2026",
  },
  {
    label: "Transport",
    value: "15.6%",
    change: "YoY",
    period: "July 2026",
  },
  {
    label: "Housing",
    value: "3.2%",
    change: "YoY",
    period: "July 2026",
  },
];

const topics = [
  "Inflation",
  "Food prices",
  "GDP",
  "Exchange rates",
  "Interest rates",
  "Agriculture",
];

export default function DiscoverPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">

        {/* Navigation */}

        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <span className="text-sm font-semibold">
                E
              </span>
            </div>

            <span className="text-sm font-semibold tracking-[0.18em]">
              ECONIQ
            </span>
          </div>

          <div className="hidden items-center gap-8 text-sm text-white/40 md:flex">
            <a
              href="/discover"
              className="text-white"
            >
              Discover
            </a>

            <a
              href="/forecasts"
              className="transition hover:text-white"
            >
              Forecasts
            </a>

            <a
              href="/predictions"
              className="transition hover:text-white"
            >
              Predictions
            </a>

            <a
              href="/"
              className="transition hover:text-white"
            >
              Ask ECONIQ
            </a>
          </div>

          <button className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 transition hover:bg-white/[0.06] hover:text-white">
            Kenya
          </button>
        </nav>

        {/* Header */}

        <motion.section
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
          }}
          className="py-20"
        >
          <div className="flex items-center gap-2 text-white/30">
            <Globe2 size={15} />

            <span className="text-[10px] uppercase tracking-[0.2em]">
              Economic discovery
            </span>
          </div>

          <h1 className="mt-5 max-w-3xl text-5xl font-medium tracking-[-0.05em] sm:text-7xl">
            Discover what is
            <br />

            <span className="text-white/30">
              happening in the economy.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
            Explore economic indicators, market
            movements, reports, and emerging
            signals across Africa.
          </p>
        </motion.section>

        {/* Search */}

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
            delay: 0.1,
          }}
          className="rounded-2xl border border-white/10 bg-white/[0.025] p-2"
        >
          <div className="flex items-center gap-3 px-4">
            <Search
              size={18}
              className="text-white/25"
            />

            <input
              placeholder="Search economic data, indicators, reports..."
              className="h-12 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
            />

            <button className="rounded-xl bg-white px-4 py-2 text-xs font-medium text-black transition hover:bg-white/90">
              Search
            </button>
          </div>
        </motion.div>

        {/* Topics */}

        <section className="mt-5 flex flex-wrap gap-2">
          {topics.map((topic, index) => (
            <motion.button
              key={topic}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.35,
                delay: 0.15 + index * 0.05,
              }}
              className="rounded-full border border-white/[0.08] bg-white/[0.025] px-4 py-2 text-xs text-white/40 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
            >
              {topic}
            </motion.button>
          ))}
        </section>

        {/* Indicators */}

        <section className="mt-16">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Current signals
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Kenya
              </h2>
            </div>

            <span className="text-xs text-white/20">
              July 2026
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {indicators.map((indicator, index) => (
              <motion.div
                key={indicator.label}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.2 + index * 0.07,
                }}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    {indicator.label}
                  </span>

                  <BarChart3
                    size={15}
                    className="text-white/20 transition group-hover:text-white/50"
                  />
                </div>

                <div className="mt-7 text-3xl font-medium tracking-tight">
                  {indicator.value}
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-white/25">
                    {indicator.period}
                  </span>

                  <span className="text-xs text-white/35">
                    {indicator.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Intelligence */}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

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
              delay: 0.35,
            }}
            className="lg:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                size={15}
                className="text-white/40"
              />

              <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                Emerging signal
              </span>
            </div>

            <h3 className="mt-6 text-2xl font-medium">
              Inflation remains elevated
            </h3>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">
              Kenya&apos;s annual consumer price
              inflation reached 6.5% in July
              2026. Food and non-alcoholic
              beverages recorded 9.0% inflation,
              while transport recorded 15.6%.
            </p>

            <button
              className="mt-7 inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
            >
              Explore this signal

              <ArrowUpRight size={13} />
            </button>
          </motion.div>

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
              delay: 0.45,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <Sparkles
              size={16}
              className="text-white/40"
            />

            <h3 className="mt-5 text-lg font-medium">
              Ask ECONIQ
            </h3>

            <p className="mt-3 text-sm leading-6 text-white/35">
              Ask questions about the data and
              let ECONIQ retrieve evidence from
              economic reports.
            </p>

            <a
              href="/"
              className="mt-7 inline-flex items-center gap-2 text-xs text-white/50 transition hover:text-white"
            >
              Start a conversation

              <ArrowUpRight size={13} />
            </a>
          </motion.div>

        </section>

        {/* Reports */}

        <section className="mt-16 pb-20">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Knowledge
            </p>

            <h2 className="mt-2 text-xl font-medium">
              Latest reports
            </h2>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <FileText
                  size={17}
                  className="text-white/35"
                />
              </div>

              <div>
                <h3 className="text-sm font-medium">
                  Kenya Consumer Price Index
                </h3>

                <p className="mt-1 text-xs text-white/30">
                  KNBS · July 2026
                </p>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-white/35">
                  Consumer price developments,
                  inflation movements, commodity
                  prices, transport costs, and
                  housing-related price changes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}