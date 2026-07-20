import type { HealthStatus } from "./types";

const BLACKJACK_URL = "https://blackjack.ancc.blog/";

export const fetchBlackjackStatus = async (): Promise<{ status: HealthStatus }> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(BLACKJACK_URL, {
      method: "HEAD",
      mode: "cors",
      signal: controller.signal,
      cache: "no-store",
    });
    return { status: res.ok ? "up" : "degraded" };
  } catch {
    // Static hosting may not answer HEAD/CORS; try GET as fallback via no-cors
    // is opaque — treat network failure as down until site is live.
    return { status: "down" };
  } finally {
    clearTimeout(timer);
  }
};
