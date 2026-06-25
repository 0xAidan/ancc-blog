export const tokenize = (input: string): string[] => {
  const trimmed = input.trim();
  if (!trimmed) return [];
  return trimmed.split(/\s+/);
};

export const getCommandName = (tokens: string[]): string => tokens[0]?.toLowerCase() ?? "";

export const getArgs = (tokens: string[]): string[] => tokens.slice(1);
