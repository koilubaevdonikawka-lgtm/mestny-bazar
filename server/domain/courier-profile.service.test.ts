import { describe, expect, it, vi } from "vitest";
import { CourierProfileService } from "@server/domain/courier-profile.service";
import {
  CourierProfileAlreadyExistsError,
  CourierProfileValidationError,
} from "@server/domain/courier-profile.errors";
import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { IUserAdminRepository } from "@server/ports/user-admin.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { CourierProfileDTO } from "@shared/contracts/courier-profile";
import type { AdminUserDTO } from "@shared/contracts/user-admin";

function makeProfile(overrides: Partial<CourierProfileDTO> = {}): CourierProfileDTO {
  return {
    userId: "courier-1",
    lastName: "Иванов",
    firstName: "Иван",
    middleName: null,
    phone: "+996700000000",
    vehicleType: "ON_FOOT",
    plateNumber: null,
    serviceZoneId: null,
    status: "ACTIVE",
    hiredAt: null,
    adminComment: null,
    photoUrl: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeUser(overrides: Partial<AdminUserDTO> = {}): AdminUserDTO {
  return {
    id: "courier-1",
    fullName: "Иван Иванов",
    phone: "+996700000000",
    roles: ["customer"],
    adminScopes: [],
    isBlocked: false,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function fakeProfiles(
  overrides: Partial<ICourierProfileRepository> = {},
): ICourierProfileRepository {
  return {
    list: vi.fn(async () => []),
    getByUserId: vi.fn(async () => null),
    create: vi.fn(async () => makeProfile()),
    update: vi.fn(async () => makeProfile()),
    setStatus: vi.fn(async () => makeProfile()),
    bulkSetStatus: vi.fn(),
    listBlockedCourierIds: vi.fn(async () => []),
    ...overrides,
  } as ICourierProfileRepository;
}

function fakeUserAdmin(overrides: Partial<IUserAdminRepository> = {}): IUserAdminRepository {
  return {
    listUsers: vi.fn(async () => []),
    getById: vi.fn(async () => makeUser()),
    assignRole: vi.fn(),
    revokeRole: vi.fn(),
    assignScope: vi.fn(),
    revokeScope: vi.fn(),
    setBlocked: vi.fn(),
    ...overrides,
  } as IUserAdminRepository;
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("CourierProfileService.createCourier", () => {
  it("assigns the courier role before creating the profile, then publishes courier.created", async () => {
    const calls: string[] = [];
    const userAdmin = fakeUserAdmin({
      assignRole: vi.fn(async () => {
        calls.push("assignRole");
      }),
    });
    const profiles = fakeProfiles({
      create: vi.fn(async () => {
        calls.push("create");
        return makeProfile();
      }),
    });
    const events = fakeEventBus();
    const service = new CourierProfileService(profiles, userAdmin, events);

    await service.createCourier(
      { userId: "courier-1", lastName: "Иванов", firstName: "Иван", phone: "+996700000000" },
      "admin-1",
    );

    expect(calls).toEqual(["assignRole", "create"]);
    expect(userAdmin.assignRole).toHaveBeenCalledWith("courier-1", "courier");
    expect(events.publish).toHaveBeenCalledWith({ type: "courier.created", userId: "courier-1" });
  });

  it("rejects when the target user does not exist", async () => {
    const userAdmin = fakeUserAdmin({ getById: vi.fn(async () => null) });
    const profiles = fakeProfiles();
    const service = new CourierProfileService(profiles, userAdmin, fakeEventBus());

    await expect(
      service.createCourier(
        { userId: "ghost", lastName: "Иванов", firstName: "Иван", phone: "+996700000000" },
        "admin-1",
      ),
    ).rejects.toBeInstanceOf(CourierProfileValidationError);
    expect(profiles.create).not.toHaveBeenCalled();
  });

  it("rejects when a profile already exists for this user", async () => {
    const userAdmin = fakeUserAdmin();
    const profiles = fakeProfiles({ getByUserId: vi.fn(async () => makeProfile()) });
    const service = new CourierProfileService(profiles, userAdmin, fakeEventBus());

    await expect(
      service.createCourier(
        { userId: "courier-1", lastName: "Иванов", firstName: "Иван", phone: "+996700000000" },
        "admin-1",
      ),
    ).rejects.toBeInstanceOf(CourierProfileAlreadyExistsError);
    expect(userAdmin.assignRole).not.toHaveBeenCalled();
  });

  it("rejects a missing last/first name before touching the repository", async () => {
    const service = new CourierProfileService(fakeProfiles(), fakeUserAdmin(), fakeEventBus());

    await expect(
      service.createCourier(
        { userId: "courier-1", lastName: "", firstName: "Иван", phone: "+996700000000" },
        "admin-1",
      ),
    ).rejects.toBeInstanceOf(CourierProfileValidationError);
  });
});

describe("CourierProfileService.blockCourier / unblockCourier", () => {
  it("blockCourier sets BLOCKED and publishes courier.blocked", async () => {
    const profiles = fakeProfiles({
      setStatus: vi.fn(async () => makeProfile({ status: "BLOCKED" })),
    });
    const events = fakeEventBus();
    const service = new CourierProfileService(profiles, fakeUserAdmin(), events);

    await service.blockCourier("courier-1");

    expect(profiles.setStatus).toHaveBeenCalledWith("courier-1", "BLOCKED");
    expect(events.publish).toHaveBeenCalledWith({ type: "courier.blocked", userId: "courier-1" });
  });

  it("unblockCourier sets ACTIVE and publishes courier.unblocked", async () => {
    const profiles = fakeProfiles({
      setStatus: vi.fn(async () => makeProfile({ status: "ACTIVE" })),
    });
    const events = fakeEventBus();
    const service = new CourierProfileService(profiles, fakeUserAdmin(), events);

    await service.unblockCourier("courier-1");

    expect(profiles.setStatus).toHaveBeenCalledWith("courier-1", "ACTIVE");
    expect(events.publish).toHaveBeenCalledWith({ type: "courier.unblocked", userId: "courier-1" });
  });
});
