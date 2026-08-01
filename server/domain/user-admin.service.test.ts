import { describe, expect, it, vi } from "vitest";
import { UserAdminService } from "@server/domain/user-admin.service";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { AdminUserDTO } from "@shared/contracts/user-admin";

function makeUser(overrides: Partial<AdminUserDTO> = {}): AdminUserDTO {
  return {
    id: "user-1",
    fullName: "Покупатель",
    phone: null,
    roles: ["customer"],
    adminScopes: [],
    isBlocked: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IUserAdminRepository> = {}): IUserAdminRepository {
  return {
    listUsers: vi.fn(async () => []),
    getById: vi.fn(async () => makeUser()),
    assignRole: vi.fn(async () => {}),
    revokeRole: vi.fn(async () => {}),
    assignScope: vi.fn(async () => {}),
    revokeScope: vi.fn(async () => {}),
    setBlocked: vi.fn(async () => {}),
    ...overrides,
  };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("UserAdminService", () => {
  it("assignRole delegates to the repository and publishes role.assigned", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new UserAdminService(repo, events);

    await service.assignRole("user-1", "seller");

    expect(repo.assignRole).toHaveBeenCalledWith("user-1", "seller");
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.assigned",
      userId: "user-1",
      role: "seller",
    });
  });

  it("revokeRole delegates to the repository and publishes role.revoked", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new UserAdminService(repo, events);

    await service.revokeRole("user-1", "seller");

    expect(repo.revokeRole).toHaveBeenCalledWith("user-1", "seller");
    expect(events.publish).toHaveBeenCalledWith({
      type: "role.revoked",
      userId: "user-1",
      role: "seller",
    });
  });

  it("assignScope/revokeScope delegate without publishing an event", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new UserAdminService(repo, events);

    await service.assignScope("user-1", "finance");
    await service.revokeScope("user-1", "finance");

    expect(repo.assignScope).toHaveBeenCalledWith("user-1", "finance");
    expect(repo.revokeScope).toHaveBeenCalledWith("user-1", "finance");
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("blockCustomer sets blocked=true and publishes customer.blocked", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new UserAdminService(repo, events);

    await service.blockCustomer("user-1");

    expect(repo.setBlocked).toHaveBeenCalledWith("user-1", true);
    expect(events.publish).toHaveBeenCalledWith({ type: "customer.blocked", userId: "user-1" });
  });

  it("unblockCustomer sets blocked=false and publishes customer.unblocked", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new UserAdminService(repo, events);

    await service.unblockCustomer("user-1");

    expect(repo.setBlocked).toHaveBeenCalledWith("user-1", false);
    expect(events.publish).toHaveBeenCalledWith({ type: "customer.unblocked", userId: "user-1" });
  });

  it("listUsers/getUser delegate to the repository", async () => {
    const users = [makeUser()];
    const repo = fakeRepo({ listUsers: vi.fn(async () => users) });
    const service = new UserAdminService(repo, fakeEventBus());

    expect(await service.listUsers()).toBe(users);
    expect(await service.getUser("user-1")).toEqual(makeUser());
  });
});
