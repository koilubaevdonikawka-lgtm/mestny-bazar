import type { DeleteMyAccountResult } from "@shared/contracts/account-deletion";
import { deleteMyAccountFn } from "@/api/account-deletion.functions";

export async function deleteMyAccount(): Promise<DeleteMyAccountResult> {
  return deleteMyAccountFn();
}
