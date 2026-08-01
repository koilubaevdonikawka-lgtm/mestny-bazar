import { createServerFn } from "@tanstack/react-start";
import type { DashboardSummaryDTO } from "@shared/contracts/dashboard";

export const getDashboardSummaryFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardSummaryDTO> => {
    const { executeGetDashboardSummary } = await import("@server/functions/dashboard.executor");
    return executeGetDashboardSummary();
  },
);
