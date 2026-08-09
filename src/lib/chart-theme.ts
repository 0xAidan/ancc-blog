import type { ChartOptions } from "chart.js";

export const chartColors = {
  bg: "#0a0a0c",
  panel: "rgba(18, 18, 24, 0.72)",
  border: "rgba(110, 196, 232, 0.22)",
  grid: "rgba(255, 255, 255, 0.06)",
  text: "rgba(232, 236, 245, 0.72)",
  textMuted: "rgba(232, 236, 245, 0.45)",
  cyan: "#6ec4e8",
  violet: "#8b7cf8",
  accent: "#6ec4e8",
  accentSoft: "rgba(110, 196, 232, 0.25)",
  danger: "#f07178",
  success: "#7fd99a",
} as const;

export const baseChartOptions = (): ChartOptions => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 600,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: "rgba(12, 12, 16, 0.95)",
      titleColor: chartColors.text,
      bodyColor: chartColors.text,
      borderColor: chartColors.border,
      borderWidth: 1,
      padding: 10,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: { color: chartColors.grid },
      ticks: {
        color: chartColors.textMuted,
        font: { family: "'JetBrains Mono', monospace", size: 10 },
      },
      border: { color: chartColors.border },
    },
    y: {
      grid: { color: chartColors.grid },
      ticks: {
        color: chartColors.textMuted,
        font: { family: "'JetBrains Mono', monospace", size: 10 },
      },
      border: { color: chartColors.border },
    },
  },
});
