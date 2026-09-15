"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Database,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import EconomicPulse from "@/components/dashboard/EconomicPulse";
import AIInsight from "@/components/dashboard/AIInsight";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070a] text-white">
      <div className="mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar />

        <section className="relative overflow-hidden pb-16 pt-20 lg:pb-20 lg:pt-28">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-blue-500/[0.07] blur-[120px]" />

          <div className="relative max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Kenya economic intelligence
            </div>

            <h1 className="max-w-4xl text-5xl font-medium tracking-[-0.055em] text-white sm:text-6xl lg:text-7xl">
              Understand what
              <span className="block text-white/45">
                moves the economy.
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/45 sm:text-lg">
              EconIQ brings economic data, research, forecasts and evidence
              together so you can understand what happened, why it happened,
              and what could happen next.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/explore"
                className="econiq-ask-button group"
              >
                <span>Ask EconIQ</span>
                <ArrowRight
                  size={15}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/analytics"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Explore analytics
                <BarChart3 size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <EconomicPulse />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-7 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/30">
                  Intelligence
                </p>

                <h2 className="mt-2 text-xl font-medium tracking-[-0.03em]">
                  What is happening in Kenya?
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-white/35">
                  Get evidence-backed answers from economic reports and
                  structured data.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2.5">
                <Bot size={17} className="text-white/60" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                href="/explore"
                className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-white/15 hover:bg-white/[0.035]"
              >
                <FileText size={17} className="mb-8 text-white/45" />
                <p className="text-sm font-medium">Ask questions</p>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  Query economic reports with evidence.
                </p>
              </Link>

              <Link
                href="/analytics"
                className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-white/15 hover:bg-white/[0.035]"
              >
                <BarChart3 size={17} className="mb-8 text-white/45" />
                <p className="text-sm font-medium">Analyze trends</p>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  Explore historical economic indicators.
                </p>
              </Link>

              <Link
                href="/forecasts"
                className="group rounded-xl border border-white/[0.06] bg-black/20 p-4 transition hover:border-white/15 hover:bg-white/[0.035]"
              >
                <TrendingUp size={17} className="mb-8 text-white/45" />
                <p className="text-sm font-medium">See forecasts</p>
                <p className="mt-1 text-xs leading-5 text-white/30">
                  Explore food and inflation predictions.
                </p>
              </Link>
            </div>
          </div>

          <AIInsight />
        </section>

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <Database size={18} className="text-white/45" />

            <p className="mt-6 text-sm font-medium">
              Structured economic data
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Kenya indicators from trusted economic sources, organized for
              analysis and comparison.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <Sparkles size={18} className="text-white/45" />

            <p className="mt-6 text-sm font-medium">
              Evidence-backed intelligence
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Ask questions and retrieve relevant evidence from economic
              documents through RAG.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            <TrendingUp size={18} className="text-white/45" />

            <p className="mt-6 text-sm font-medium">
              Forward-looking signals
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Use forecasting models to monitor expected inflation and food
              price movements.
            </p>
          </div>
        </section>

        <section className="mt-16 border-t border-white/[0.06] py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">EconIQ</p>
              <p className="mt-1 text-xs text-white/25">
                Economic Intelligence for Africa · Kenya first
              </p>
            </div>

            <div className="text-xs text-white/25">
              Data → Analysis → Prediction → Evidence
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
