const MAX_LINES = 500;

export type OutputLine = {
  text: string;
  className?: string;
};

export class TerminalOutput {
  private readonly container: HTMLElement;
  private lines: OutputLine[] = [];

  constructor(container: HTMLElement) {
    this.container = container;
  }

  append(text: string, className?: string): void {
    const chunks = text.split("\n");
    for (const chunk of chunks) {
      this.lines.push({ text: chunk, className });
    }
    if (this.lines.length > MAX_LINES) {
      this.lines = this.lines.slice(-MAX_LINES);
    }
    this.render();
  }

  appendLines(lines: OutputLine[]): void {
    for (const line of lines) {
      this.lines.push(line);
    }
    if (this.lines.length > MAX_LINES) {
      this.lines = this.lines.slice(-MAX_LINES);
    }
    this.render();
  }

  clear(): void {
    this.lines = [];
    this.render();
  }

  private render(): void {
    this.container.replaceChildren();
    for (const line of this.lines) {
      const el = document.createElement("div");
      el.className = `terminal-line${line.className ? ` ${line.className}` : ""}`;
      el.textContent = line.text;
      this.container.appendChild(el);
    }
    this.container.scrollTop = this.container.scrollHeight;
  }
}
