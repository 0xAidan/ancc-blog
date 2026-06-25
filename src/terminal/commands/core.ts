import { PROJECTS, resolveProjectArg } from "../../data/projects";
import type { CommandRegistry } from "../registry";

export const registerCoreCommands = (registry: CommandRegistry): void => {
  registry.register({
    name: "help",
    aliases: ["?"],
    description: "List available commands",
    handler: ({ output }) => {
      const names = registry.getAllNames();
      output.append("Available commands:");
      for (const name of names) {
        const def = registry.get(name);
        if (def && def.name === name) {
          output.append(`  ${name.padEnd(14)} ${def.description}`);
        }
      }
    },
  });

  registry.register({
    name: "clear",
    aliases: ["cls"],
    description: "Clear terminal output",
    handler: ({ output }) => {
      output.clear();
    },
  });

  registry.register({
    name: "projects",
    aliases: ["ls"],
    description: "List projects",
    handler: ({ output }) => {
      for (const p of PROJECTS) {
        output.append(`  ${p.name.padEnd(12)} ${p.domain}`);
        output.append(`    ${p.description}`, "terminal-muted");
      }
    },
  });

  registry.register({
    name: "open",
    description: "Open a project (open ditto | open golf)",
    handler: async ({ output, args }) => {
      const project = resolveProjectArg(args.join(" "));
      if (!project) {
        output.append("Usage: open <ditto|golf>");
        return;
      }
      output.append(`Opening ${project.domain}…`);
      await new Promise((r) => setTimeout(r, 300));
      window.location.href = project.url;
    },
  });

  registry.register({
    name: "about",
    description: "About ANCC",
    handler: ({ output }) => {
      output.append("Aidan Nugent Consulting Company");
      output.append("Projects and experiments in prediction markets,");
      output.append("copy trading, and sports betting analytics.");
      output.append("Type 'help' for commands.", "terminal-muted");
    },
  });

  registry.register({
    name: "history",
    description: "Show command history",
    handler: ({ output }) => {
      const history = (window as unknown as { __anccHistory?: string[] }).__anccHistory ?? [];
      if (history.length === 0) {
        output.append("No history yet.");
        return;
      }
      history.slice(-20).forEach((cmd, i) => {
        output.append(`  ${String(i + 1).padStart(2)}  ${cmd}`);
      });
    },
  });

  registry.register({
    name: "echo",
    description: "Print text",
    handler: ({ output, args }) => {
      output.append(args.join(" ") || "");
    },
  });

  registry.register({
    name: "date",
    description: "Current date and time",
    handler: ({ output }) => {
      output.append(
        new Intl.DateTimeFormat(undefined, {
          dateStyle: "full",
          timeStyle: "medium",
        }).format(new Date()),
      );
    },
  });

  registry.register({
    name: "whoami",
    description: "Who is this?",
    handler: ({ output }) => {
      output.append("aidan");
      output.append("https://github.com/0xAidan", "terminal-accent");
    },
  });

  registry.register({
    name: "banner",
    description: "ASCII art easter egg",
    handler: ({ output }) => {
      output.append("    _    _   _  ____ ____   ");
      output.append("   / \\  | \\ | |/ ___/ ___|  ");
      output.append("  / _ \\ |  \\| | |  | |      ");
      output.append(" / ___ \\| |\\  | |__| |___   ");
      output.append("/_/   \\_\\_| \\_|\\____\\____|  ");
      output.append("");
      output.append("  Aidan Nugent Consulting Co.", "terminal-accent");
    },
  });

  registry.register({
    name: "sudo",
    description: "Nice try",
    handler: ({ output, args }) => {
      const cmd = args.join(" ") || "anything";
      output.append(`aidan is not in the sudoers file.`);
      output.append(`Attempted: sudo ${cmd}`, "terminal-muted");
    },
  });
};
