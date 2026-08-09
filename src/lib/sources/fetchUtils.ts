type FetchJsonResult<T> = {
  data: T;
  latencyMs: number;
};

export const fetchJson = async <T>(
  url: string,
  timeoutMs = 8000,
): Promise<FetchJsonResult<T>> => {
  const start = performance.now();
  const res = await fetch(url, {
    signal: AbortSignal.timeout(timeoutMs),
    cache: "no-store",
  });
  const latencyMs = Math.round(performance.now() - start);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  const data = (await res.json()) as T;
  return { data, latencyMs };
};

export const getByPath = (obj: unknown, path: string): unknown => {
  if (obj == null) return null;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (cur == null || typeof cur !== "object") return null;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur ?? null;
};
