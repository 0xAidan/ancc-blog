import type { HealthStatus } from "../stats/types";

export const createStatusDot = (status: HealthStatus): HTMLSpanElement => {
  const dot = document.createElement("span");
  dot.className = `status-dot status-dot--${status}`;
  dot.setAttribute("aria-hidden", "true");
  const labels: Record<HealthStatus, string> = {
    up: "online",
    degraded: "degraded",
    down: "offline",
  };
  dot.title = labels[status];
  return dot;
};

export const updateStatusDot = (el: HTMLSpanElement, status: HealthStatus): void => {
  el.className = `status-dot status-dot--${status}`;
  const labels: Record<HealthStatus, string> = {
    up: "online",
    degraded: "degraded",
    down: "offline",
  };
  el.title = labels[status];
};
