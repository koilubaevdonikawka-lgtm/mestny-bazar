import type { AccountDeletionContext } from "@server/ports/account-deletion-policy.port";
import type { AccountDeletionBlockReason } from "@shared/contracts/account-deletion";

/** Outcome of the atomic erase — the blockers are re-checked inside the same transaction. */
export type EraseCustomerDataResult = "ERASED" | AccountDeletionBlockReason;

export interface IAccountDeletionRepository {
  getDeletionContext(userId: string): Promise<AccountDeletionContext>;

  /**
   * One transaction: re-checks the staff/active-order blockers, detaches and
   * anonymizes the user's (terminal) orders, deletes addresses, cart and device
   * tokens, and clears the profile's name/phone. Changes nothing when blocked.
   * Idempotent — a second call on an already-erased user is a no-op "ERASED".
   */
  eraseCustomerData(userId: string): Promise<EraseCustomerDataResult>;

  /** Deletes the auth user (and with it every login identity: Google, Telegram). */
  deleteAuthUser(userId: string): Promise<void>;
}
