import type { CommandRegistry } from "../registry";

const STORAGE_KEY = "ancc-dashboard-visible";

export const isDashboardVisible = (): boolean => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return true;
  return stored === "true";
};

export const setDashboardVisible = (visible: boolean): void => {
  localStorage.setItem(STORAGE_KEY, String(visible));
  window.dispatchEvent(new CustomEvent("ancc:dashboard-toggle", { detail: { visible } }));
};

export const registerDashboardCommands = (registry: CommandRegistry): void => {
  registry.register({
    name: "dashboard",
    description: "Toggle stats dashboard (dashboard show | hide)",
    handler: ({ output, args }) => {
      const sub = args[0]?.toLowerCase();
      if (sub === "show") {
        setDashboardVisible(true);
        output.append("Dashboard visible.");
        return;
      }
      if (sub === "hide") {
        setDashboardVisible(false);
        output.append("Dashboard hidden.");
        return;
      }
      const next = !isDashboardVisible();
      setDashboardVisible(next);
      output.append(next ? "Dashboard visible." : "Dashboard hidden.");
    },
  });
};
