import { createServerFn } from "@tanstack/react-start";
import type { BootstrapStatusDTO } from "@shared/contracts/bootstrap";

// No validator on either endpoint — neither takes client-supplied input. The claim
// target is always the caller's own resolved identity (requireUserIdFromRequest()
// inside the executor), never a client-supplied field (CD-01 — never trust
// client-supplied identity for a sensitive assignment).
export const getBootstrapStatusFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<BootstrapStatusDTO> => {
    const { executeGetBootstrapStatus } = await import("@server/functions/bootstrap.executor");
    return executeGetBootstrapStatus();
  },
);

export const claimBootstrapFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<BootstrapStatusDTO> => {
    const { executeClaimBootstrap } = await import("@server/functions/bootstrap.executor");
    return executeClaimBootstrap();
  },
);
