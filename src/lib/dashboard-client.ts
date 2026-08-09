import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ScatterController,
  LineController,
  Tooltip,
  Filler,
  type ChartConfiguration,
} from "chart.js";
import { STAT_PANELS, CHART_PANELS, type StatPanel } from "../config/panels";
import { getDashboardSnapshot } from "./sources/cache";
import { baseChartOptions, chartColors } from "./chart-theme";
import { getByPath } from "./sources/fetchUtils";
import type { DashboardSnapshot } from "./sources/types";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ScatterController,
  LineController,
  Tooltip,
  Filler,
);

const charts = new Map<string, Chart>();

const formatStat = (panel: StatPanel, value: unknown): string => {
  if (value == null) return "—";
  if (panel.format === "text") return String(value);
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  if (panel.format === "integer") return Math.round(value).toLocaleString();
  if (panel.format === "percent") {
    const n = Number(value);
    return `${n > 0 ? "+" : ""}${n.toFixed(1)}${panel.unit ?? "%"}`;
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const resolveStatValue = (snapshot: DashboardSnapshot, panel: StatPanel): unknown => {
  switch (panel.source) {
    case "golf.clv":
      return getByPath(snapshot.golf.clv, panel.metric);
    case "golf.latestEvent":
      return getByPath(snapshot.golf.latestEvent, panel.metric);
    case "golf.health":
      return getByPath(snapshot.golf.health, panel.metric);
    case "ditto.stats":
      return getByPath(snapshot.ditto, panel.metric);
    case "golf.calibration":
      return null;
    default: {
      const _exhaustive: never = panel.source;
      return _exhaustive;
    }
  }
};

const setUnavailable = (el: HTMLElement, unavailable: boolean): void => {
  el.dataset.state = unavailable ? "unavailable" : "ready";
  const badge = el.querySelector<HTMLElement>("[data-unavailable]");
  if (badge) badge.hidden = !unavailable;
};

const updateStats = (snapshot: DashboardSnapshot): void => {
  for (const panel of STAT_PANELS) {
    const el = document.querySelector<HTMLElement>(`[data-stat="${panel.id}"]`);
    if (!el) continue;
    const valueEl = el.querySelector<HTMLElement>("[data-stat-value]");
    if (!valueEl) continue;

    const value = resolveStatValue(snapshot, panel);
    const unavailable = value == null;
    valueEl.textContent = formatStat(panel, value);
    setUnavailable(el, unavailable);
    el.classList.remove("skeleton");
  }

  const golfDot = document.querySelector<HTMLElement>("[data-project-status='golf']");
  const dittoDot = document.querySelector<HTMLElement>("[data-project-status='ditto']");
  if (golfDot) golfDot.dataset.status = snapshot.golf.status;
  if (dittoDot) dittoDot.dataset.status = snapshot.ditto.status;

  const updated = document.querySelector<HTMLElement>("[data-dashboard-updated]");
  if (updated) {
    updated.textContent = `Updated ${new Date(snapshot.fetchedAt).toLocaleTimeString()}`;
  }
};

const ensureBarChart = (canvas: HTMLCanvasElement, snapshot: DashboardSnapshot): void => {
  const books = snapshot.golf.clv?.by_book ?? [];
  const top = [...books]
    .filter((b) => b.market_book)
    .sort((a, b) => Math.abs(b.avg_clv_pct) - Math.abs(a.avg_clv_pct))
    .slice(0, 10);

  const labels = top.map((b) => b.market_book);
  const values = top.map((b) => b.avg_clv_pct);
  const colors = values.map((v) => (v >= 0 ? chartColors.success : chartColors.danger));

  const existing = charts.get(canvas.id);
  if (existing) {
    existing.data.labels = labels;
    existing.data.datasets[0].data = values;
    if (existing.data.datasets[0].backgroundColor) {
      existing.data.datasets[0].backgroundColor = colors;
    }
    existing.update();
    return;
  }

  const config = {
    type: "bar" as const,
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderRadius: 4,
          maxBarThickness: 28,
        },
      ],
    },
    options: {
      ...baseChartOptions(),
      indexAxis: "y" as const,
      plugins: {
        ...baseChartOptions().plugins,
        tooltip: {
          ...baseChartOptions().plugins?.tooltip,
          callbacks: {
            label: (ctx: { raw: unknown }) => `${Number(ctx.raw).toFixed(1)}% CLV`,
          },
        },
      },
    },
  } satisfies ChartConfiguration;

  charts.set(canvas.id, new Chart(canvas, config));
};

