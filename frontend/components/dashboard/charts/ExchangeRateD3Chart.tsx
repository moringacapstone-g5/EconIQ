"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getHistoricalAnalytics } from "@/lib/api";

type ExchangePoint = {
  date: Date;
  value: number;
};

export default function ExchangeRateD3Chart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [data, setData] = useState<ExchangePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const response = await getHistoricalAnalytics({
          country: "KE",
          indicator: "EXCHANGE_RATE",
        });

        if (cancelled) return;

        const points = response.observations
          .map((item) => ({
            date: new Date(item.date),
            value: Number(item.value),
          }))
          .filter(
            (item) =>
              !Number.isNaN(item.date.getTime()) &&
              Number.isFinite(item.value),
          )
          .sort((a, b) => a.date.getTime() - b.date.getTime());

        setData(points);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load exchange-rate data.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || data.length < 2) return;

    const container = containerRef.current;

    d3.select(container).selectAll("svg").remove();
    d3.select(container).selectAll(".exchange-tooltip").remove();

    const width = container.clientWidth;
    const height = 320;

    const margin = {
      top: 20,
      right: 20,
      bottom: 42,
      left: 58,
    };

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    if (innerWidth <= 0 || innerHeight <= 0) return;

    const svg = d3
      .select(container)
      .append("svg")
      .attr("width", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("role", "img")
      .attr("aria-label", "Kenya shilling to US dollar exchange rate");

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${margin.top})`,
      );

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, innerWidth]);

    const minValue = d3.min(data, (d) => d.value) ?? 0;
    const maxValue = d3.max(data, (d) => d.value) ?? 0;
    const padding = Math.max((maxValue - minValue) * 0.12, 1);

    const y = d3
      .scaleLinear()
      .domain([
        minValue - padding,
        maxValue + padding,
      ])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom<Date>(x)
      .ticks(Math.min(data.length, 7))
      .tickFormat(
        d3.utcFormat("%Y") as (
          d: Date | d3.NumberValue,
        ) => string,
      );

    const yAxis = d3
      .axisLeft(y)
      .ticks(5)
      .tickFormat((value) => `${Number(value).toFixed(0)}`);

    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .call((selection) => {
        selection.select(".domain").attr("stroke", "currentColor");

        selection
          .selectAll(".tick line")
          .attr("stroke", "currentColor")
          .attr("opacity", 0.12);

        selection
          .selectAll(".tick text")
          .attr("fill", "currentColor")
          .attr("opacity", 0.45)
          .attr("font-size", "11px");
      });

    chart
      .append("g")
      .call(yAxis)
      .call((selection) => {
        selection.select(".domain").remove();

        selection
          .selectAll(".tick line")
          .attr("x2", innerWidth)
          .attr("stroke", "currentColor")
          .attr("opacity", 0.08);

        selection
          .selectAll(".tick text")
          .attr("fill", "currentColor")
          .attr("opacity", 0.45)
          .attr("font-size", "11px");
      });

    const area = d3
      .area<ExchangePoint>()
      .x((d) => x(d.date))
      .y0(innerHeight)
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    chart
      .append("path")
      .datum(data)
      .attr("fill", "currentColor")
      .attr("opacity", 0.05)
      .attr("d", area);

    const line = d3
      .line<ExchangePoint>()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    const linePath = chart
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "currentColor")
      .attr("stroke-width", 2)
      .attr("stroke-linecap", "round")
      .attr("d", line);

    const totalLength = linePath.node()?.getTotalLength() ?? 0;

    linePath
      .attr("stroke-dasharray", totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1100)
      .ease(d3.easeCubicOut)
      .attr("stroke-dashoffset", 0);

    const latest = data[data.length - 1];

    chart
      .append("circle")
      .attr("cx", x(latest.date))
      .attr("cy", y(latest.value))
      .attr("r", 4)
      .attr("fill", "currentColor")
      .attr("opacity", 0.9);

    const tooltip = d3
      .select(container)
      .append("div")
      .attr(
        "class",
        "exchange-tooltip pointer-events-none absolute hidden rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-xs text-white shadow-xl",
      );

    const overlay = chart
      .append("rect")
      .attr("width", innerWidth)
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        const [mouseX] = d3.pointer(event);
        const date = x.invert(mouseX);

        const bisect = d3.bisector<ExchangePoint, Date>(
          (d) => d.date,
        ).center;

        const index = bisect(data, date);
        const point = data[Math.min(index, data.length - 1)];

        const tooltipX =
          margin.left + x(point.date);

        const tooltipY =
          margin.top + y(point.value);

        tooltip
          .style("display", "block")
          .style("left", `${tooltipX + 12}px`)
          .style("top", `${tooltipY - 42}px`)
          .html(
            `<div class="font-medium">${d3.utcFormat("%Y")(point.date)}</div>
             <div class="mt-1 text-white/50">KES / USD · ${point.value.toFixed(2)}</div>`,
          );
      })
      .on("mouseleave", function () {
        tooltip.style("display", "none");
      });

    return () => {
      overlay
        .on("mousemove", null)
        .on("mouseleave", null);

      d3.select(container).selectAll("svg").remove();
      d3.select(container)
        .selectAll(".exchange-tooltip")
        .remove();
    };
  }, [data]);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      if (data.length > 1) {
        setData((current) => [...current]);
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [data.length]);

  if (loading) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-white/35">
        Loading exchange-rate history...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-red-300/70">
        {error}
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="flex h-[320px] items-center justify-center text-sm text-white/35">
        Not enough exchange-rate data available.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full" />
  );
}
