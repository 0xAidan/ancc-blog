import { getArgs, getCommandName, tokenize } from "./parser";
import { TerminalOutput } from "./output";
import type { CommandRegistry } from "./registry";

const BOOT_KEY = "ancc-boot-seen";

declare global {
  interface Window {
    __anccHistory?: string[];
  }
}

export type TerminalShellOptions = {
  outputEl: HTMLElement;
  inputEl: HTMLInputElement;
  registry: CommandRegistry;
};

export class TerminalShell {
  private readonly output: TerminalOutput;
  private readonly inputEl: HTMLInputElement;
  private readonly registry: CommandRegistry;
  private history: string[] = [];
  private historyIndex = -1;

  constructor({ outputEl, inputEl, registry }: TerminalShellOptions) {
    this.output = new TerminalOutput(outputEl);
    this.inputEl = inputEl;
    this.registry = registry;
    window.__anccHistory = this.history;

    this.inputEl.addEventListener("keydown", this.handleKeyDown);
    outputEl.closest(".terminal-panel")?.addEventListener("click", () => {
      this.inputEl.focus();
    });

    this.runBootSequence();
  }

  private runBootSequence(): void {
    if (sessionStorage.getItem(BOOT_KEY)) return;
    sessionStorage.setItem(BOOT_KEY, "1");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = [
      "Connecting to ancc.blog…",
      "Loading project index…",
      "Terminal ready.",
      "Type 'help' to get started.",
    ];

    if (reduced) {
      for (const line of lines) {
        this.output.append(line, "terminal-muted");
      }
      return;
    }

    let i = 0;
    const showNext = (): void => {
      if (i < lines.length) {
        this.output.append(lines[i], "terminal-muted");
        i += 1;
        setTimeout(showNext, 200);
      }
    };
    showNext();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      void this.execute(this.inputEl.value);
      this.inputEl.value = "";
      this.historyIndex = -1;
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (this.history.length === 0) return;
      if (this.historyIndex === -1) this.historyIndex = this.history.length;
      this.historyIndex = Math.max(0, this.historyIndex - 1);
      this.inputEl.value = this.history[this.historyIndex] ?? "";
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (this.historyIndex === -1) return;
      this.historyIndex += 1;
      if (this.historyIndex >= this.history.length) {
        this.historyIndex = -1;
        this.inputEl.value = "";
        return;
      }
      this.inputEl.value = this.history[this.historyIndex] ?? "";
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      const tokens = tokenize(this.inputEl.value);
      const name = getCommandName(tokens);
      const matches = this.registry.autocomplete(name);
      if (matches.length === 1) {
        this.inputEl.value = `${matches[0]} `;
      } else if (matches.length > 1) {
        this.output.append(matches.join("  "), "terminal-muted");
      }
      return;
    }

    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      this.output.clear();
    }
  };

  async execute(raw: string): Promise<void> {
    const trimmed = raw.trim();
    if (!trimmed) return;

    this.history.push(trimmed);
    window.__anccHistory = this.history;

    this.output.append(`ancc@blog ~ % ${trimmed}`, "terminal-input-echo");

    const tokens = tokenize(trimmed);
    const cmdName = getCommandName(tokens);

    if (cmdName === "ditto" && tokens[1] === "stats") {
      const def = this.registry.get("ditto");
      if (def) {
        await def.handler({
          output: this.output,
          input: raw,
          tokens,
          args: getArgs(tokens),
        });
      }
      return;
    }

    if (cmdName === "golf" && tokens[1] === "stats") {
      const def = this.registry.get("golf");
      if (def) {
        await def.handler({
          output: this.output,
          input: raw,
          tokens,
          args: getArgs(tokens),
        });
      }
      return;
    }

    const def = this.registry.get(cmdName);
    if (!def) {
      this.output.append(`Command not found: ${cmdName}. Type 'help'.`);
      return;
    }

    await def.handler({
      output: this.output,
      input: raw,
      tokens,
      args: getArgs(tokens),
    });
  }
}
