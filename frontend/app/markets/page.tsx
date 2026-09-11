"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Globe2,
  TrendingUp,
} from "lucide-react";

import { motion } from "motion/react";

import Navbar from "@/components/layout/Navbar";

const marketOverview = [
  {
    name: "NSE 20",
    value: "—",
    change: "Awaiting data",
    direction: "neutral",
  },
  {
    name: "USD / KES",
    value: "—",
    change: "Awaiting data",
    direction: "neutral",
  },
  {
    name: "EUR / KES",
    value: "—",
    change: "Awaiting data",
    direction: "neutral",
  },
  {
    name: "CBK Rate",
    value: "—",
    change: "Awaiting data",
    direction: "neutral",
  },
];

const companies = [
  {
    name: "Safaricom",
    ticker: "SCOM",
    price: "—",
    change: "—",
  },
  {
    name: "Equity Group",
    ticker: "EQTY",
    price: "—",
    change: "—",
  },
  {
    name: "KCB Group",
    ticker: "KCB",
    price: "—",
    change: "—",
  },
  {
    name: "EABL",
    ticker: "EABL",
    price: "—",
    change: "—",
  },
  {
    name: "Co-operative Bank",
    ticker: "COOP",
    price: "—",
    change: "—",
  },
  {
    name: "Kenya Re",
    ticker: "KNRE",
    price: "—",
    change: "—",
  },
];

export default function MarketsPage() {
  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <div className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10">

        <Navbar />

        {/* Hero */}

        <motion.section
          initial={{
            opacity: 0,
            y: 24,
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
          className="py-20"
        >
          <div className="flex items-center gap-2 text-white/30">
            <Globe2 size={15} />

            <span className="text-[10px] uppercase tracking-[0.2em]">
              African markets
            </span>
          </div>

          <h1 className="mt-5 max-w-4xl text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-7xl">
            Markets,
            <br />

            <span className="text-white/30">
              without the noise.
            </span>
          </h1>

          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
            Track African equities, foreign exchange,
            interest rates and market signals from one
            intelligence layer.
          </p>
        </motion.section>

        {/* Market overview */}

        <section>
          <motion.div
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
              duration: 0.6,
            }}
            className="mb-5 flex items-end justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Market overview
              </p>

              <h2 className="mt-2 text-xl font-medium">
                Kenya
              </h2>
            </div>

            <span className="text-xs text-white/20">
              Live data layer
            </span>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {marketOverview.map((market, index) => (
              <motion.div
                key={market.name}
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
                  delay: index * 0.07,
                }}
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  p-5
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:border-white/15
                  hover:bg-white/[0.045]
                "
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/35">
                    {market.name}
                  </span>

                  <BarChart3
                    size={15}
                    className="text-white/20"
                  />
                </div>

                <div className="mt-7 text-3xl font-medium tracking-tight">
                  {market.value}
                </div>

                <div className="mt-2 text-xs text-white/20">
                  {market.change}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Main market intelligence */}

        <section className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* Chart */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
            }}
            className="
              lg:col-span-2
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-6
            "
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={15}
                    className="text-white/35"
                  />

                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">
                    Market movement
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-medium">
                  NSE market performance
                </h2>
              </div>

              <span className="text-xs text-white/20">
                Coming soon
              </span>
            </div>

            <div
              className="
                mt-8
                flex
                h-80
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-white/[0.08]
              "
            >
              <div className="text-center">
                <BarChart3
                  size={22}
                  className="mx-auto text-white/20"
                />

                <p className="mt-4 text-sm text-white/40">
                  Market chart coming next
                </p>

                <p className="mt-2 max-w-sm text-xs leading-5 text-white/20">
                  ECONIQ will connect market data,
                  historical prices and economic signals
                  here.
                </p>
              </div>
            </div>
          </motion.div>

          {/* FX */}

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              amount: 0.15,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="
              rounded-2xl
              border
              border-white/[0.07]
              bg-white/[0.025]
              p-6
            "
          >
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/25">
              Foreign exchange
            </p>

            <h2 className="mt-3 text-lg font-medium">
              FX monitor
            </h2>

            <div className="mt-8 space-y-4">
              {[
                ["USD / KES", "—"],
                ["EUR / KES", "—"],
                ["GBP / KES", "—"],
                ["USD / UGX", "—"],
                ["USD / TZS", "—"],
              ].map(([pair, value]) => (
                <div
                  key={pair}
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-white/[0.06]
                    pb-4
                  "
                >
                  <span className="text-sm text-white/50">
                    {pair}
                  </span>

                  <span className="text-sm">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 text-xs leading-5 text-white/20">
              Real-time FX integration will be connected
              to the market data layer.
            </p>
          </motion.div>

        </section>

        {/* NSE companies */}

        <section className="mt-16 pb-20">

          <motion.div
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
              duration: 0.6,
            }}
            className="mb-5 flex items-end justify-between"
          >
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">
                Equities
              </p>

              <h2 className="mt-2 text-xl font-medium">
                NSE companies
              </h2>
            </div>

            <span className="text-xs text-white/20">
              Nairobi Securities Exchange
            </span>
          </motion.div>

          <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
            {companies.map((company, index) => (
              <motion.div
                key={company.ticker}
                initial={{
                  opacity: 0,
                  x: -15,
                }}
                whileInView={{
                  opacity: 1,
                  x: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.05,
                }}
                className="
                  group
                  flex
                  items-center
                  justify-between
                  border-b
                  border-white/[0.06]
                  px-5
                  py-5
                  last:border-b-0
                  transition
                  hover:bg-white/[0.035]
                "
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03]">
                    <span className="text-[10px] font-medium text-white/40">
                      {company.ticker.slice(0, 2)}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-medium">
                      {company.name}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-white/20">
                      {company.ticker}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <span className="text-sm text-white/40">
                    {company.price}
                  </span>

                  <span className="hidden text-xs text-white/25 sm:block">
                    {company.change}
                  </span>

                  <ArrowUpRight
                    size={15}
                    className="
                      text-white/15
                      transition
                      group-hover:translate-x-0.5
                      group-hover:-translate-y-0.5
                      group-hover:text-white/50
                    "
                  />
                </div>
              </motion.div>
            ))}
          </div>

        </section>

      </div>
    </main>
  );
}