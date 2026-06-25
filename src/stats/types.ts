export type HealthStatus = "up" | "down" | "degraded";

export type DittoStats = {
  status: HealthStatus;
  latencyMs: number | null;
  agents: number | null;
  walletsScored: number | null;
  tierAlpha: number | null;
  tierWhale: number | null;
  tierSpecialist: number | null;
  lastUpdated: string | null;
};

export type GolfStats = {
  status: HealthStatus;
  latencyMs: number | null;
  winRate: number | null;
  picksGraded: number | null;
  totalProfit: number | null;
  latestEvent: string | null;
  modelName: string | null;
};

export type StatsSnapshot = {
  fetchedAt: number;
  ditto: DittoStats;
  golf: GolfStats;
};

export type HistoryPoint = {
  ts: number;
  dittoWallets: number | null;
  golfWinRate: number | null;
};
