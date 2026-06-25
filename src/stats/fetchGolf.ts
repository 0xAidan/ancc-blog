import type { GolfStats } from "./types";
import { fetchJson } from "./fetchUtils";

type TrackRecordEvent = {
  graded_pick_count?: number;
  wins?: number;
  losses?: number;
  pushes?: number;
  total_profit?: number;
  name?: string;
};

type TrackRecordResponse = {
  events?: TrackRecordEvent[];
};

type DashboardStateResponse = {
  latest_graded_tournament?: { name?: string } | null;
  effective_live_weekly_model?: { name?: string };
};

export const fetchGolfStats = async (): Promise<GolfStats> => {
  let latencyMs: number | null = null;

  try {
    const healthStart = performance.now();
    const healthRes = await fetch("https://golf.ancc.blog/api/dashboard/state", {
      signal: AbortSignal.timeout(8000),
    });
    latencyMs = Math.round(performance.now() - healthStart);
    if (!healthRes.ok) {
      throw new Error(`HTTP ${healthRes.status}`);
    }
  } catch {
    return {
      status: "down",
      latencyMs: null,
      winRate: null,
      picksGraded: null,
      totalProfit: null,
      latestEvent: null,
      modelName: null,
    };
  }

  let winRate: number | null = null;
  let picksGraded: number | null = null;
  let totalProfit: number | null = null;
  let latestEvent: string | null = null;
  let modelName: string | null = null;
  let partial = false;

  const results = await Promise.allSettled([
    fetchJson<TrackRecordResponse>("https://golf.ancc.blog/api/track-record?limit=50"),
    fetchJson<DashboardStateResponse>("https://golf.ancc.blog/api/dashboard/state"),
  ]);

  if (results[0].status === "fulfilled") {
    const events = results[0].value.data.events ?? [];
    let wins = 0;
    let losses = 0;
    let picks = 0;
    let profit = 0;

    for (const event of events) {
      wins += event.wins ?? 0;
      losses += event.losses ?? 0;
      picks += event.graded_pick_count ?? 0;
      profit += event.total_profit ?? 0;
    }

    const decided = wins + losses;
    picksGraded = picks;
    totalProfit = Math.round(profit * 10) / 10;
    winRate = decided > 0 ? Math.round((wins / decided) * 1000) / 10 : null;

    if (events[0]?.name) {
      latestEvent = events[0].name;
    }
  } else {
    partial = true;
  }

  if (results[1].status === "fulfilled") {
    const d = results[1].value.data;
    latestEvent = d.latest_graded_tournament?.name ?? latestEvent;
    modelName = d.effective_live_weekly_model?.name ?? null;
  } else {
    partial = true;
  }

  return {
    status: partial ? "degraded" : "up",
    latencyMs,
    winRate,
    picksGraded,
    totalProfit,
    latestEvent,
    modelName,
  };
};
