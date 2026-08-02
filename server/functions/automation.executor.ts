import type { AutomationOverviewDTO } from "@shared/contracts/automation";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "automation";

export async function executeGetAutomationOverview(): Promise<AutomationOverviewDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().automationOverviewService.getOverview();
}
