"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  {
    label: "Ask",
    href: "/",
  },
  {
    label: "Discover",
    href: "/explore",
  },
  {
    label: "Markets",
    href: "/markets",
  },
  {
    label: "Analytics",
    href: "/analytics",
  },
  {
    label: "Forecasts",
    href: "/forecasts",
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-between">
      {/* Brand */}

      <Link
        href="/"
        className="flex items-center gap-3"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
          <span className="text-sm font-semibold">
            E
          </span>
        </div>

        <span className="text-sm font-semibold tracking-[0.18em]">
          EconIQ
        </span>
      </Link>

      {/* Navigation */}

      <div className="hidden items-center gap-7 md:flex">
        {navigation.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/" &&
              pathname.startsWith(`${item.href}/`));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition ${
                active
                  ? "text-white"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Country */}

      <button
        type="button"
        className="
          rounded-full
          border
          border-white/10
          bg-white/[0.02]
          px-4
          py-2
          text-xs
          text-white/60
          transition
          hover:border-white/20
          hover:bg-white/[0.05]
          hover:text-white
        "
      >
        🇰🇪 Kenya
      </button>
    </nav>
  );
}