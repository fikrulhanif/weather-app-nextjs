/**
 * `HourlyChart` — Chart.js line chart with timestamp x-axis, temp + precip series.
 * Loaded via `next/dynamic` with `{ ssr: false }` because Chart.js touches `window`.
 */

"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import type { HourlyPoint } from "@/types/weather";
import { formatTime } from "@/utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export interface HourlyChartProps {
  readonly hourly: readonly HourlyPoint[];
}

export function HourlyChart({ hourly }: HourlyChartProps) {
  if (hourly.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-card/50 text-sm text-muted-foreground">
        Tidak ada data forecast per jam
      </div>
    );
  }

  const labels = hourly.map((point) => formatTime(point.timestamp));
  const tempData = hourly.map((point) => point.temperatureC);
  const precipData = hourly.map((point) => point.precipitationMm);

  const data = {
    labels,
    datasets: [
      {
        label: "Suhu (°C)",
        data: tempData,
        borderColor: "hsl(var(--primary))",
        backgroundColor: "hsl(var(--primary) / 0.1)",
        yAxisID: "y",
        tension: 0.3,
      },
      {
        label: "Curah Hujan (mm)",
        data: precipData,
        borderColor: "hsl(217 91% 60%)",
        backgroundColor: "hsl(217 91% 60% / 0.1)",
        yAxisID: "y1",
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "hsl(var(--foreground))",
          font: { size: 12 },
        },
      },
      tooltip: {
        backgroundColor: "hsl(var(--card))",
        titleColor: "hsl(var(--foreground))",
        bodyColor: "hsl(var(--foreground))",
        borderColor: "hsl(var(--border))",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "hsl(var(--muted-foreground))", font: { size: 11 } },
        grid: { color: "hsl(var(--border) / 0.3)" },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        ticks: { color: "hsl(var(--muted-foreground))", font: { size: 11 } },
        grid: { color: "hsl(var(--border) / 0.3)" },
        title: {
          display: true,
          text: "Suhu (°C)",
          color: "hsl(var(--foreground))",
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        ticks: { color: "hsl(var(--muted-foreground))", font: { size: 11 } },
        grid: { drawOnChartArea: false },
        title: {
          display: true,
          text: "Hujan (mm)",
          color: "hsl(var(--foreground))",
        },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Line data={data} options={options} />
    </div>
  );
}
