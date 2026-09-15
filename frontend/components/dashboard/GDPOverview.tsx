"use client";

import GDPD3Chart from "./charts/GDPD3Chart";

export default function GDPOverview() {
  return (
    <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
      <div className="mb-6">
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
          GDP Growth
        </p>

        <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
          Kenya economic growth
        </h2>

        <p className="mt-1 text-sm text-white/35">
          Historical GDP growth observations.
        </p>
      </div>

      <GDPD3Chart />
    </section>
  );
}
