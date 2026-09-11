"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { motion } from "motion/react";

const inflationData = [
  {
    month: "Jan",
    inflation: 5.8,
  },
  {
    month: "Feb",
    inflation: 6.0,
  },
  {
    month: "Mar",
    inflation: 6.1,
  },
  {
    month: "Apr",
    inflation: 6.2,
  },
  {
    month: "May",
    inflation: 6.3,
  },
  {
    month: "Jun",
    inflation: 6.3,
  },
  {
    month: "Jul",
    inflation: 6.5,
  },
];

export default function InflationChart() {
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
      }}
      className="
        rounded-2xl
        border border-white/[0.07]
        bg-white/[0.025]
        p-5
      "
    >
      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
            Inflation
          </p>

          <h3 className="mt-2 text-lg font-medium">
            Consumer price inflation
          </h3>

          <p className="mt-1 text-xs text-white/30">
            Kenya · January–July 2026
          </p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-medium">
            6.5%
          </div>

          <div className="mt-1 text-xs text-white/25">
            July 2026
          </div>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={inflationData}
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
              dataKey="month"
              tick={{
                fill: "rgba(255,255,255,0.3)",
                fontSize: 11,
              }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              domain={[5, 7]}
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
                color: "#fff",
              }}
              formatter={(value) => [
                `${value}%`,
                "Inflation",
              ]}
            />

            <Line
              type="monotone"
              dataKey="inflation"
              stroke="white"
              strokeWidth={2}
              dot={{
                r: 3,
                fill: "white",
              }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}