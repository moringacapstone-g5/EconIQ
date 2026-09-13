"use client";

import {
  ArrowRight,
  Database,
  LineChart,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";
import { motion } from "motion/react";
import Navbar from "@/components/layout/Navbar";
import EconomicPulse from "@/components/dashboard/EconomicPulse";
import InflationOverview from "@/components/dashboard/InflationOverview";
import AIInsight from "@/components/dashboard/AIInsight";
import GDPOverview from "@/components/dashboard/GDPOverview";
import ExchangeRateOverview from "@/components/dashboard/ExchangeRateOverview";

const capabilities = [
  {
    icon: Search,
    title: "Ask questions",
    description:
      "Ask ECONIQ questions about economies, indicators, markets and economic reports.",
  },
  {
    icon: Database,
    title: "Evidence-backed",
    description:
      "Answers are grounded in retrieved economic documents rather than unsupported guesses.",
  },
  {
    icon: LineChart,
    title: "Understand trends",
    description:
      "Move from individual observations to historical economic patterns and longitudinal trends.",
  },
  {
    icon: TrendingUp,
    title: "Look ahead",
    description:
      "Combine historical data with predictive models to explore possible economic outcomes.",
  },
];

const dataSources = [
  "KNBS",
  "Central Bank of Kenya",
  "World Bank",
  "African economic datasets",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <Navbar />

        <section className="mx-auto max-w-5xl pb-20 pt-24 sm:pt-32">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
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
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/30">
              <Sparkles size={13} />
              Economic intelligence for Africa
            </div>

            <h1 className="mt-7 text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Understand
              <br />
              <span className="text-white/30">
                what moves Africa.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              ECONIQ brings economic data, research,
              reports and predictive intelligence into one
              place — starting with Kenya and expanding
              across Africa.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-3 rounded-xl bg-white px-5 py-3 text-sm font-medium text-black transition duration-300 hover:bg-white/90"
              >
                Explore ECONIQ

                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-3 text-sm text-white/50 transition duration-300 hover:border-white/20 hover:bg-white/[0.05] hover:text-white"
              >
                View analytics
              </Link>
            </div>
          </motion.div>
        </section>

        <div className="mx-auto max-w-5xl">
          <EconomicPulse />

          <section className="border-t border-white/[0.06] py-16">
            <div className="grid gap-3 lg:grid-cols-[1.4fr_0.8fr]">
              <InflationOverview />
              <GDPOverview />
              <ExchangeRateOverview />
              <AIInsight />
            </div>
          </section>

          <section className="border-t border-white/[0.06] py-24">
            <div className="grid gap-12 md:grid-cols-2 md:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                  One intelligence layer
                </p>

                <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                  From raw economic data
                  <br />
                  <span className="text-white/30">
                    to useful intelligence.
                  </span>
                </h2>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
