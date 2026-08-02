import { createServerFn } from "@tanstack/react-start";
import type { AutomationOverviewDTO } from "@shared/contracts/automation";

export const getAutomationOverviewFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AutomationOverviewDTO> => {
    const { executeGetAutomationOverview } = await import("@server/functions/automation.executor");
    return executeGetAutomationOverview();
  },
);
