import { bustStatsCache, getStats } from "../../stats/cache";
import type { DittoStats, GolfStats } from "../../stats/types";
import type { CommandRegistry } from "../registry";

const fmt = (v: number | null, suffix = ""): string =>
  v === null ? "—" : `${v}${suffix}`;

const printDitto = (output: { append: (t: string, c?: string) => void }, s: DittoStats): void => {
  output.append("Ditto — ditto.jungle.win", "terminal-accent");
  output.append(`  status      ${s.status.toUpperCase()}${s.latencyMs !== null ? ` (${s.latencyMs}ms)` : ""}`);
  output.append(`  agents      ${fmt(s.agents)}`);
  output.append(`  wallets     ${fmt(s.walletsScored)} scored`);
  if (s.tierAlpha !== null || s.tierWhale !== null) {
    output.append(
      `  tiers       α ${fmt(s.tierAlpha)} · whale ${fmt(s.tierWhale)} · spec ${fmt(s.tierSpecialist)}`,
    );
  }
  if (s.lastUpdated) {
    output.append(`  updated     ${formatRelative(s.lastUpdated)}`, "terminal-muted");
  }
};

const printGolf = (output: { append: (t: string, c?: string) => void }, s: GolfStats): void => {
  output.append("Golf Model — golf.ancc.blog", "terminal-accent");
  output.append(`  status      ${s.status.toUpperCase()}${s.latencyMs !== null ? ` (${s.latencyMs}ms)` : ""}`);
  if (s.picksGraded === 0 || (s.winRate === null && s.picksGraded === null)) {
    output.append("  No graded picks yet.", "terminal-muted");
  } else {
    output.append(`  win rate    ${s.winRate !== null ? `${s.winRate}%` : "—"}  (${fmt(s.picksGraded)} picks)`);
    output.append(`  profit      ${s.totalProfit !== null ? `${s.totalProfit > 0 ? "+" : ""}${s.totalProfit}u` : "—"}`);
  }
  if (s.latestEvent) {
    output.append(`  latest      ${s.latestEvent}`);
  }
  if (s.modelName) {
    output.append(`  model       ${s.modelName}`, "terminal-muted");
  }
};

const formatRelative = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.round(mins / 60)}h ago`;
};

export const registerStatsCommands = (registry: CommandRegistry): void => {
  registry.register({
    name: "status",
    description: "Check project health",
    handler: async ({ output }) => {
      output.append("Checking status…", "terminal-muted");
      const stats = await getStats(true);
      for (const [name, s] of [
        ["Ditto", stats.ditto],
        ["Golf Model", stats.golf],
      ] as const) {
        const lat = "latencyMs" in s && s.latencyMs !== null ? ` (${s.latencyMs}ms)` : "";
        output.append(`  ${name.padEnd(12)} ${s.status.toUpperCase()}${lat}`);
      }
      window.dispatchEvent(new CustomEvent("ancc:stats-updated", { detail: stats }));
    },
  });

  registry.register({
    name: "stats",
    description: "Show all project stats",
    handler: async ({ output }) => {
      output.append("Fetching stats…", "terminal-muted");
      const stats = await getStats(true);
      output.append("");
      printDitto(output, stats.ditto);
      output.append("");
      printGolf(output, stats.golf);
      window.dispatchEvent(new CustomEvent("ancc:stats-updated", { detail: stats }));
    },
  });

  registry.register({
    name: "ditto",
    description: "Ditto stats (ditto stats)",
    handler: async ({ output, args }) => {
      if (args[0] !== "stats") {
        output.append("Usage: ditto stats");
        return;
      }
      const stats = await getStats(true);
      printDitto(output, stats.ditto);
      window.dispatchEvent(new CustomEvent("ancc:stats-updated", { detail: stats }));
    },
  });

  registry.register({
    name: "golf",
    description: "Golf stats (golf stats)",
    handler: async ({ output, args }) => {
      if (args[0] !== "stats") {
        output.append("Usage: golf stats");
        return;
      }
      const stats = await getStats(true);
      printGolf(output, stats.golf);
      window.dispatchEvent(new CustomEvent("ancc:stats-updated", { detail: stats }));
    },
  });

  registry.register({
    name: "refresh",
    description: "Refresh live stats",
    handler: async ({ output }) => {
      bustStatsCache();
      output.append("Refreshing…", "terminal-muted");
      const stats = await getStats(true);
      output.append("Stats updated.", "terminal-accent");
      window.dispatchEvent(new CustomEvent("ancc:stats-updated", { detail: stats }));
    },
  });
};
