import type { SalesAnalyticsDTO, SalesAnalyticsParams } from "@shared/contracts/analytics";
import { getSalesAnalyticsFn } from "@/api/analytics.functions";

export async function getSalesAnalytics(params?: SalesAnalyticsParams): Promise<SalesAnalyticsDTO> {
  return getSalesAnalyticsFn({ data: params });
}
