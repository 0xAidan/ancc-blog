import type { DittoStats, GolfStats } from "../stats/types";
import { PROJECTS } from "../data/projects";

const formatRelative = (ts: number): string => {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
};

const fmt = (v: number | null, suffix = ""): string =>
  v === null ? "—" : `${v}${suffix}`;

export type DashboardElements = {
  root: HTMLElement;
  dittoCard: HTMLAnchorElement;
  dittoPrimary: HTMLElement;
  dittoSecondary: HTMLElement;
  dittoTertiary: HTMLElement;
  dittoUpdated: HTMLElement;
  golfCard: HTMLAnchorElement;
  golfPrimary: HTMLElement;
  golfSecondary: HTMLElement;
  golfTertiary: HTMLElement;
  golfUpdated: HTMLElement;
};

const createStatCard = (title: string, href: string): {
  card: HTMLAnchorElement;
  primary: HTMLElement;
  secondary: HTMLElement;
  tertiary: HTMLElement;
  updated: HTMLElement;
} => {
  const card = document.createElement("a");
  card.className = "stat-card";
  card.href = href;
  card.rel = "noopener noreferrer";
  card.innerHTML = `
    <h3 class="stat-card-title">${title}</h3>
    <p class="stat-primary stat-skeleton">Checking…</p>
    <p class="stat-secondary"></p>
    <p class="stat-tertiary"></p>
    <p class="stat-updated"></p>
  `;

  return {
    card,
    primary: card.querySelector(".stat-primary")!,
    secondary: card.querySelector(".stat-secondary")!,
    tertiary: card.querySelector(".stat-tertiary")!,
    updated: card.querySelector(".stat-updated")!,
  };
};

export const createDashboard = (): DashboardElements => {
  const root = document.createElement("section");
  root.id = "dashboard";
  root.className = "dashboard";
  root.setAttribute("aria-label", "Project statistics");

  const grid = document.createElement("div");
  grid.className = "dashboard-grid";

  const ditto = createStatCard("Ditto", PROJECTS[0].url);
  const golf = createStatCard("Golf Model", PROJECTS[1].url);

  grid.appendChild(ditto.card);
  grid.appendChild(golf.card);
  root.appendChild(grid);

  return {
    root,
    dittoCard: ditto.card,
    dittoPrimary: ditto.primary,
    dittoSecondary: ditto.secondary,
    dittoTertiary: ditto.tertiary,
    dittoUpdated: ditto.updated,
    golfCard: golf.card,
    golfPrimary: golf.primary,
    golfSecondary: golf.secondary,
    golfTertiary: golf.tertiary,
    golfUpdated: golf.updated,
  };
};

const clearSkeleton = (el: HTMLElement): void => {
  el.classList.remove("stat-skeleton");
};

export const updateDashboard = (
  els: DashboardElements,
  ditto: DittoStats,
  golf: GolfStats,
  fetchedAt: number,
): void => {
  if (ditto.agents === null && ditto.walletsScored === null) {
    clearSkeleton(els.dittoPrimary);
    els.dittoPrimary.textContent =
      ditto.status === "down" ? "Offline" : "Checking…";
    els.dittoSecondary.textContent = "";
  } else {
    clearSkeleton(els.dittoPrimary);
    els.dittoPrimary.textContent =
      ditto.agents !== null ? `${ditto.agents} agents` : "Checking…";
    els.dittoSecondary.textContent =
      ditto.walletsScored !== null
        ? `${ditto.walletsScored.toLocaleString()} wallets scored`
        : "";
  }
  els.dittoTertiary.textContent =
    ditto.tierAlpha !== null
      ? `α ${fmt(ditto.tierAlpha)} · whale ${fmt(ditto.tierWhale)}`
      : "";

  if (golf.status === "down") {
    clearSkeleton(els.golfPrimary);
    els.golfPrimary.textContent = "Offline";
    els.golfSecondary.textContent = "Could not load stats";
  } else if (golf.winRate === null && (golf.picksGraded === null || golf.picksGraded === 0)) {
    clearSkeleton(els.golfPrimary);
    els.golfPrimary.textContent = "No graded picks yet";
    els.golfSecondary.textContent = "";
  } else {
    clearSkeleton(els.golfPrimary);
    els.golfPrimary.textContent =
      golf.winRate !== null ? `${golf.winRate}% win rate` : "Checking…";
    const parts: string[] = [];
    if (golf.picksGraded !== null) {
      parts.push(`${golf.picksGraded.toLocaleString()} picks graded`);
    }
    if (golf.totalProfit !== null) {
      const sign = golf.totalProfit >= 0 ? "+" : "";
      parts.push(`${sign}${golf.totalProfit}u profit`);
    }
    els.golfSecondary.textContent = parts.join(" · ");
  }
  els.golfTertiary.textContent = golf.latestEvent ?? golf.modelName ?? "";

  const updated = `Updated ${formatRelative(fetchedAt)}`;
  els.dittoUpdated.textContent = updated;
  els.golfUpdated.textContent = updated;
};
