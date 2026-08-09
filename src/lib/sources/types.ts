export type HealthStatus = "up" | "down" | "degraded";

export type ClvByBook = {
  market_book: string;
  n_bets: number;
  avg_clv_pct: number;
  significant: boolean;
};

export type ClvSummary = {
  overall: {
    n_bets: number;
    avg_clv_pct: number;
    significant: boolean;
  };
  by_book: ClvByBook[];
};

export type CalibrationBucket = {
  bucket: string;
  count: number;
  predicted_avg: number;
  actual_rate: number;
  gap: number;
};

export type CalibrationResponse = {
  total_predictions: number;
  calibration: CalibrationBucket[];
};

export type LatestEvent = {
  event_id: string;
  event_name: string;
  year: number;
};

export type GolfHealth = {
  ok: boolean;
  summary: string;
};

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

export type DashboardSnapshot = {
  fetchedAt: number;
  golf: {
    clv: ClvSummary | null;
    calibration: CalibrationResponse | null;
    latestEvent: LatestEvent | null;
    health: GolfHealth | null;
    status: HealthStatus;
  };
  ditto: DittoStats;
};
