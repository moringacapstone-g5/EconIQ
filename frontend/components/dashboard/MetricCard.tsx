"use client";

import {
  ArrowDown,
  ArrowUp,
  Minus,
} from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
}

export default function MetricCard({
  label,
  value,
  description,
  change,
  trend = "neutral",
}: MetricCardProps) {
  const TrendIcon =
    trend === "up"
      ? ArrowUp
      : trend === "down"
        ? ArrowDown
        : Minus;

  return (
    <div
      className="
        group
        rounded-2xl
        border border-white/[0.08]
        bg-white/[0.025]
        p-5
        transition
        duration-300
        hover:-translate-y-1
        hover:border-white/[0.14]
        hover:bg-white/[0.045]
      "
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/40">
          {label}
        </span>

        {change && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <TrendIcon size={12} />
            {change}
          </div>
        )}
      </div>

      <div className="mt-6">
        <div className="text-3xl font-medium tracking-tight">
          {value}
        </div>

        {description && (
          <p className="mt-2 text-xs text-white/25">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}