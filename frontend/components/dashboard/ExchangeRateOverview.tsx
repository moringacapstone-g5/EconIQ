"use client";

import ExchangeRateD3Chart from "./charts/ExchangeRateD3Chart";

export default function ExchangeRateOverview() {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-white/40">
            Exchange rate
          </p>

          <h2 className="mt-2 text-xl font-semibold tracking-tight text-white">
            Kenya shilling against the US dollar
          </h2>

          <p className="mt-1 text-sm text-white/40">
            Historical KES per USD exchange-rate movement.
          </p>
        </div>

        <div className="text-xs text-white/35">
          Kenya · KES / USD
        </div>
      </div>

      <ExchangeRateD3Chart />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 text-xs text-white/30">
        <span>
          Source · CBK / EconIQ economic data pipeline
        </span>

        <span>
          Historical observations
        </span>
      </div>
    </section>
  );
}
