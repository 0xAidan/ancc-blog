export const site = {
  name: "Sherman-Davison Business Solutions",
  shortName: "Sherman-Davison",
  eyebrow: "Business Solutions",
  tagline: "Projects, live systems, and tools that take themselves seriously.",
  description:
    "Sherman-Davison Business Solutions — live project dashboards, golf analytics, autonomous trading systems, and experimental tools.",
  domain: "shermandavison.com",
  url: "https://shermandavison.com",
  email: null as string | null,
  nav: [
    { label: "Dashboard", href: "/#dashboard" },
    { label: "Projects", href: "/#projects" },
    { label: "Tools", href: "/tools" },
    { label: "About", href: "/#about" },
  ],
  social: [
    { label: "GitHub", href: "https://github.com/0xAidan", handle: "github.com/0xAidan" },
  ],
  footer: {
    copyrightYear: 2026,
    note: "Informal. Serious. Shipping.",
  },
} as const;

export type SiteConfig = typeof site;
