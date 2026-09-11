"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

export default function InflationOverview() {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
            Inflation
          </p>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-5xl font-medium tracking-[-0.05em] sm:text-6xl">
              6.5%
            </span>

            <span className="mb-2 flex items-center gap-1 text-xs text-white/40">
              <ArrowUpRight size={13} />
              YoY
            </span>
          </div>

          <p className="mt-3 max-w-md text-sm leading-6 text-white/35">
            Kenya's annual consumer price inflation in
            July 2026. Monthly inflation was 0.2%.
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
            CPI
          </p>

          <p className="mt-1 text-sm text-white/60">
            155.20
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative mt-10 h-48 overflow-hidden rounded-2xl border border-white/[0.05] bg-black/20">
        <svg
          viewBox="0 0 800 220"
          className="h-full w-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient
              id="inflationFill"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="white"
                stopOpacity="0.10"
              />

              <stop
                offset="100%"
                stopColor="white"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <path
            d="M0 175
               C70 170 90 160 130 164
               C180 168 190 145 240 150
               C290 155 310 130 350 135
               C400 140 420 112 460 118
               C510 124 535 92 570 103
               C620 116 640 82 680 91
               C720 100 750 65 800 72
               L800 220
               L0 220 Z"
            fill="url(#inflationFill)"
          />

          <motion.path
            d="M0 175
               C70 170 90 160 130 164
               C180 168 190 145 240 150
               C290 155 310 130 350 135
               C400 140 420 112 460 118
               C510 124 535 92 570 103
               C620 116 640 82 680 91
               C720 100 750 65 800 72"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-white/60"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: 1,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </svg>

        <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] text-white/20">
          <span>Jul 2025</span>
          <span>Oct</span>
          <span>Jan 2026</span>
          <span>Apr</span>
          <span>Jul 2026</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs text-white/25">
          Annual inflation trend
        </span>

        <span className="text-xs text-white/30">
          Source · KNBS
        </span>
      </div>
    </section>
  );
}