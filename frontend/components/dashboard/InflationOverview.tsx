"use client";

import InflationD3Chart from "./charts/InflationD3Chart";

export default function InflationOverview() {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
      <div className="mb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
          Inflation
        </p>

        <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
          Kenya inflation trend
        </h2>

        <p className="mt-1 text-sm text-white/35">
          Historical inflation rate and model forecast.
        </p>
      </div>

      <InflationD3Chart />
    </section>
  );
}
