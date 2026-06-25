import "./styles/main.css";
import { PROJECTS, type ProjectId } from "./data/projects";
import { createStatusDot, updateStatusDot } from "./components/StatusDot";
import { createDashboard, updateDashboard, type DashboardElements } from "./components/Dashboard";
import { getStats } from "./stats/cache";
import { appendHistoryPoint } from "./stats/history";
import type { StatsSnapshot } from "./stats/types";

const statusDotEls: Partial<Record<ProjectId, HTMLSpanElement>> = {};
const statHintEls: Partial<Record<ProjectId, HTMLSpanElement>> = {};

const buildPage = (): DashboardElements => {
  const app = document.getElementById("app")!;

  const skipLink = document.createElement("a");
  skipLink.className = "skip-link";
  skipLink.href = "#projects";
  skipLink.textContent = "Skip to projects";

  const main = document.createElement("main");

  const header = document.createElement("header");
  header.innerHTML = `
    <h1 translate="no">Aidan Nugent Consulting Company</h1>
    <p class="tagline">Projects and experiments<span class="cursor" aria-hidden="true">▍</span></p>
  `;

  const nav = document.createElement("nav");
  nav.id = "projects";
  nav.setAttribute("aria-label", "Projects");

  const navTitle = document.createElement("h2");
  navTitle.className = "sr-only";
  navTitle.textContent = "Projects";

  const list = document.createElement("ul");
  list.className = "project-list";

  for (const project of PROJECTS) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.className = "project-link";
    link.href = project.url;
    link.rel = "noopener noreferrer";

    const dot = createStatusDot("down");
    statusDotEls[project.id] = dot;

    const desc = document.createElement("span");
    desc.className = "description";
    desc.textContent = project.description;

    const hint = document.createElement("span");
    hint.className = "stat-hint";
    statHintEls[project.id] = hint;
    desc.appendChild(document.createElement("br"));
    desc.appendChild(hint);

    link.innerHTML = `
      <span class="project-row">
        <span class="prompt" aria-hidden="true">→</span>
        <span class="domain" translate="no">${project.domain}</span>
        <span class="name">${project.name}</span>
      </span>
    `;
    link.querySelector(".project-row")!.appendChild(dot);
    link.appendChild(desc);
    li.appendChild(link);
    list.appendChild(li);
  }

  nav.appendChild(navTitle);
  nav.appendChild(list);

  const dashboard = createDashboard();

  const footer = document.createElement("footer");
  footer.innerHTML = `
    <div class="footer-inner">
      <small>© 2026</small>
      <span class="footer-sep" aria-hidden="true">·</span>
      <a class="footer-link" href="https://github.com/0xAidan" rel="noopener noreferrer">github.com/0xAidan</a>
    </div>
  `;

  main.appendChild(header);
  main.appendChild(nav);
  main.appendChild(dashboard.root);
  main.appendChild(footer);

  app.appendChild(skipLink);
  app.appendChild(main);

  return dashboard;
};

const applyStats = (snapshot: StatsSnapshot, dashboard: DashboardElements): void => {
  updateStatusDot(statusDotEls.ditto!, snapshot.ditto.status);
  updateStatusDot(statusDotEls.golf!, snapshot.golf.status);

  if (statHintEls.ditto && snapshot.ditto.agents !== null) {
    statHintEls.ditto.textContent = `${snapshot.ditto.agents} agents · ${snapshot.ditto.walletsScored ?? "—"} wallets`;
  }
  if (statHintEls.golf && snapshot.golf.winRate !== null) {
    statHintEls.golf.textContent = `${snapshot.golf.winRate}% win · ${snapshot.golf.picksGraded ?? 0} picks`;
  }

  updateDashboard(dashboard, snapshot.ditto, snapshot.golf, snapshot.fetchedAt);
  appendHistoryPoint(snapshot.ditto.walletsScored, snapshot.golf.winRate);
  updateDashboard(dashboard, snapshot.ditto, snapshot.golf, snapshot.fetchedAt);
};

const startStatsPolling = (dashboard: DashboardElements): void => {
  const poll = async (force = false): Promise<void> => {
    try {
      const snapshot = await getStats(force);
      applyStats(snapshot, dashboard);
    } catch {
      /* graceful */
    }
  };

  void poll();

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const startInterval = (): void => {
    if (intervalId) return;
    intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        void poll();
      }
    }, 60_000);
  };

  const stopInterval = (): void => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  startInterval();

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void poll(true);
      startInterval();
    } else {
      stopInterval();
    }
  });
};

startStatsPolling(buildPage());
