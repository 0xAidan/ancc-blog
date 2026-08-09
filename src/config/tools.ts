export type Tool = {
  slug: string;
  name: string;
  description: string;
  /** When false, listed but not yet interactive */
  ready: boolean;
};

export const TOOLS: Tool[] = [
  {
    slug: "odds-converter",
    name: "Odds converter",
    description: "Convert American, decimal, and implied probability odds.",
    ready: true,
  },
];

export const getToolBySlug = (slug: string): Tool | undefined =>
  TOOLS.find((t) => t.slug === slug);
