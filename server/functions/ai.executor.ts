import type { AIWorkersStatusDTO } from "@shared/contracts/ai";
import { requireAdminFromRequest } from "@server/auth/resolve-user";
import { getServices } from "@server/di/container";

const MODULE = "ai";

export async function executeGetAIWorkersStatus(): Promise<AIWorkersStatusDTO> {
  const { userId, roles } = await requireAdminFromRequest();
  getServices().permissionPolicy.assert({ actor: { id: userId, roles }, module: MODULE });

  const workers = getServices()
    .aiWorkers.getWorkers()
    .map((worker) => ({ id: worker.id }));

  return {
    workers,
    triggerEvent: "product.published",
    resultsPersisted: false,
  };
}
