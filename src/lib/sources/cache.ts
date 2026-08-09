import { fetchDittoStats } from "./ditto";
import {
  fetchGolfCalibration,
  fetchGolfClv,
  fetchGolfHealth,
  fetchGolfLatestEvent,
  resolveGolfStatus,
} from "./golf";
import type { DashboardSnapshot } from "./types";

const TTL_MS = 60_000;

let cached: DashboardSnapshot | null = null;
let inflight: Promise<DashboardSnapshot> | null = null;

const loadSnapshot = async (): Promise<DashboardSnapshot> => {
  const [clv, calibration, latestEvent, health, ditto] = await Promise.all([
    fetchGolfClv(),
    fetchGolfCalibration(),
    fetchGolfLatestEvent(),
    fetchGolfHealth(),
    fetchDittoStats(),
  ]);

  return {
    fetchedAt: Date.now(),
    golf: {
      clv,
      calibration,
      latestEvent,
      health,
      status: resolveGolfStatus({ health, clv, calibration }),
    },
    ditto,
  };
};

export const getDashboardSnapshot = async (force = false): Promise<DashboardSnapshot> => {
  if (!force && cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached;
  }

  if (inflight) return inflight;

  inflight = loadSnapshot()
    .then((snapshot) => {
      cached = snapshot;
      return snapshot;
    })
    .finally(() => {
      inflight = null;
    });

  return inflight;
};
