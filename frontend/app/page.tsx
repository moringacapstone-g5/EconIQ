"use client";

import {
  ArrowRight,
  BarChart3,
  Database,
  FileText,
  Globe2,
  LineChart,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";
import { motion } from "motion/react";

import Navbar from "@/components/layout/Navbar";

const signals = [
  {
    label: "Inflation",
    value: "6.5%",
    period: "Kenya · July 2026",
  },
  {
    label: "Food inflation",
    value: "9.0%",
    period: "Kenya · July 2026",
  },
  {
    label: "Transport",
    value: "15.6%",
    period: "Kenya · July 2026",
  },
];

const capabilities = [
  {
    icon: Search,
    title: "Ask questions",
    description:
      "Ask ECONIQ questions about economies, indicators, markets and economic reports.",
  },
  {
    icon: Database,
    title: "Evidence-backed",
    description:
      "Answers are grounded in retrieved economic documents rather than unsupported guesses.",
  },
  {
    icon: LineChart,
    title: "Understand trends",
    description:
      "Move from individual observations to historical economic patterns and longitudinal trends.",
  },
  {
    icon: TrendingUp,
    title: "Look ahead",
    description:
      "ECONIQ is being built to combine historical data with predictive economic intelligence.",
  },
];

const dataSources = [
  "KNBS",
  "Central Bank of Kenya",
  "World Bank",
  "African economic datasets",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
        <Navbar />

        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="mx-auto max-w-5xl pb-28 pt-24 sm:pt-32">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
              filter: "blur(8px)",
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="max-w-4xl"
          >
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/30">
              <Sparkles size={13} />
              Economic intelligence for Africa
            </div>

            <h1 className="mt-7 text-5xl font-medium leading-[0.94] tracking-[-0.06em] sm:text-7xl lg:text-8xl">
              Understand
              <br />
              <span className="text-white/30">
                what moves Africa.
              </span>
            </h1>

            <p className="mt-8 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              ECONIQ brings economic data, research,
              reports and predictive intelligence into one
              place — starting with Kenya and expanding
              across Africa.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/explore"
                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-black
                  transition
                  duration-300
                  hover:bg-white/90
                "
              >
                Explore ECONIQ

                <ArrowRight
                  size={15}
                  className="transition group-hover:translate-x-0.5"
                />
              </Link>

              <Link
                href="/analytics"
                className="
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  border
                  border-white/10
                  bg-white/[0.025]
                  px-5
                  py-3
                  text-sm
                  text-white/50
                  transition
                  duration-300
                  hover:border-white/20
                  hover:bg-white/[0.05]
                  hover:text-white
                "
              >
                View analytics
              </Link>
            </div>
          </motion.div>
        </section>

        {/* ====================================================
            SIGNALS
        ==================================================== */}

        <section className="mx-auto max-w-5xl border-t border-white/[0.06] py-20">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Economic signals
              </p>

              <h2 className="mt-3 text-2xl font-medium tracking-tight">
                Kenya
              </h2>
            </div>

            <span className="hidden text-xs text-white/20 sm:block">
              July 2026
            </span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {signals.map((signal, index) => (
              <motion.div
                key={signal.label}
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.08,
                }}
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.02]
                  p-6
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-white/[0.14]
                  hover:bg-white/[0.035]
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/30">
                    {signal.label}
                  </span>

                  <BarChart3
                    size={15}
                    className="text-white/20"
                  />
                </div>

                <div className="mt-8 text-3xl font-medium tracking-tight">
                  {signal.value}
                </div>

                <p className="mt-2 text-xs text-white/20">
                  {signal.period}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ====================================================
            PRODUCT STORY
        ==================================================== */}

        <section className="mx-auto max-w-5xl border-t border-white/[0.06] py-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                One intelligence layer
              </p>

              <h2 className="mt-4 text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
                From raw economic data
                <br />
                <span className="text-white/30">
                  to useful intelligence.
                </span>
              </h2>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/35">
              Economic information is scattered across
              reports, databases, institutions and
              publications. ECONIQ is being built to bring
              these sources together so that people can
              understand what happened, why it happened
              and what could happen next.
            </p>
          </div>

          <div className="mt-16 grid gap-3 sm:grid-cols-2">
            {capabilities.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    amount: 0.2,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.06,
                  }}
                  className="
                    rounded-2xl
                    border
                    border-white/[0.07]
                    bg-white/[0.02]
                    p-6
                  "
                >
                  <Icon
                    size={17}
                    className="text-white/30"
                  />

                  <h3 className="mt-7 text-lg font-medium">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/30">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            EVIDENCE
        ==================================================== */}

        <section className="mx-auto max-w-5xl border-t border-white/[0.06] py-24">
          <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  size={16}
                  className="text-white/30"
                />

                <span className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                  Built around evidence
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-medium tracking-[-0.04em]">
                Don't just get an answer.
                <br />
                <span className="text-white/30">
                  See where it came from.
                </span>
              </h2>
            </div>

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-7">
              <div className="flex items-center gap-3">
                <FileText
                  size={17}
                  className="text-white/30"
                />

                <span className="text-sm text-white/50">
                  Evidence-backed intelligence
                </span>
              </div>

              <p className="mt-6 text-sm leading-7 text-white/35">
                ECONIQ retrieves relevant sections from
                economic documents before generating an
                answer. Retrieved evidence can be traced
                back to the source document and page.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {dataSources.map((source) => (
                  <span
                    key={source}
                    className="
                      rounded-full
                      border
                      border-white/[0.07]
                      bg-white/[0.02]
                      px-3
                      py-1.5
                      text-[10px]
                      uppercase
                      tracking-[0.12em]
                      text-white/25
                    "
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            LONGITUDINAL DATA
        ==================================================== */}

        <section className="mx-auto max-w-5xl border-t border-white/[0.06] py-24">
          <div className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-8 sm:p-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
              <Globe2
                size={17}
                className="text-white/35"
              />
            </div>

            <h2 className="mt-8 max-w-2xl text-3xl font-medium leading-tight tracking-[-0.04em] sm:text-4xl">
              Africa's economic story
              <br />
              <span className="text-white/30">
                needs a timeline.
              </span>
            </h2>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/35">
              ECONIQ is evolving from individual economic
              observations into longitudinal datasets that
              allow us to study how inflation, growth,
              employment, exchange rates and other
              indicators change across time.
            </p>

            <Link
              href="/analytics"
              className="
                group
                mt-8
                inline-flex
                items-center
                gap-2
                text-xs
                text-white/40
                transition
                hover:text-white
              "
            >
              Explore economic data

              <ArrowRight
                size={13}
                className="transition group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </section>

        {/* ====================================================
            FINAL CTA
        ==================================================== */}

        <section className="mx-auto max-w-5xl border-t border-white/[0.06] py-28 text-center">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
            Economic intelligence for Africa
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-medium tracking-[-0.05em] sm:text-6xl">
            Start with a question.
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/30">
            Explore reports, retrieve evidence and begin
            understanding the forces shaping Kenya's
            economy.
          </p>

          <Link
            href="/explore"
            className="
              group
              mt-8
              inline-flex
              items-center
              gap-3
              rounded-xl
              bg-white
              px-5
              py-3
              text-sm
              font-medium
              text-black
              transition
              hover:bg-white/90
            "
          >
            Open ECONIQ

            <ArrowRight
              size={15}
              className="transition group-hover:translate-x-0.5"
            />
          </Link>
        </section>

        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="mx-auto flex max-w-5xl flex-col gap-3 border-t border-white/[0.06] py-8 text-xs text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <span>ECONIQ</span>

          <span>
            Economic Intelligence for Africa
          </span>
        </footer>
      </div>
    </main>
  );
}