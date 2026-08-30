import { describe, expect, it, vi } from "vitest";
import {
  BroadcastCooldownError,
  PushBroadcastService,
} from "@server/domain/push-broadcast.service";
import type { DeviceTokenDTO, IDeviceTokenRepository } from "@server/ports/device-token.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IPushBroadcastRepository } from "@server/ports/push-broadcast.repository";
import type { IPushNotifier } from "@server/ports/push-notifier.port";
import type { AdminUserDTO } from "@shared/contracts/user-admin";
import type { PushBroadcastDTO } from "@shared/contracts/push-broadcast";

function makeUser(overrides: Partial<AdminUserDTO> = {}): AdminUserDTO {
  return {
    id: "user-1",
    fullName: "Test User",
    phone: null,
    roles: ["customer"],
    adminScopes: [],
    isBlocked: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function makeBroadcast(overrides: Partial<PushBroadcastDTO> = {}): PushBroadcastDTO {
  return {
    id: "broadcast-1",
    title: "Title",
    body: "Body",
    recipientCount: 1,
    sentBy: "admin-1",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeDeviceTokens(userIds: string[]): IDeviceTokenRepository {
  return {
    upsert: vi.fn(async () => {}),
    listByUserId: vi.fn(async (): Promise<DeviceTokenDTO[]> => []),
    deleteByToken: vi.fn(async () => {}),
    listDistinctUserIds: vi.fn(async () => userIds),
  };
}

function fakeUserAdmin(users: AdminUserDTO[]): IUserAdminRepository {
  return {
    listUsers: vi.fn(async () => users),
    getById: vi.fn(async () => null),
    assignRole: vi.fn(async () => {}),
    revokeRole: vi.fn(async () => {}),
    assignScope: vi.fn(async () => {}),
    revokeScope: vi.fn(async () => {}),
    setBlocked: vi.fn(async () => {}),
  };
}

function fakeBroadcastRepo(
  overrides: Partial<IPushBroadcastRepository> = {},
): IPushBroadcastRepository {
  return {
    create: vi.fn(async (data) => makeBroadcast({ ...data })),
    getMostRecent: vi.fn(async () => null),
    ...overrides,
  };
}

function fakePush(): IPushNotifier & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    sendToUser: vi.fn(async (userId: string) => {
      calls.push(userId);
    }),
  };
}

describe("PushBroadcastService.getAudience", () => {
  it("excludes staff (admin/warehouse/courier/seller) even though they also carry the default 'customer' role", async () => {
    const users = [
      makeUser({ id: "customer-1", roles: ["customer"] }),
      makeUser({ id: "customer-2", roles: ["customer"] }),
      makeUser({ id: "staff-admin", roles: ["customer", "admin"] }),
      makeUser({ id: "staff-warehouse", roles: ["customer", "warehouse"] }),
      makeUser({ id: "staff-courier", roles: ["customer", "courier"] }),
      makeUser({ id: "staff-seller", roles: ["customer", "seller"] }),
    ];
    const deviceUserIds = users.map((u) => u.id);
    const service = new PushBroadcastService(
      fakeDeviceTokens(deviceUserIds),
      fakeUserAdmin(users),
      fakeBroadcastRepo(),
      fakePush(),
    );

    const audience = await service.getAudience();

    expect(audience.customerCount).toBe(2);
  });

  it("only counts users who actually have a device token, even if they are plain customers", async () => {
    const users = [makeUser({ id: "customer-1" }), makeUser({ id: "customer-2" })];
    const service = new PushBroadcastService(
      fakeDeviceTokens(["customer-1"]),
      fakeUserAdmin(users),
      fakeBroadcastRepo(),
      fakePush(),
    );

    const audience = await service.getAudience();

    expect(audience.customerCount).toBe(1);
  });

  it("reports no cooldown when no broadcast has ever been sent", async () => {
    const service = new PushBroadcastService(
      fakeDeviceTokens([]),
      fakeUserAdmin([]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => null) }),
      fakePush(),
    );

    const audience = await service.getAudience();

    expect(audience.cooldownRemainingSeconds).toBeNull();
    expect(audience.lastBroadcast).toBeNull();
  });

  it("reports a positive cooldown remaining right after a broadcast", async () => {
    const recent = makeBroadcast({ createdAt: new Date().toISOString() });
    const service = new PushBroadcastService(
      fakeDeviceTokens([]),
      fakeUserAdmin([]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => recent) }),
      fakePush(),
    );

    const audience = await service.getAudience();

    expect(audience.cooldownRemainingSeconds).not.toBeNull();
    expect(audience.cooldownRemainingSeconds).toBeGreaterThan(50);
    expect(audience.cooldownRemainingSeconds).toBeLessThanOrEqual(60);
  });

  it("reports no cooldown once the window has fully elapsed", async () => {
    const old = makeBroadcast({ createdAt: new Date(Date.now() - 120_000).toISOString() });
    const service = new PushBroadcastService(
      fakeDeviceTokens([]),
      fakeUserAdmin([]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => old) }),
      fakePush(),
    );

    const audience = await service.getAudience();

    expect(audience.cooldownRemainingSeconds).toBeNull();
  });
});

