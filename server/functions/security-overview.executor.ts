import type { SecurityOverviewDTO } from "@shared/contracts/security";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "security";

export async function executeGetSecurityOverview(): Promise<SecurityOverviewDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().securityOverviewService.getOverview();
}
