import { fetchJson } from "./fetchUtils";
import type { DittoStats } from "./types";

/** Same-origin proxy (Caddy / Vite) — avoids browser CORS blocks. */
const DITTO_API_BASE = "/api/ditto";

type HealthResponse = { status: string };

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

export const fetchDittoStats = async (): Promise<DittoStats> => {
  let latencyMs: number | null = null;
  let healthOk = false;

  try {
    const health = await fetchJson<HealthResponse>(`${DITTO_API_BASE}/health`);
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
      `${DITTO_API_BASE}/api/public/landing-preview`,
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

  try {
    const extended = await fetchJson<PublicStatsResponse>(
      `${DITTO_API_BASE}/api/public/stats`,
    );
    if (extended.data.success) {
      if (extended.data.agents != null) agents = extended.data.agents;
      walletsScored = extended.data.walletsScored;
      tierAlpha = extended.data.tierCounts.alpha;
      tierWhale = extended.data.tierCounts.whale;
      tierSpecialist = extended.data.tierCounts.specialist;
      lastUpdated = extended.data.lastUpdated;
    }
  } catch {
    /* optional enrichment */
  }

  return {
    status: healthOk ? (agents === null ? "degraded" : "up") : "down",
    latencyMs,
    agents,
    walletsScored,
    tierAlpha,
    tierWhale,
    tierSpecialist,
    lastUpdated,
  };
};
