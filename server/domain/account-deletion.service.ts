import type { IAccountDeletionRepository } from "@server/ports/account-deletion.repository";
import type { IAccountDeletionPolicy } from "@server/ports/account-deletion-policy.port";
import type { IExternalIdentityRevoker } from "@server/ports/external-identity-revoker.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { DeleteMyAccountResult } from "@shared/contracts/account-deletion";
import { AccountDeletionIncompleteError } from "@server/domain/account-deletion.errors";
import { logger } from "@shared/observability/logger";

/**
 * Self-service account deletion (App Store 5.1.1(v), Google Play account deletion
 * policy). `userId` always comes from the caller's own verified session — the
 * executor never accepts it from the request.
 *
 * Order of steps, and what a failure at each one leaves behind:
 * 1. Policy check on a fresh context read — blocked → nothing changed.
 * 2. Atomic erase RPC, which re-checks the same blockers in its own transaction —
 *    any error rolls the whole erase back → nothing changed.
 * 3. External identity revocation (Sign in with Apple, future) — on failure the
 *    erase is already committed, the account still exists and the request can be
 *    repeated.
 * 4. Auth user deletion (Supabase Admin API), last, because orders.user_id is
 *    ON DELETE RESTRICT and only step 2 detaches them — on failure the account is
 *    a valid, empty customer account; repeating the request completes it.
 * 5. Audit event with the technical user id only.
 */
export class AccountDeletionService {
  constructor(
    private readonly accounts: IAccountDeletionRepository,
    private readonly policy: IAccountDeletionPolicy,
    private readonly identityRevoker: IExternalIdentityRevoker,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async deleteOwnAccount(userId: string): Promise<DeleteMyAccountResult> {
    const context = await this.accounts.getDeletionContext(userId);
    const decision = this.policy.can(context);
    if (!decision.allowed) {
      if (decision.denialCode === "STAFF_ACCOUNT" || decision.denialCode === "ACTIVE_ORDERS") {
        return { status: "blocked", reason: decision.denialCode };
      }
      throw new Error(decision.message ?? "Account deletion policy denied the request");
    }

    const erased = await this.accounts.eraseCustomerData(userId);
    if (erased !== "ERASED") {
      return { status: "blocked", reason: erased };
    }

    try {
      await this.identityRevoker.revokeForUser(userId);
      await this.accounts.deleteAuthUser(userId);
    } catch (error) {
      logger.error("account-deletion:auth-step-failed", { userId, error });
      throw new AccountDeletionIncompleteError();
    }

    await this.events.publish({ type: "customer.account_deleted", userId });
    return { status: "deleted" };
  }
}
