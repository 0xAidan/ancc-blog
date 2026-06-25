import type { DittoStats } from "./types";
import { fetchJson } from "./fetchUtils";

type HealthResponse = { status: string; timestamp?: string };

type JungleAgentsResponse = {
  success: boolean;
  agents?: unknown[];
};

type CutoverStatusResponse = {
  success: boolean;
  totalScoreRows?: number;
  tierCounts?: Record<string, number>;
};

type DiscoveryHealthResponse = {
  success: boolean;
  cursors?: Array<{ updated_at: number }>;
  coverage?: { score_updated_at?: number | null };
};

export const fetchDittoStats = async (): Promise<DittoStats> => {
  let latencyMs: number | null = null;
  let healthOk = false;

  try {
    const health = await fetchJson<HealthResponse>("https://ditto.jungle.win/health");
    latencyMs = health.latencyMs;
    healthOk = health.data.status === "ok";
  } catch {
    return {
      status: "down",
      latencyMs: null,
      agents: null,
      walletsScored: null,
      tierAlpha: null,
      tierWhale: null,
      tierSpecialist: null,
      lastUpdated: null,
    };
  }

  let agents: number | null = null;
  let walletsScored: number | null = null;
  let tierAlpha: number | null = null;
  let tierWhale: number | null = null;
  let tierSpecialist: number | null = null;
  let lastUpdated: string | null = null;
  let partial = false;

  const results = await Promise.allSettled([
    fetchJson<JungleAgentsResponse>("https://ditto.jungle.win/api/jungle-agents"),
    fetchJson<CutoverStatusResponse>("https://ditto.jungle.win/api/discovery/v3/cutover-status"),
    fetchJson<DiscoveryHealthResponse>("https://ditto.jungle.win/api/discovery/v3/health"),
  ]);

  if (results[0].status === "fulfilled") {
    agents = results[0].value.data.agents?.length ?? 0;
  } else {
    partial = true;
  }

  if (results[1].status === "fulfilled") {
    const d = results[1].value.data;
    walletsScored = d.totalScoreRows ?? null;
    tierAlpha = d.tierCounts?.alpha ?? null;
    tierWhale = d.tierCounts?.whale ?? null;
    tierSpecialist = d.tierCounts?.specialist ?? null;
  } else {
    partial = true;
  }

  if (results[2].status === "fulfilled") {
    const d = results[2].value.data;
    const ts =
      d.coverage?.score_updated_at ??
      d.cursors?.[0]?.updated_at ??
      null;
    if (ts) {
      lastUpdated = new Date(typeof ts === "number" && ts < 1e12 ? ts * 1000 : ts).toISOString();
    }
  } else {
    partial = true;
  }

  return {
    status: healthOk ? (partial ? "degraded" : "up") : "down",
    latencyMs,
    agents,
    walletsScored,
    tierAlpha,
    tierWhale,
    tierSpecialist,
    lastUpdated,
  };
};
