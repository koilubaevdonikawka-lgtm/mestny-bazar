import { createServerFn } from "@tanstack/react-start";
import type { SecurityOverviewDTO } from "@shared/contracts/security";

export const getSecurityOverviewFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<SecurityOverviewDTO> => {
    const { executeGetSecurityOverview } =
      await import("@server/functions/security-overview.executor");
    return executeGetSecurityOverview();
  },
);
