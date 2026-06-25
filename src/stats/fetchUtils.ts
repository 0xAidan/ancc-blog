const FETCH_TIMEOUT_MS = 8000;

export const fetchJson = async <T>(url: string): Promise<{ data: T; latencyMs: number }> => {
  const start = performance.now();
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = (await response.json()) as T;
  return { data, latencyMs: Math.round(performance.now() - start) };
};
