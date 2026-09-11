"use client";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Globe2,
} from "lucide-react";

import MetricCard from "./MetricCard";

export default function EconomicPulse() {
  return (
    <section className="border-t border-white/[0.06] py-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Activity
              size={14}
              className="text-white/30"
            />

            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Economic Pulse
            </p>
          </div>

          <h2 className="text-xl font-medium">
            Kenya
          </h2>

          <p className="mt-1 text-xs text-white/30">
            Latest available economic indicators
          </p>
        </div>

        <button
          className="
            hidden
            items-center
            gap-2
            text-xs
            text-white/35
            transition
            hover:text-white
            sm:flex
          "
        >
          Explore data
          <ArrowUpRight size={13} />
        </button>
      </div>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
        <Globe2
          size={14}
          className="text-white/30"
        />

        <span className="text-xs text-white/35">
          Kenya · July 2026
        </span>

        <span className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/60" />
          Latest
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Inflation"
          value="6.5%"
          description="Year-on-year · July 2026"
          change="0.2% monthly"
          trend="up"
        />

        <MetricCard
          label="GDP Growth"
          value="—"
          description="Economic growth indicator"
        />

        <MetricCard
          label="Exchange Rate"
          value="—"
          description="KES exchange indicator"
        />

        <MetricCard
          label="Interest Rate"
          value="—"
          description="Monetary policy indicator"
        />
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <BarChart3
              size={15}
              className="text-white/25"
            />

            <span className="text-xs text-white/35">
              Food inflation
            </span>
          </div>

          <div className="mt-5 text-2xl font-medium">
            9.0%
          </div>

          <p className="mt-1 text-xs text-white/25">
            Year-on-year · July 2026
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <BarChart3
              size={15}
              className="text-white/25"
            />

            <span className="text-xs text-white/35">
              Transport inflation
            </span>
          </div>

          <div className="mt-5 text-2xl font-medium">
            15.6%
          </div>

          <p className="mt-1 text-xs text-white/25">
            Year-on-year · July 2026
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="flex items-center gap-2">
            <BarChart3
              size={15}
              className="text-white/25"
            />

            <span className="text-xs text-white/35">
              Housing & utilities
            </span>
          </div>

          <div className="mt-5 text-2xl font-medium">
            3.2%
          </div>

          <p className="mt-1 text-xs text-white/25">
            Year-on-year · July 2026
          </p>
        </div>
      </div>
    </section>
  );
}