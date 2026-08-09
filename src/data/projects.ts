export type ProjectId = "ditto" | "golf" | "blackjack";

export type Project = {
  id: ProjectId;
  name: string;
  domain: string;
  url: string;
  description: string;
};

export const PROJECTS: Project[] = [
  {
    id: "ditto",
    name: "Ditto",
    domain: "ditto.jungle.win",
    url: "https://ditto.jungle.win",
    description: "Autonomous Polymarket copy trading",
  },
  {
    id: "golf",
    name: "Golf Model",
    domain: "golf.shermandavison.com",
    url: "https://golf.shermandavison.com",
    description: "Golf analytics for sports betting",
  },
  {
    id: "blackjack",
    name: "Blackjack Trainer",
    domain: "blackjack.ancc.blog",
    url: "https://blackjack.ancc.blog",
    description: "Hi-Lo counting drills and basic strategy practice",
  },
];

export const getProject = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id || p.name.toLowerCase().includes(id.toLowerCase()));

export const resolveProjectArg = (arg: string): Project | undefined => {
  const lower = arg.toLowerCase();
  if (lower.includes("ditto")) return PROJECTS[0];
  if (lower.includes("golf")) return PROJECTS[1];
  if (lower.includes("blackjack") || lower.includes("bj")) return PROJECTS[2];
  return getProject(lower);
};
