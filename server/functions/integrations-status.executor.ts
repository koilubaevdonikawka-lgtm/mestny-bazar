import type { IntegrationsStatusDTO } from "@shared/contracts/integrations";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "integrations";

export async function executeGetIntegrationsStatus(): Promise<IntegrationsStatusDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });
  return getServices().integrationsStatusService.getStatus();
}
