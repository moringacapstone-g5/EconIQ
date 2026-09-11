"use client";

import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";

const drivers = [
  {
    name: "Transport",
    value: "15.6%",
    description: "Year-on-year inflation",
  },
  {
    name: "Food & Non-Alcoholic Beverages",
    value: "9.0%",
    description: "Year-on-year inflation",
  },
  {
    name: "Housing & Utilities",
    value: "3.2%",
    description: "Year-on-year inflation",
  },
];

export default function InflationDrivers() {
  return (
    <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 sm:p-8">
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">
          Inflation Drivers
        </p>

        <h2 className="mt-2 text-xl font-medium">
          What is driving prices?
        </h2>

        <p className="mt-2 max-w-lg text-sm leading-6 text-white/35">
          The largest annual price increases in the
          major expenditure divisions reported by KNBS.
        </p>
      </div>

      <div className="space-y-3">
        {drivers.map((driver, index) => (
          <motion.div
            key={driver.name}
            initial={{
              opacity: 0,
              x: -15,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.4,
              delay: index * 0.08,
            }}
            className="group rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition hover:border-white/[0.13] hover:bg-white/[0.045]"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-white/70">
                  {driver.name}
                </p>

                <p className="mt-1 text-xs text-white/25">
                  {driver.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-medium">
                  {driver.value}
                </span>

                <ArrowUpRight
                  size={14}
                  className="text-white/25 transition group-hover:text-white/60"
                />
              </div>
            </div>

            <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.05]">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width:
                    driver.name === "Transport"
                      ? "100%"
                      : driver.name ===
                        "Food & Non-Alcoholic Beverages"
                      ? "58%"
                      : "21%",
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2 + index * 0.1,
                }}
                className="h-full rounded-full bg-white/40"
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 border-t border-white/[0.06] pt-5">
        <p className="text-xs leading-5 text-white/25">
          These figures represent division-level year-on-year
          inflation, not direct percentage-point contributions
          to the overall 6.5% inflation rate.
        </p>
      </div>
    </section>
  );
}