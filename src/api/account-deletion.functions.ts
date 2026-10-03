import { createServerFn } from "@tanstack/react-start";
import type { DeleteMyAccountResult } from "@shared/contracts/account-deletion";

export const deleteMyAccountFn = createServerFn({ method: "POST" }).handler(
  async (): Promise<DeleteMyAccountResult> => {
    const { executeDeleteMyAccount } = await import("@server/functions/account-deletion.executor");
    return executeDeleteMyAccount();
  },
);
