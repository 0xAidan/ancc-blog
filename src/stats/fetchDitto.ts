import type { DittoStats } from "./types";
import { fetchJson } from "./fetchUtils";

type HealthResponse = { status: string; timestamp?: string };

type PublicStatsResponse = {
  success: boolean;
  agents: number;
  walletsScored: number | null;
  tierCounts: {
    alpha: number | null;
    whale: number | null;
    specialist: number | null;
  };
  lastUpdated: string | null;
  discoveryV3: boolean;
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

  try {
    const stats = await fetchJson<PublicStatsResponse>("https://ditto.jungle.win/api/public/stats");
    latencyMs = Math.max(latencyMs ?? 0, stats.latencyMs);
    const data = stats.data;
    const missingWallets = data.discoveryV3 && data.walletsScored === null;

    return {
      status: healthOk ? (missingWallets ? "degraded" : "up") : "down",
      latencyMs,
      agents: data.agents,
      walletsScored: data.walletsScored,
      tierAlpha: data.tierCounts.alpha,
      tierWhale: data.tierCounts.whale,
      tierSpecialist: data.tierCounts.specialist,
      lastUpdated: data.lastUpdated,
    };
  } catch {
    return {
      status: healthOk ? "degraded" : "down",
      latencyMs,
      agents: null,
      walletsScored: null,
      tierAlpha: null,
      tierWhale: null,
      tierSpecialist: null,
      lastUpdated: null,
    };
  }
};
