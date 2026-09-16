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
import { useEffect, useRef } from "react";

import Navbar from "@/components/layout/Navbar";
import EconomicPulse from "@/components/dashboard/EconomicPulse";
import AIInsight from "@/components/dashboard/AIInsight";

export default function HomePage() {
  const pageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const page = pageRef.current;

    if (!page) return;

    const supportsPointer =
      window.matchMedia("(pointer: fine)").matches;

    const reducedMotion =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!supportsPointer || reducedMotion) return;

    const bubbles = Array.from(
      page.querySelectorAll<HTMLElement>(".cursor-bubble"),
    );

    if (!bubbles.length) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    const positions = bubbles.map(() => ({
      x: mouseX,
      y: mouseY,
    }));

    const speeds = [0.20, 0.15, 0.115, 0.085, 0.06, 0.04];

    const offsets = [
      { x: 0, y: 0 },
      { x: -12, y: 8 },
      { x: 18, y: -12 },
      { x: -24, y: 18 },
      { x: 28, y: 24 },
      { x: -34, y: -22 },
    ];

    let animationFrame = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const animate = () => {
      bubbles.forEach((bubble, index) => {
        const position = positions[index];
        const speed = speeds[index];
        const offset = offsets[index];

        position.x += (mouseX - position.x) * speed;
        position.y += (mouseY - position.y) * speed;

        bubble.style.transform = `
          translate3d(
            ${position.x + offset.x}px,
            ${position.y + offset.y}px,
            0
          )
          translate(-50%, -50%)
        `;
      });

      animationFrame = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove, {
      passive: true,
    });

    animationFrame = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <main
      ref={pageRef}
      className="relative min-h-screen overflow-hidden bg-[#05070a] text-white"
    >
      {/* =====================================================
          CURSOR BUBBLE TRAIL
          ===================================================== */}

      <div className="pointer-events-none fixed inset-0 z-[5] overflow-hidden">
        <div className="cursor-bubble absolute left-0 top-0 h-24 w-24 rounded-full border border-blue-400/[0.18] bg-blue-500/[0.045] shadow-[0_0_45px_rgba(59,130,246,0.12)] backdrop-blur-[1px]" />

        <div className="cursor-bubble absolute left-0 top-0 h-16 w-16 rounded-full border border-blue-300/[0.14] bg-blue-400/[0.035] shadow-[0_0_35px_rgba(59,130,246,0.10)]" />

        <div className="cursor-bubble absolute left-0 top-0 h-12 w-12 rounded-full border border-white/[0.10] bg-white/[0.025] shadow-[0_0_30px_rgba(96,165,250,0.08)]" />

        <div className="cursor-bubble absolute left-0 top-0 h-20 w-20 rounded-full border border-blue-400/[0.10] bg-blue-500/[0.025] shadow-[0_0_40px_rgba(59,130,246,0.08)]" />

        <div className="cursor-bubble absolute left-0 top-0 h-9 w-9 rounded-full border border-white/[0.12] bg-white/[0.03]" />

        <div className="cursor-bubble absolute left-0 top-0 h-6 w-6 rounded-full border border-blue-300/[0.18] bg-blue-400/[0.045]" />
      </div>

      {/* =====================================================
          STATIC AMBIENT LIGHT
          ===================================================== */}

      <div
        className="pointer-events-none absolute left-1/2 top-[-180px] z-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(37,99,235,0.055), transparent 68%)",
          filter: "blur(100px)",
        }}
      />

      {/* =====================================================
          AMBIENT DATA POINTS
          ===================================================== */}

      <div className="pointer-events-none absolute inset-0 z-0">
        <span className="absolute left-[16%] top-[20%] h-1 w-1 rounded-full bg-blue-400/40" />
        <span className="absolute left-[78%] top-[17%] h-1 w-1 rounded-full bg-blue-400/30" />
        <span className="absolute left-[85%] top-[40%] h-1.5 w-1.5 rounded-full bg-white/15" />
        <span className="absolute left-[12%] top-[58%] h-1 w-1 rounded-full bg-blue-400/25" />
        <span className="absolute left-[68%] top-[72%] h-1 w-1 rounded-full bg-white/15" />
        <span className="absolute left-[40%] top-[84%] h-1.5 w-1.5 rounded-full bg-blue-400/20" />
      </div>

      {/* =====================================================
          PAGE CONTENT
          ===================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-6 lg:px-10">
        <Navbar />

        {/* HERO */}

        <section className="relative overflow-hidden pb-16 pt-20 lg:pb-20 lg:pt-28">
          <div className="relative max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/50 backdrop-blur-sm">
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
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-white/65 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              >
                Explore analytics
                <BarChart3 size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ECONOMIC PULSE */}

        <section className="relative mb-12">
          <EconomicPulse />
        </section>

        {/* INTELLIGENCE */}

        <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6 backdrop-blur-sm transition duration-300 hover:border-white/[0.12] hover:bg-white/[0.035]">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-500/[0.035] blur-[80px] transition duration-500 group-hover:bg-blue-500/[0.07]" />

            <div className="relative">
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
                  className="group/card rounded-xl border border-white/[0.06] bg-black/20 p-4 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.035]"
                >
                  <FileText
                    size={17}
                    className="mb-8 text-white/45 transition group-hover/card:text-white/70"
                  />

                  <p className="text-sm font-medium">
                    Ask questions
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Query economic reports with evidence.
                  </p>
                </Link>

                <Link
                  href="/analytics"
                  className="group/card rounded-xl border border-white/[0.06] bg-black/20 p-4 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.035]"
                >
                  <BarChart3
                    size={17}
                    className="mb-8 text-white/45 transition group-hover/card:text-white/70"
                  />

                  <p className="text-sm font-medium">
                    Analyze trends
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Explore historical economic indicators.
                  </p>
                </Link>

                <Link
                  href="/forecasts"
                  className="group/card rounded-xl border border-white/[0.06] bg-black/20 p-4 transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.035]"
                >
                  <TrendingUp
                    size={17}
                    className="mb-8 text-white/45 transition group-hover/card:text-white/70"
                  />

                  <p className="text-sm font-medium">
                    See forecasts
                  </p>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Explore food and inflation predictions.
                  </p>
                </Link>
              </div>
            </div>
          </div>

          <AIInsight />
        </section>

        {/* CAPABILITIES */}

        <section className="mt-5 grid gap-5 md:grid-cols-3">
          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.035]">
            <Database
              size={18}
              className="text-white/45 transition group-hover:text-white/70"
            />

            <p className="mt-6 text-sm font-medium">
              Structured economic data
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Kenya indicators from trusted economic sources, organized for
              analysis and comparison.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.035]">
            <Sparkles
              size={18}
              className="text-white/45 transition group-hover:text-white/70"
            />

            <p className="mt-6 text-sm font-medium">
              Evidence-backed intelligence
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Ask questions and retrieve relevant evidence from economic
              documents through RAG.
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/[0.12] hover:bg-white/[0.035]">
            <TrendingUp
              size={18}
              className="text-white/45 transition group-hover:text-white/70"
            />

            <p className="mt-6 text-sm font-medium">
              Forward-looking signals
            </p>

            <p className="mt-2 text-sm leading-6 text-white/30">
              Use forecasting models to monitor expected inflation and food
              price movements.
            </p>
          </div>
        </section>

        {/* FOOTER */}

        <section className="mt-16 border-t border-white/[0.06] py-10">
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-medium">
                EconIQ
              </p>

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
