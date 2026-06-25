import { createRegistry } from "../registry";
import { registerCoreCommands } from "./core";
import { registerStatsCommands } from "./stats";
import { registerDashboardCommands } from "./dashboard";

export const buildCommandRegistry = () => {
  const registry = createRegistry();
  registerCoreCommands(registry);
  registerStatsCommands(registry);
  registerDashboardCommands(registry);
  return registry;
};
