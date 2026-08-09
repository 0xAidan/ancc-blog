export type ProjectId = "ditto" | "golf" | "blackjack";

export type Project = {
  id: ProjectId;
  slug: string;
  name: string;
  domain: string;
  url: string;
  description: string;
  longDescription: string;
  tags: string[];
  /** When true, hidden from homepage / sitemap listings but still defined. */
  hidden: boolean;
};

export const PROJECTS: Project[] = [
  {
    id: "ditto",
    slug: "ditto",
    name: "Ditto",
    domain: "ditto.jungle.win",
    url: "https://ditto.jungle.win",
    description: "Autonomous Polymarket copy trading",
    longDescription:
      "Ditto scores wallets, ranks agents, and runs autonomous copy-trading on Polymarket. Live agent counts and wallet scoring feed the homepage dashboard.",
    tags: ["trading", "agents", "polymarket"],
    hidden: false,
  },
  {
    id: "golf",
    slug: "golf-model",
    name: "Golf Model",
    domain: "golf.shermandavison.com",
    url: "https://golf.shermandavison.com",
    description: "Golf analytics for sports betting",
    longDescription:
      "A research and production golf betting model — calibration curves, closing-line value by book, and graded tournament history. Public read-only API on golf.shermandavison.com.",
    tags: ["golf", "analytics", "modeling"],
    hidden: false,
  },
  {
    id: "blackjack",
    slug: "blackjack-trainer",
    name: "Blackjack Trainer",
    domain: "blackjack.ancc.blog",
    url: "https://blackjack.ancc.blog",
    description: "Hi-Lo counting drills and basic strategy practice",
    longDescription:
      "Personal practice tool for Hi-Lo counting and basic strategy. Early and unfinished — kept in config but hidden from the public grid.",
    tags: ["practice", "cards"],
    hidden: true,
  },
];

export const getVisibleProjects = (): Project[] => PROJECTS.filter((p) => !p.hidden);

export const getProjectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((p) => p.slug === slug);
