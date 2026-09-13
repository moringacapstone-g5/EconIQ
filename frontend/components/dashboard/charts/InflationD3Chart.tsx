"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  getHistoricalAnalytics,
  getInflationForecast,
  type InflationForecast,
} from "@/lib/api";

interface InflationPoint {
  date: Date;
  value: number;
}

export default function InflationD3Chart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [data, setData] = useState<InflationPoint[]>([]);
  const [forecast, setForecast] = useState<InflationForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        const [history, forecastData] = await Promise.all([
          getHistoricalAnalytics({
            country: "KE",
            indicator: "INFLATION",
          }),
          getInflationForecast(),
        ]);

        const parsed = history.observations
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

        setData(parsed);
        setForecast(forecastData);
      } catch (err) {
        console.error("Inflation D3 chart error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load inflation history.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length < 2) {
      return;
    }

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);

    function render() {
      const width = container.clientWidth;

      if (!width) {
        return;
      }

      const height = 360;

      const margin = {
        top: 24,
        right: 24,
        bottom: 44,
        left: 52,
      };

      const innerWidth =
        width - margin.left - margin.right;

      const innerHeight =
        height - margin.top - margin.bottom;

      svg.selectAll("*").remove();

      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "none")
        .attr("width", width)
        .attr("height", height);

      const chart = svg
        .append("g")
        .attr(
          "transform",
          `translate(${margin.left},${margin.top})`,
        );

      const forecastDate =
        forecast?.latest_data_date
          ? d3.utcMonth.offset(
              new Date(forecast.latest_data_date),
              1,
            )
          : null;

      const allDates = forecastDate
        ? [...data.map((d) => d.date), forecastDate]
        : data.map((d) => d.date);

      const allValues = forecast
        ? [
            ...data.map((d) => d.value),
            forecast.forecast_inflation,
          ]
        : data.map((d) => d.value);

      const x = d3
        .scaleTime()
        .domain(d3.extent(allDates) as [Date, Date])
        .range([0, innerWidth]);

      const valueExtent = d3.extent(allValues) as [
        number,
        number,
      ];

      const padding = Math.max(
        0.5,
        (valueExtent[1] - valueExtent[0]) * 0.18,
      );

      const y = d3
        .scaleLinear()
        .domain([
          Math.max(0, valueExtent[0] - padding),
          valueExtent[1] + padding,
        ])
        .nice()
        .range([innerHeight, 0]);

      const defs = svg.append("defs");

      const gradient = defs
        .append("linearGradient")
        .attr("id", "inflation-area-gradient")
        .attr("x1", "0")
        .attr("x2", "0")
        .attr("y1", "0")
        .attr("y2", "1");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "currentColor")
        .attr("stop-opacity", 0.14);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "currentColor")
        .attr("stop-opacity", 0);

      const yGrid = d3
        .axisLeft(y)
        .ticks(5)
        .tickSize(-innerWidth)
        .tickFormat(() => "");

      chart
        .append("g")
        .attr("class", "inflation-grid")
        .call(yGrid)
        .call((selection) => {
          selection
            .selectAll("line")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.07);

          selection
            .select(".domain")
            .remove();
        });

      const xAxis = d3
        .axisBottom(x)
        .ticks(width < 600 ? 5 : 8)
        .tickFormat((date) => d3.utcFormat("%b %y")(date as Date));

      chart
        .append("g")
        .attr(
          "transform",
          `translate(0,${innerHeight})`,
        )
        .call(xAxis)
        .call((selection) => {
          selection
            .select(".domain")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.12);

          selection
            .selectAll("line")
            .attr("stroke", "currentColor")
            .attr("stroke-opacity", 0.12);

          selection
            .selectAll("text")
            .attr("fill", "currentColor")
            .attr("opacity", 0.4)
            .attr("font-size", "11px");
        });

      const yAxis = d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat((value) => `${value}%`);

      chart
        .append("g")
        .call(yAxis)
        .call((selection) => {
          selection
            .select(".domain")
            .remove();

          selection
            .selectAll("line")
            .remove();

          selection
            .selectAll("text")
            .attr("fill", "currentColor")
            .attr("opacity", 0.4)
            .attr("font-size", "11px");
        });

      const line = d3
        .line<InflationPoint>()
        .x((d) => x(d.date))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      const area = d3
        .area<InflationPoint>()
        .x((d) => x(d.date))
        .y0(innerHeight)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

      chart
        .append("path")
        .datum(data)
        .attr("fill", "url(#inflation-area-gradient)")
        .attr("d", area);

      const linePath = chart
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 2)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin", "round")
        .attr("d", line);

      const totalLength =
        linePath.node()?.getTotalLength() ?? 0;

      linePath
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

      const latest = data[data.length - 1];

      chart
        .append("circle")
        .attr("cx", x(latest.date))
        .attr("cy", y(latest.value))
        .attr("r", 4)
        .attr("fill", "currentColor");

      chart
        .append("circle")
        .attr("cx", x(latest.date))
        .attr("cy", y(latest.value))
        .attr("r", 8)
        .attr("fill", "none")
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.18);

      chart
        .append("text")
        .attr("x", x(latest.date))
        .attr("y", y(latest.value) - 14)
        .attr("text-anchor", "middle")
        .attr("fill", "currentColor")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("opacity", 0.65)
        .text(`${latest.value.toFixed(2)}%`);

      if (forecast && forecastDate) {
        const forecastPoint = {
          date: forecastDate,
          value: forecast.forecast_inflation,
        };

        const forecastLine = d3
          .line<InflationPoint>()
          .x((d) => x(d.date))
          .y((d) => y(d.value))
          .curve(d3.curveMonotoneX);

        chart
          .append("path")
          .datum([latest, forecastPoint])
          .attr("fill", "none")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.35)
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "5 5")
          .attr("d", forecastLine);

        chart
          .append("circle")
          .attr("cx", x(forecastPoint.date))
          .attr("cy", y(forecastPoint.value))
          .attr("r", 4)
          .attr("fill", "none")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.55);

        chart
          .append("text")
          .attr("x", x(forecastPoint.date))
          .attr("y", y(forecastPoint.value) - 14)
          .attr("text-anchor", "middle")
          .attr("fill", "currentColor")
          .attr("font-size", "11px")
          .attr("opacity", 0.45)
          .text(`${forecastPoint.value.toFixed(2)}%`);
      }

      const tooltip = d3
        .select(container)
        .select<HTMLDivElement>(".d3-tooltip");

      const overlay = chart
        .append("rect")
        .attr("width", innerWidth)
        .attr("height", innerHeight)
        .attr("fill", "transparent")
        .style("cursor", "crosshair");

      const hoverLine = chart
        .append("line")
        .attr("y1", 0)
        .attr("y2", innerHeight)
        .attr("stroke", "currentColor")
        .attr("stroke-opacity", 0.18)
        .attr("stroke-dasharray", "3 3")
        .style("display", "none");

      const hoverPoint = chart
        .append("circle")
        .attr("r", 4)
        .attr("fill", "currentColor")
        .style("display", "none");

      overlay
        .on("mouseenter", () => {
          hoverLine.style("display", null);
          hoverPoint.style("display", null);
          tooltip.style("opacity", "1");
        })
        .on("mousemove", (event) => {
          const [mouseX] = d3.pointer(event);
          const date = x.invert(mouseX);

          const bisect = d3.bisector<InflationPoint, Date>(
            (d) => d.date,
          ).center;

          const index = bisect(data, date);
          const point = data[
            Math.max(0, Math.min(data.length - 1, index))
          ];

          const pointX = x(point.date);
          const pointY = y(point.value);

          hoverLine
            .attr("x1", pointX)
            .attr("x2", pointX);

          hoverPoint
            .attr("cx", pointX)
            .attr("cy", pointY);

          const containerRect =
            container.getBoundingClientRect();

          const tooltipWidth = 150;

          let tooltipX =
            margin.left + pointX + 12;

          if (
            tooltipX + tooltipWidth >
            containerRect.width
          ) {
            tooltipX =
              margin.left + pointX - tooltipWidth - 12;
          }

          const tooltipY =
            margin.top + pointY - 55;

          tooltip
            .style("left", `${tooltipX}px`)
            .style("top", `${Math.max(4, tooltipY)}px`)
            .html(
              `<div style="font-size:11px;opacity:.5">${d3.utcFormat(
                "%B %Y",
              )(point.date)}</div>
               <div style="margin-top:4px;font-size:16px;font-weight:600">${point.value.toFixed(
                 2,
               )}%</div>`,
            );
        })
        .on("mouseleave", () => {
          hoverLine.style("display", "none");
          hoverPoint.style("display", "none");
          tooltip.style("opacity", "0");
        });
    }

    render();

    const resizeObserver = new ResizeObserver(() => {
      render();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      svg.selectAll("*").remove();
    };
  }, [data, forecast]);

  if (loading) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/5 p-6 text-center">
        <div>
          <p className="text-sm font-medium text-red-300">
            Unable to load inflation history
          </p>
          <p className="mt-2 text-sm text-white/40">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (data.length < 2) {
    return (
      <div className="flex h-[360px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.02]">
        <p className="text-sm text-white/40">
          Not enough inflation data to render the chart.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full text-white/80"
    >
      <svg
        ref={svgRef}
        className="block h-[360px] w-full overflow-visible"
      />

      <div
        className="d3-tooltip pointer-events-none absolute z-10 rounded-lg border border-white/10 bg-black/90 px-3 py-2 text-white shadow-xl"
        style={{
          opacity: 0,
          transition: "opacity 120ms ease",
        }}
      />
    </div>
  );
}
