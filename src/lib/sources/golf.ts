import { fetchJson } from "./fetchUtils";
import type {
  CalibrationResponse,
  ClvSummary,
  GolfHealth,
  HealthStatus,
  LatestEvent,
} from "./types";

const GOLF_API_BASE = "/api/golf";

export const fetchGolfClv = async (): Promise<ClvSummary | null> => {
  try {
    const { data } = await fetchJson<ClvSummary>(`${GOLF_API_BASE}/clv/summary`);
    return data;
  } catch {
    return null;
  }
};

export const fetchGolfCalibration = async (): Promise<CalibrationResponse | null> => {
  try {
    const { data } = await fetchJson<CalibrationResponse>(`${GOLF_API_BASE}/calibration`);
    return data;
  } catch {
    return null;
  }
};

export const fetchGolfLatestEvent = async (): Promise<LatestEvent | null> => {
  try {
    const { data } = await fetchJson<LatestEvent>(
      `${GOLF_API_BASE}/events/latest-completed`,
    );
    return data;
  } catch {
    return null;
  }
};

export const fetchGolfHealth = async (): Promise<GolfHealth | null> => {
  try {
    const { data } = await fetchJson<GolfHealth>(`${GOLF_API_BASE}/ops/health`);
    return data;
  } catch {
    return null;
  }
};

export const resolveGolfStatus = (parts: {
  health: GolfHealth | null;
  clv: ClvSummary | null;
  calibration: CalibrationResponse | null;
}): HealthStatus => {
  if (!parts.health?.ok) return "down";
  if (!parts.clv && !parts.calibration) return "degraded";
  return "up";
};
