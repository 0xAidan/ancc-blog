import type { HistoryPoint } from "./types";

const STORAGE_KEY = "ancc-stats-history";
const MAX_POINTS = 7;

export const appendHistoryPoint = (
  dittoWallets: number | null,
  golfWinRate: number | null,
): HistoryPoint[] => {
  const existing = loadHistory();
  const next: HistoryPoint = {
    ts: Date.now(),
    dittoWallets,
    golfWinRate,
  };
  const updated = [...existing, next].slice(-MAX_POINTS);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const loadHistory = (): HistoryPoint[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as HistoryPoint[];
  } catch {
    return [];
  }
};

export const getSparklineValues = (
  history: HistoryPoint[],
  key: "dittoWallets" | "golfWinRate",
): number[] =>
  history
    .map((p) => p[key])
    .filter((v): v is number => v !== null && !Number.isNaN(v));