const ensureScatterChart = (canvas: HTMLCanvasElement, snapshot: DashboardSnapshot): void => {
  const buckets = snapshot.golf.calibration?.calibration ?? [];
  const points = buckets.map((b) => ({
    x: b.predicted_avg * 100,
    y: b.actual_rate * 100,
    r: Math.max(4, Math.sqrt(b.count)),
  }));

  const existing = charts.get(canvas.id);
  if (existing) {
    existing.data.datasets[0].data = points;
    existing.update();
    return;
  }

  const config = {
    type: "scatter" as const,
    data: {
      datasets: [
        {
          label: "Buckets",
          data: points,
          backgroundColor: chartColors.accentSoft,
          borderColor: chartColors.cyan,
          borderWidth: 1.5,
          pointRadius: points.map((p) => Math.min(14, p.r)),
        },
        {
          type: "line" as const,
          label: "Perfect",
          data: [
            { x: 0, y: 0 },
            { x: 100, y: 100 },
          ],
          borderColor: chartColors.violet,
          borderDash: [6, 4],
          borderWidth: 1,
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      ...baseChartOptions(),
      scales: {
        x: {
          ...baseChartOptions().scales?.x,
          title: {
            display: true,
            text: "Predicted %",
            color: chartColors.textMuted,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
          },
          min: 0,
          max: 100,
        },
        y: {
          ...baseChartOptions().scales?.y,
          title: {
            display: true,
            text: "Actual %",
            color: chartColors.textMuted,
            font: { family: "'JetBrains Mono', monospace", size: 10 },
          },
          min: 0,
          max: 100,
        },
      },
    },
  } satisfies ChartConfiguration;

  charts.set(canvas.id, new Chart(canvas, config));
};

const updateCharts = (snapshot: DashboardSnapshot): void => {
  for (const panel of CHART_PANELS) {
    const wrap = document.querySelector<HTMLElement>(`[data-chart="${panel.id}"]`);
    const canvas = wrap?.querySelector<HTMLCanvasElement>("canvas");
    if (!wrap || !canvas) continue;

    const ready =
      panel.series === "clv-by-book"
        ? Boolean(snapshot.golf.clv?.by_book?.length)
        : Boolean(snapshot.golf.calibration?.calibration?.length);

    setUnavailable(wrap, !ready);
    wrap.classList.remove("skeleton");
    if (!ready) continue;

    if (panel.series === "clv-by-book") ensureBarChart(canvas, snapshot);
    else ensureScatterChart(canvas, snapshot);
  }
};

const applySnapshot = (snapshot: DashboardSnapshot): void => {
  updateStats(snapshot);
  updateCharts(snapshot);
};

const observeCharts = (): void => {
  const nodes = document.querySelectorAll<HTMLElement>("[data-chart]");
  if (!("IntersectionObserver" in window)) {
    void refresh(true);
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        void refresh(false);
      }
    },
    { rootMargin: "120px" },
  );

  nodes.forEach((n) => io.observe(n));
};

const refresh = async (force: boolean): Promise<void> => {
  try {
    const snapshot = await getDashboardSnapshot(force);
    applySnapshot(snapshot);
  } catch {
    /* keep last good state */
  }
};

export const mountDashboard = (): void => {
  void refresh(true);
  observeCharts();

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const start = (): void => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (document.visibilityState === "visible") void refresh(false);
    }, 60_000);
  };

  const stop = (): void => {
    if (!intervalId) return;
    clearInterval(intervalId);
    intervalId = null;
  };

  start();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void refresh(true);
      start();
    } else {
      stop();
    }
  });
};
