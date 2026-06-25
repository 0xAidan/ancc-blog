import type { TerminalOutput } from "./output";

export type CommandContext = {
  output: TerminalOutput;
  input: string;
  tokens: string[];
  args: string[];
};

export type CommandHandler = (ctx: CommandContext) => void | Promise<void>;

export type CommandDef = {
  name: string;
  aliases?: string[];
  description: string;
  handler: CommandHandler;
};

export class CommandRegistry {
  private readonly commands = new Map<string, CommandDef>();

  register(def: CommandDef): void {
    this.commands.set(def.name, def);
    for (const alias of def.aliases ?? []) {
      this.commands.set(alias, def);
    }
  }

  get(name: string): CommandDef | undefined {
    return this.commands.get(name.toLowerCase());
  }

  getAllNames(): string[] {
    const names = new Set<string>();
    for (const def of this.commands.values()) {
      names.add(def.name);
    }
    return [...names].sort();
  }

  autocomplete(prefix: string): string[] {
    const lower = prefix.toLowerCase();
    return this.getAllNames().filter((n) => n.startsWith(lower));
  }
}

export const createRegistry = (): CommandRegistry => new CommandRegistry();
