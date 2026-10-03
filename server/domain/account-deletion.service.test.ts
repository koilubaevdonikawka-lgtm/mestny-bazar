import { describe, expect, it, vi } from "vitest";
import { AccountDeletionService } from "@server/domain/account-deletion.service";
import { AccountDeletionIncompleteError } from "@server/domain/account-deletion.errors";
import type { IAccountDeletionRepository } from "@server/ports/account-deletion.repository";
import type {
  AccountDeletionContext,
  IAccountDeletionPolicy,
} from "@server/ports/account-deletion-policy.port";
import type { IExternalIdentityRevoker } from "@server/ports/external-identity-revoker.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";

const CONTEXT: AccountDeletionContext = {
  ownershipRole: null,
  accessRoles: ["customer"],
  rbacRoleCount: 0,
  adminScopeCount: 0,
  hasStaffFootprint: false,
  activeOrderCount: 0,
};

function setup(
  overrides: {
    repo?: Partial<IAccountDeletionRepository>;
    policy?: IAccountDeletionPolicy;
    revoker?: IExternalIdentityRevoker;
  } = {},
) {
  const calls: string[] = [];
  const repo: IAccountDeletionRepository = {
    getDeletionContext: vi.fn(async () => {
      calls.push("context");
      return CONTEXT;
    }),
    eraseCustomerData: vi.fn(async () => {
      calls.push("erase");
      return "ERASED" as const;
    }),
    deleteAuthUser: vi.fn(async () => {
      calls.push("deleteAuthUser");
    }),
    ...overrides.repo,
  };
  const policy: IAccountDeletionPolicy = overrides.policy ?? {
    can: vi.fn(() => ({ allowed: true })),
  };
  const revoker: IExternalIdentityRevoker = overrides.revoker ?? {
    revokeForUser: vi.fn(async () => {
      calls.push("revoke");
    }),
  };
  const events: IMarketplaceEventBus = {
    publish: vi.fn(async (_event: MarketplaceEvent) => {
      calls.push("event");
    }),
    subscribe: vi.fn(),
  };
  const service = new AccountDeletionService(repo, policy, revoker, events);
  return { service, repo, revoker, events, calls };
}

describe("AccountDeletionService.deleteOwnAccount", () => {
  it("erases data, revokes identities, deletes the auth user last, then publishes the audit event", async () => {
    const { service, repo, events, calls } = setup();

    const result = await service.deleteOwnAccount("user-1");

    expect(result).toEqual({ status: "deleted" });
    expect(calls).toEqual(["context", "erase", "revoke", "deleteAuthUser", "event"]);
    expect(repo.eraseCustomerData).toHaveBeenCalledWith("user-1");
    expect(repo.deleteAuthUser).toHaveBeenCalledWith("user-1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "customer.account_deleted",
      userId: "user-1",
    });
  });

  it.each(["STAFF_ACCOUNT", "ACTIVE_ORDERS"] as const)(
    "returns blocked (%s) from the policy without touching any data",
    async (denialCode) => {
      const { service, repo, events } = setup({
        policy: { can: () => ({ allowed: false, denialCode }) },
      });

      const result = await service.deleteOwnAccount("user-1");

      expect(result).toEqual({ status: "blocked", reason: denialCode });
      expect(repo.eraseCustomerData).not.toHaveBeenCalled();
      expect(repo.deleteAuthUser).not.toHaveBeenCalled();
      expect(events.publish).not.toHaveBeenCalled();
    },
  );

  it.each(["STAFF_ACCOUNT", "ACTIVE_ORDERS"] as const)(
    "honours the in-transaction re-check of the erase RPC (%s) and stops before the auth user",
    async (blocked) => {
      const { service, repo, events } = setup({
        repo: { eraseCustomerData: vi.fn(async () => blocked) },
      });

      const result = await service.deleteOwnAccount("user-1");

      expect(result).toEqual({ status: "blocked", reason: blocked });
      expect(repo.deleteAuthUser).not.toHaveBeenCalled();
      expect(events.publish).not.toHaveBeenCalled();
    },
  );

  it("throws (not blocked) on an unexpected policy denial", async () => {
    const { service, repo } = setup({
      policy: {
        can: () => ({ allowed: false, denialCode: "NO_MATCHING_RULE", message: "no rule" }),
      },
    });

    await expect(service.deleteOwnAccount("user-1")).rejects.toThrow("no rule");
    expect(repo.eraseCustomerData).not.toHaveBeenCalled();
  });

  it("propagates an erase failure without deleting the auth user", async () => {
    const { service, repo } = setup({
      repo: { eraseCustomerData: vi.fn(async () => Promise.reject(new Error("db down"))) },
    });

    await expect(service.deleteOwnAccount("user-1")).rejects.toThrow("db down");
    expect(repo.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("reports an incomplete deletion when the auth user can't be removed, and publishes nothing", async () => {
    const { service, events } = setup({
      repo: { deleteAuthUser: vi.fn(async () => Promise.reject(new Error("auth 500"))) },
    });

    await expect(service.deleteOwnAccount("user-1")).rejects.toBeInstanceOf(
      AccountDeletionIncompleteError,
    );
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("does not delete the auth user when identity revocation fails", async () => {
    const { service, repo } = setup({
      revoker: { revokeForUser: vi.fn(async () => Promise.reject(new Error("apple down"))) },
    });

    await expect(service.deleteOwnAccount("user-1")).rejects.toBeInstanceOf(
      AccountDeletionIncompleteError,
    );
    expect(repo.deleteAuthUser).not.toHaveBeenCalled();
  });

  it("only ever acts on the user id it was given", async () => {
    const { service, repo, revoker } = setup();

    await service.deleteOwnAccount("user-42");

    for (const fn of [
      repo.getDeletionContext,
      repo.eraseCustomerData,
      repo.deleteAuthUser,
      revoker.revokeForUser,
    ]) {
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("user-42");
    }
  });
});
