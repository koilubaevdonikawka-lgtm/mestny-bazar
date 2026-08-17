import type { SalesAnalyticsDTO, SalesAnalyticsParams } from "@shared/contracts/analytics";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "analytics";

export async function executeGetSalesAnalytics(
  params?: SalesAnalyticsParams,
): Promise<SalesAnalyticsDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().analyticsService.getSalesAnalytics(params);
}
