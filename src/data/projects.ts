export type ProjectId = "ditto" | "golf";

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
    domain: "golf.ancc.blog",
    url: "https://golf.ancc.blog",
    description: "Golf analytics for sports betting",
  },
];

export const getProject = (id: string): Project | undefined =>
  PROJECTS.find((p) => p.id === id || p.name.toLowerCase().includes(id.toLowerCase()));

export const resolveProjectArg = (arg: string): Project | undefined => {
  const lower = arg.toLowerCase();
  if (lower.includes("ditto")) return PROJECTS[0];
  if (lower.includes("golf")) return PROJECTS[1];
  return getProject(lower);
};
