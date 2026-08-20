export const site = {
  name: "Sherman Davison Business Solutions",
  shortName: "Sherman Davison",
  eyebrow: "Business Solutions",
  tagline: "Projects, live systems, and tools that take themselves seriously.",
  description: "Sherman Davison Business Solutions.",
  domain: "shermandavison.com",
  url: "https://shermandavison.com",
  email: "aidannuge@gmail.com",
  nav: [] as { label: string; href: string }[],
  social: [] as { label: string; href: string; handle: string }[],
  footer: {
    copyrightYear: 2026,
    note: "Informal. Serious. Shipping.",
  },
} as const;

export type SiteConfig = typeof site;
