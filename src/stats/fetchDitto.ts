import type { DittoStats } from "./types";
import { fetchJson } from "./fetchUtils";

type HealthResponse = { status: string; timestamp?: string };

type LandingPreviewResponse = {
  success: boolean;
  meta?: { totalEnabled?: number };
};

type PublicStatsResponse = {
  success: boolean;
  agents?: number;
  walletsScored: number | null;
  tierCounts: {
    alpha: number | null;
    whale: number | null;
    specialist: number | null;
  };
  lastUpdated: string | null;
  discoveryV3: boolean;
};

const fetchPublicStats = async (): Promise<PublicStatsResponse | null> => {
  try {
    const result = await fetchJson<PublicStatsResponse>(
      "https://ditto.jungle.win/api/public/stats",
    );
    return result.data.success ? result.data : null;
  } catch {
    return null;
  }
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

  try {
    const preview = await fetchJson<LandingPreviewResponse>(
      "https://ditto.jungle.win/api/public/landing-preview",
    );
    latencyMs = Math.max(latencyMs ?? 0, preview.latencyMs);
    agents = preview.data.meta?.totalEnabled ?? null;
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

  const extended = await fetchPublicStats();
  if (extended) {
    if (extended.agents != null) {
      agents = extended.agents;
    }
    walletsScored = extended.walletsScored;
    tierAlpha = extended.tierCounts.alpha;
    tierWhale = extended.tierCounts.whale;
    tierSpecialist = extended.tierCounts.specialist;
    lastUpdated = extended.lastUpdated;
  }

  const missingWallets = extended?.discoveryV3 && walletsScored === null;
  const status = healthOk ? (agents === null ? "degraded" : missingWallets ? "degraded" : "up") : "down";

  return {
    status,
    latencyMs,
    agents,
    walletsScored,
    tierAlpha,
    tierWhale,
    tierSpecialist,
    lastUpdated,
  };
};
