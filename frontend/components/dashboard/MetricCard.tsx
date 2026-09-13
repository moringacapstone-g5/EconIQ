"use client";

import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  detail?: string;
  trend?: number;
}

export default function MetricCard({
  label,
  value,
  detail,
  trend,
}: MetricCardProps) {
  const trendUp = typeof trend === "number" && trend > 0;
  const trendDown = typeof trend === "number" && trend < 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.05]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.18em] text-white/40">
          {label}
        </p>

        {typeof trend === "number" && (
          <span className="flex items-center gap-1 text-xs text-white/50">
            {trendUp && <ArrowUp className="h-3 w-3" />}
            {trendDown && <ArrowDown className="h-3 w-3" />}
            {!trendUp && !trendDown && <Minus className="h-3 w-3" />}
            {Math.abs(trend).toFixed(2)}%
          </span>
        )}
      </div>

      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>

      {detail && (
        <p className="mt-2 text-sm text-white/40">
          {detail}
        </p>
      )}
    </div>
  );
}
