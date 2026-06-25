import type { DittoStats, GolfStats } from "../stats/types";
import { getSparklineValues, loadHistory } from "../stats/history";
import { renderSparkline } from "./Sparkline";

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
  dittoPrimary: HTMLElement;
  dittoSecondary: HTMLElement;
  dittoTertiary: HTMLElement;
  dittoSparkline: HTMLElement;
  dittoUpdated: HTMLElement;
  golfPrimary: HTMLElement;
  golfSecondary: HTMLElement;
  golfTertiary: HTMLElement;
  golfSparkline: HTMLElement;
  golfUpdated: HTMLElement;
};

export const createDashboard = (): DashboardElements => {
  const root = document.createElement("section");
  root.id = "dashboard";
  root.className = "dashboard";
  root.setAttribute("aria-label", "Project statistics");
  root.setAttribute("aria-expanded", "true");

  const grid = document.createElement("div");
  grid.className = "dashboard-grid";

  const dittoCard = document.createElement("article");
  dittoCard.className = "stat-card";
  dittoCard.innerHTML = `
    <h3 class="stat-card-title">Ditto</h3>
    <p class="stat-primary"></p>
    <p class="stat-secondary"></p>
    <p class="stat-tertiary"></p>
    <div class="stat-sparkline"></div>
    <p class="stat-updated"></p>
  `;

  const golfCard = document.createElement("article");
  golfCard.className = "stat-card";
  golfCard.innerHTML = `
    <h3 class="stat-card-title">Golf Model</h3>
    <p class="stat-primary"></p>
    <p class="stat-secondary"></p>
    <p class="stat-tertiary"></p>
    <div class="stat-sparkline"></div>
    <p class="stat-updated"></p>
  `;

  grid.appendChild(dittoCard);
  grid.appendChild(golfCard);
  root.appendChild(grid);

  return {
    root,
    dittoPrimary: dittoCard.querySelector(".stat-primary")!,
    dittoSecondary: dittoCard.querySelector(".stat-secondary")!,
    dittoTertiary: dittoCard.querySelector(".stat-tertiary")!,
    dittoSparkline: dittoCard.querySelector(".stat-sparkline")!,
    dittoUpdated: dittoCard.querySelector(".stat-updated")!,
    golfPrimary: golfCard.querySelector(".stat-primary")!,
    golfSecondary: golfCard.querySelector(".stat-secondary")!,
    golfTertiary: golfCard.querySelector(".stat-tertiary")!,
    golfSparkline: golfCard.querySelector(".stat-sparkline")!,
    golfUpdated: golfCard.querySelector(".stat-updated")!,
  };
};

export const updateDashboard = (
  els: DashboardElements,
  ditto: DittoStats,
  golf: GolfStats,
  fetchedAt: number,
): void => {
  if (ditto.agents === null && ditto.walletsScored === null) {
    els.dittoPrimary.textContent =
      ditto.status === "down" ? "Stats unavailable" : "Loading stats…";
    els.dittoSecondary.textContent = "";
  } else {
    els.dittoPrimary.textContent =
      ditto.agents !== null ? `${ditto.agents} agents` : "Loading agents…";
    els.dittoSecondary.textContent =
      ditto.walletsScored !== null
        ? `${ditto.walletsScored} wallets scored`
        : "Loading wallet data…";
  }
  els.dittoTertiary.textContent =
    ditto.tierAlpha !== null
      ? `α ${fmt(ditto.tierAlpha)} · whale ${fmt(ditto.tierWhale)}`
      : "";

  if (golf.status === "down") {
    els.golfPrimary.textContent = "Stats unavailable";
    els.golfSecondary.textContent = "Could not reach golf.ancc.blog";
  } else if (golf.winRate === null && (golf.picksGraded === null || golf.picksGraded === 0)) {
    els.golfPrimary.textContent = "No graded picks yet";
    els.golfSecondary.textContent = "";
  } else {
    els.golfPrimary.textContent =
      golf.winRate !== null ? `${golf.winRate}% win rate` : "Loading win rate…";
    els.golfSecondary.textContent =
      golf.picksGraded !== null ? `${golf.picksGraded} picks graded` : "";
  }
  els.golfTertiary.textContent = golf.latestEvent ?? golf.modelName ?? "";

  els.dittoUpdated.textContent = `Updated ${formatRelative(fetchedAt)}`;
  els.golfUpdated.textContent = `Updated ${formatRelative(fetchedAt)}`;

  const history = loadHistory();
  renderSparkline(
    els.dittoSparkline,
    getSparklineValues(history, "dittoWallets"),
    history.length < 2,
  );
  renderSparkline(
    els.golfSparkline,
    getSparklineValues(history, "golfWinRate"),
    history.length < 2,
  );
};

export const setDashboardVisibility = (root: HTMLElement, visible: boolean): void => {
  root.hidden = !visible;
  root.setAttribute("aria-expanded", String(visible));
};
