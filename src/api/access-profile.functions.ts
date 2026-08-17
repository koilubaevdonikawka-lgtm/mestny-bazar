import { createServerFn } from "@tanstack/react-start";
import type { AccessProfileDTO } from "@shared/contracts/access-profile";

export const getAccessProfileFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<AccessProfileDTO> => {
    const { executeGetAccessProfile } = await import("@server/functions/access-profile.executor");
    return executeGetAccessProfile();
  },
);
