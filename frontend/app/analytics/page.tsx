"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Database,
  Globe2,
  Percent,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import InflationOverview from "@/components/dashboard/InflationOverview";
import GDPOverview from "@/components/dashboard/GDPOverview";
import ExchangeRateOverview from "@/components/dashboard/ExchangeRateOverview";
import { getLatestAnalytics } from "@/lib/api";

function Metric({
  label,
  value,
  unit,
  date,
}: {
  label: string;
  value: string;
  unit?: string;
  date?: string;
}) {
  return (
    <div className="econiq-panel econiq-panel-hover p-5">
      <p className="econiq-label">{label}</p>

      <div className="mt-4 flex items-end gap-1">
        <span className="text-3xl font-medium tracking-[-0.045em]">
          {value}
        </span>

        {unit && (
          <span className="mb-1 text-xs text-white/30">
            {unit}
          </span>
        )}
      </div>

      {date && (
        <p className="mt-3 text-[11px] text-white/25">
          Latest observation · {date}
        </p>
      )}
    </div>
  );
}

export default function AnalyticsPage() {
  const [inflation, setInflation] = useState<any>(null);
  const [gdp, setGdp] = useState<any>(null);
  const [interest, setInterest] = useState<any>(null);
  const [exchange, setExchange] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const results = await Promise.all([
        getLatestAnalytics("KE", "INFLATION"),
        getLatestAnalytics("KE", "GDP_GROWTH"),
        getLatestAnalytics("KE", "INTEREST_RATE"),
        getLatestAnalytics("KE", "EXCHANGE_RATE"),
      ]);

      setInflation(results[0]);
      setGdp(results[1]);
      setInterest(results[2]);
      setExchange(results[3]);
    }

    load();
  }, []);

  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar />

        <section className="relative pb-12 pt-20">
          <div className="econiq-glow absolute inset-0" />

          <div className="relative">
            <div className="flex items-center gap-2 text-white/30">
              <BarChart3 size={14} />
              <span className="econiq-label">
                Economic analytics
              </span>
            </div>

            <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
              <div>
                <h1 className="text-5xl font-medium tracking-[-0.055em] sm:text-6xl">
                  Kenya
                  <span className="block text-white/40">
                    economic picture.
                  </span>
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/40">
                  Explore historical economic indicators, identify trends,
                  and compare the signals shaping Kenya's economy.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <Globe2 size={14} />
                Kenya · KES
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric
            label="Inflation"
            value={inflation ? inflation.value.toFixed(1) : "—"}
            unit="%"
            date={inflation?.date}
          />

          <Metric
            label="GDP growth"
            value={gdp ? gdp.value.toFixed(2) : "—"}
            unit="%"
            date={gdp?.date}
          />

          <Metric
            label="CBK rate"
            value={interest ? interest.value.toFixed(2) : "—"}
            unit="%"
            date={interest?.date}
          />

          <Metric
            label="KES / USD"
            value={exchange ? exchange.value.toFixed(2) : "—"}
            date={exchange?.date}
          />
        </section>

        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="econiq-label">Price stability</p>
              <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
                Inflation
              </h2>
            </div>

            <Percent size={18} className="text-white/20" />
          </div>

          <InflationOverview />
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="econiq-label">Economic activity</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
              GDP growth
            </h2>
          </div>

          <GDPOverview />
        </section>

        <section className="mt-12">
          <div className="mb-6">
            <p className="econiq-label">Currency markets</p>
            <h2 className="mt-2 text-2xl font-medium tracking-[-0.035em]">
              Exchange rate
            </h2>
          </div>

          <ExchangeRateOverview />
        </section>

        <section className="mt-12 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
              <Database size={16} className="text-white/45" />
            </div>

            <div>
              <h3 className="text-sm font-medium">
                Data provenance
              </h3>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/30">
                Economic observations are sourced from EconIQ's structured
                economic data layer, including KNBS, CBK and World Bank
                datasets. Historical charts show observations available in
                the platform rather than real-time market data.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 border-t border-white/[0.06] py-10">
          <div className="flex items-center justify-between text-xs text-white/25">
            <span>Historical economic analysis</span>
            <span className="flex items-center gap-1">
              Explore forecasts
              <ArrowUpRight size={12} />
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
