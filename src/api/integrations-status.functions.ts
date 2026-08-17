import { createServerFn } from "@tanstack/react-start";
import type { IntegrationsStatusDTO } from "@shared/contracts/integrations";

export const getIntegrationsStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<IntegrationsStatusDTO> => {
    const { executeGetIntegrationsStatus } =
      await import("@server/functions/integrations-status.executor");
    return executeGetIntegrationsStatus();
  },
);
