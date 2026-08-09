/**
 * Dashboard panel registry.
 * Add a panel = add one object here. Wire data in src/lib/sources/.
 */

export type PanelKind = "stat" | "bar" | "scatter";

export type PanelSourceId =
  | "golf.clv"
  | "golf.calibration"
  | "golf.latestEvent"
  | "golf.health"
  | "ditto.stats";

type PanelBase = {
  id: string;
  title: string;
  source: PanelSourceId;
  description?: string;
};

export type StatPanel = PanelBase & {
  kind: "stat";
  /** Dot-path or key handled by the dashboard client */
  metric: string;
  unit?: string;
  format?: "number" | "percent" | "integer" | "text";
};

export type BarPanel = PanelBase & {
  kind: "bar";
  /** Client knows how to map this source into labels + values */
  series: "clv-by-book";
};

export type ScatterPanel = PanelBase & {
  kind: "scatter";
  series: "calibration";
};

export type Panel = StatPanel | BarPanel | ScatterPanel;

export const PANELS: Panel[] = [
  {
    kind: "stat",
    id: "clv-avg",
    title: "Avg CLV",
    source: "golf.clv",
    metric: "overall.avg_clv_pct",
    unit: "%",
    format: "percent",
    description: "Average closing-line value across graded bets",
  },
  {
    kind: "stat",
    id: "clv-n",
    title: "Bets graded",
    source: "golf.clv",
    metric: "overall.n_bets",
    format: "integer",
  },
  {
    kind: "stat",
    id: "latest-event",
    title: "Latest event",
    source: "golf.latestEvent",
    metric: "event_name",
    format: "text",
  },
  {
    kind: "stat",
    id: "golf-health",
    title: "Golf API",
    source: "golf.health",
    metric: "summary",
    format: "text",
  },
  {
    kind: "stat",
    id: "ditto-agents",
    title: "Ditto agents",
    source: "ditto.stats",
    metric: "agents",
    format: "integer",
  },
  {
    kind: "stat",
    id: "ditto-wallets",
    title: "Wallets scored",
    source: "ditto.stats",
    metric: "walletsScored",
    format: "integer",
  },
  {
    kind: "bar",
    id: "clv-by-book",
    title: "CLV by sportsbook",
    source: "golf.clv",
    series: "clv-by-book",
    description: "Average CLV % by market book",
  },
  {
    kind: "scatter",
    id: "calibration",
    title: "Calibration",
    source: "golf.calibration",
    series: "calibration",
    description: "Predicted probability vs actual hit rate",
  },
];

export const STAT_PANELS = PANELS.filter((p): p is StatPanel => p.kind === "stat");
export const CHART_PANELS = PANELS.filter(
  (p): p is BarPanel | ScatterPanel => p.kind === "bar" || p.kind === "scatter",
);
