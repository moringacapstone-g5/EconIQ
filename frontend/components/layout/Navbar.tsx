"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Activity } from "lucide-react";

const navigation = [
  { label: "Ask", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Analytics", href: "/analytics" },
  { label: "Forecasts", href: "/forecasts" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-4 z-50">
      <div className="flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#080b10]/80 px-3 py-2 backdrop-blur-xl">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-2 py-1.5"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05]">
            <span className="text-xs font-semibold">E</span>
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold tracking-[0.16em]">
              EconIQ
            </p>
            <p className="text-[9px] uppercase tracking-[0.14em] text-white/25">
              Economic Intelligence
            </p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {navigation.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-4 py-2 text-xs transition ${
                  active
                    ? "bg-white/[0.08] text-white"
                    : "text-white/40 hover:bg-white/[0.04] hover:text-white/80"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden rounded-lg border border-white/[0.07] bg-white/[0.025] p-2 text-white/35 transition hover:border-white/15 hover:text-white sm:block"
            aria-label="Search"
          >
            <Search size={14} />
          </button>

          <div className="flex items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="econiq-live absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] text-white/45">
              Kenya
            </span>

            <Activity size={11} className="text-white/25" />
          </div>
        </div>
      </div>
    </nav>
  );
}
