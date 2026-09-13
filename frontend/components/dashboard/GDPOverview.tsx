"use client";

import GDPD3Chart from "./charts/GDPD3Chart";

export default function GDPOverview() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            GDP growth
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Kenya economic growth trajectory
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Historical annual GDP growth from EconIQ economic data.
          </p>
        </div>

        <div className="text-xs text-white/35">
          Kenya · GDP growth · %
        </div>
      </div>

      <GDPD3Chart />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-white/30">
        <span>
          Source · World Bank / EconIQ economic data pipeline
        </span>

        <span>
          Historical observations
        </span>
      </div>
    </section>
  );
}
