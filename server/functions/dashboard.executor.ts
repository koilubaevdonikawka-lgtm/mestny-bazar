import type { DashboardSummaryDTO } from "@shared/contracts/dashboard";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

export async function executeGetDashboardSummary(): Promise<DashboardSummaryDTO> {
  await requireAdminFromRequest();
  return getServices().dashboardService.getSummary();
}
