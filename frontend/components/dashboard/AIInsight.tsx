"use client";

import {
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import { motion } from "motion/react";

export default function AIInsight() {
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
      className="
        relative
        overflow-hidden
        rounded-2xl
        border border-white/[0.08]
        bg-white/[0.025]
        p-6
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          -right-20
          -top-20
          h-48
          w-48
          rounded-full
          bg-white/[0.03]
          blur-3xl
        "
      />

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
          Inflation remains elevated
        </h3>

        <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45">
          Kenya&apos;s annual consumer price
          inflation reached{" "}
          <span className="text-white">
            6.5%
          </span>{" "}
          in July 2026. Food and
          non-alcoholic beverages recorded
          9.0% year-on-year inflation, while
          transport recorded 15.6%.
        </p>

        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
          Food and non-alcoholic beverages
          contributed{" "}
          <span className="text-white">
            2.6 percentage points
          </span>{" "}
          to overall inflation.
        </p>

        <button
          className="
            mt-6
            inline-flex
            items-center
            gap-2
            text-xs
            text-white/45
            transition
            hover:text-white
          "
        >
          Ask ECONIQ about this
          <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  );
}