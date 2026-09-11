"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { motion } from "motion/react";

const driverData = [
  {
    category: "Food",
    inflation: 9.0,
  },
  {
    category: "Transport",
    inflation: 15.6,
  },
  {
    category: "Housing",
    inflation: 3.2,
  },
];

export default function InflationDrivers() {
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
        delay: 0.1,
      }}
      className="
        rounded-2xl
        border border-white/[0.07]
        bg-white/[0.025]
        p-5
      "
    >
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
          Inflation Drivers
        </p>

        <h3 className="mt-2 text-lg font-medium">
          Major expenditure divisions
        </h3>

        <p className="mt-1 text-xs text-white/30">
          Year-on-year inflation · July 2026
        </p>
      </div>

      <div className="h-[280px]">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <BarChart
            data={driverData}
            margin={{
              top: 5,
              right: 5,
              left: -20,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="category"
              tick={{
                fill: "rgba(255,255,255,0.35)",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{
                fill: "rgba(255,255,255,0.3)",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(value) =>
                `${value}%`
              }
            />

            <Tooltip
              contentStyle={{
                background: "#0b0b0b",
                border:
                  "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              }}
              formatter={(value) => [
                `${value}%`,
                "Inflation",
              ]}
            />

            <Bar
              dataKey="inflation"
              fill="rgba(255,255,255,0.75)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}