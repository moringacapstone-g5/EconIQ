"use client";

import InflationD3Chart from "./charts/InflationD3Chart";

export default function InflationOverview() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Inflation overview
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Kenya inflation trajectory
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Historical observations with the latest model forecast.
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs text-white/40">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            Historical
          </span>

          <span className="flex items-center gap-2">
            <span className="h-px w-5 border-t border-dashed border-white/40" />
            Forecast
          </span>
        </div>
      </div>

      <InflationD3Chart />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-white/30">
        <span>
          Source · KNBS / EconIQ economic data pipeline
        </span>

        <span>
          Kenya · Inflation · %
        </span>
      </div>
    </section>
  );
}
