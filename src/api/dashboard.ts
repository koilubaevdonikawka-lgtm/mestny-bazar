import type { DashboardSummaryDTO } from "@shared/contracts/dashboard";
import { getDashboardSummaryFn } from "@/api/dashboard.functions";

export async function getDashboardSummary(): Promise<DashboardSummaryDTO> {
  return getDashboardSummaryFn();
}