describe("PushBroadcastService.sendBroadcast", () => {
  it("sends to every resolved customer and records the broadcast with the attempted recipient count", async () => {
    const users = [
      makeUser({ id: "customer-1" }),
      makeUser({ id: "customer-2" }),
      makeUser({ id: "staff-1", roles: ["customer", "admin"] }),
    ];
    const push = fakePush();
    const createSpy = vi.fn(async (data: Parameters<IPushBroadcastRepository["create"]>[0]) =>
      makeBroadcast({ ...data }),
    );
    const service = new PushBroadcastService(
      fakeDeviceTokens(users.map((u) => u.id)),
      fakeUserAdmin(users),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => null), create: createSpy }),
      push,
    );

    const result = await service.sendBroadcast("Title", "Body", "admin-1");

    expect(push.calls.sort()).toEqual(["customer-1", "customer-2"]);
    expect(createSpy).toHaveBeenCalledWith({
      title: "Title",
      body: "Body",
      recipientCount: 2,
      sentBy: "admin-1",
    });
    expect(result.recipientCount).toBe(2);
  });

  it("throws BroadcastCooldownError and never sends when a broadcast was sent within the cooldown window", async () => {
    const recent = makeBroadcast({ createdAt: new Date().toISOString() });
    const push = fakePush();
    const service = new PushBroadcastService(
      fakeDeviceTokens(["customer-1"]),
      fakeUserAdmin([makeUser({ id: "customer-1" })]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => recent) }),
      push,
    );

    await expect(service.sendBroadcast("Title", "Body", "admin-1")).rejects.toThrow(
      BroadcastCooldownError,
    );
    expect(push.calls).toHaveLength(0);
  });

  it("allows sending again once the cooldown window has elapsed", async () => {
    const old = makeBroadcast({ createdAt: new Date(Date.now() - 120_000).toISOString() });
    const push = fakePush();
    const service = new PushBroadcastService(
      fakeDeviceTokens(["customer-1"]),
      fakeUserAdmin([makeUser({ id: "customer-1" })]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => old) }),
      push,
    );

    await expect(service.sendBroadcast("Title", "Body", "admin-1")).resolves.toBeDefined();
    expect(push.calls).toEqual(["customer-1"]);
  });

  it("still records the broadcast (with a 0 recipient count) when there is no audience", async () => {
    const createSpy = vi.fn(async (data: Parameters<IPushBroadcastRepository["create"]>[0]) =>
      makeBroadcast({ ...data }),
    );
    const push = fakePush();
    const service = new PushBroadcastService(
      fakeDeviceTokens([]),
      fakeUserAdmin([]),
      fakeBroadcastRepo({ getMostRecent: vi.fn(async () => null), create: createSpy }),
      push,
    );

    const result = await service.sendBroadcast("Title", "Body", "admin-1");

    expect(result.recipientCount).toBe(0);
    expect(push.calls).toHaveLength(0);
  });
});
