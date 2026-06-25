import "./styles/main.css";
import { PROJECTS, type ProjectId } from "./data/projects";
import { createStatusDot, updateStatusDot } from "./components/StatusDot";
import {
  createDashboard,
  setDashboardVisibility,
  updateDashboard,
  type DashboardElements,
} from "./components/Dashboard";
import { isDashboardVisible } from "./terminal/commands/dashboard";
import { buildCommandRegistry } from "./terminal/commands";
import { TerminalShell } from "./terminal/shell";
import { getStats } from "./stats/cache";
import { appendHistoryPoint } from "./stats/history";
import type { StatsSnapshot } from "./stats/types";

const statusDotEls: Partial<Record<ProjectId, HTMLSpanElement>> = {};
const statHintEls: Partial<Record<ProjectId, HTMLSpanElement>> = {};

const buildPage = (): {
  dashboard: DashboardElements;
  terminalInput: HTMLInputElement;
} => {
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
  setDashboardVisibility(dashboard.root, isDashboardVisible());

  const terminalPanel = document.createElement("section");
  terminalPanel.className = "terminal-panel";
  terminalPanel.setAttribute("aria-label", "Terminal");

  const output = document.createElement("div");
  output.className = "terminal-output";
  output.setAttribute("role", "log");
  output.setAttribute("aria-live", "polite");

  const inputRow = document.createElement("div");
  inputRow.className = "terminal-input-row";

  const promptLabel = document.createElement("span");
  promptLabel.className = "terminal-prompt-label";
  promptLabel.textContent = "ancc@blog ~ %";

  const input = document.createElement("input");
  input.className = "terminal-input";
  input.type = "text";
  input.autocomplete = "off";
  input.spellcheck = false;
  input.setAttribute("aria-label", "Terminal command input");

  inputRow.appendChild(promptLabel);
  inputRow.appendChild(input);
  terminalPanel.appendChild(output);
  terminalPanel.appendChild(inputRow);

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
  main.appendChild(terminalPanel);
  main.appendChild(footer);

  app.appendChild(skipLink);
  app.appendChild(main);

  return { dashboard, terminalInput: input };
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

  window.addEventListener("ancc:stats-updated", ((e: CustomEvent<StatsSnapshot>) => {
    applyStats(e.detail, dashboard);
  }) as EventListener);

  window.addEventListener("ancc:dashboard-toggle", ((e: CustomEvent<{ visible: boolean }>) => {
    setDashboardVisibility(dashboard.root, e.detail.visible);
  }) as EventListener);
};

const init = (): void => {
  const { dashboard, terminalInput } = buildPage();
  const registry = buildCommandRegistry();

  new TerminalShell({
    outputEl: document.querySelector(".terminal-output")!,
    inputEl: terminalInput,
    registry,
  });

  startStatsPolling(dashboard);
};

init();
