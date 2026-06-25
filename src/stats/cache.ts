import { fetchDittoStats } from "./fetchDitto";
import { fetchGolfStats } from "./fetchGolf";
import type { StatsSnapshot } from "./types";

const TTL_MS = 60_000;

let cache: StatsSnapshot | null = null;
let cacheTime = 0;
let inflight: Promise<StatsSnapshot> | null = null;

export const getStats = async (force = false): Promise<StatsSnapshot> => {
  const now = Date.now();
  if (!force && cache && now - cacheTime < TTL_MS) {
    return cache;
  }

  if (inflight) {
    return inflight;
  }

  inflight = (async () => {
    const [ditto, golf] = await Promise.all([fetchDittoStats(), fetchGolfStats()]);
    const snapshot: StatsSnapshot = { fetchedAt: Date.now(), ditto, golf };
    cache = snapshot;
    cacheTime = Date.now();
    inflight = null;
    return snapshot;
  })();

  return inflight;
};

export const bustStatsCache = (): void => {
  cache = null;
  cacheTime = 0;
};

export const getCachedStats = (): StatsSnapshot | null => cache;
