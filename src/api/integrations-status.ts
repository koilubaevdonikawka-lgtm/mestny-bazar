import type { IntegrationsStatusDTO } from "@shared/contracts/integrations";
import { getIntegrationsStatusFn } from "@/api/integrations-status.functions";

export async function getIntegrationsStatus(): Promise<IntegrationsStatusDTO> {
  return getIntegrationsStatusFn();
}
