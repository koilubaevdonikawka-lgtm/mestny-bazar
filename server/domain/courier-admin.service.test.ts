import { describe, expect, it, vi } from "vitest";
import { CourierAdminService } from "@server/domain/courier-admin.service";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { ICourierProfileRepository } from "@server/ports/courier-profile.repository";
import type { CourierProfileDTO } from "@shared/contracts/courier-profile";

function fakeCourierStatusRepo(
  overrides: Partial<ICourierStatusRepository> = {},
): ICourierStatusRepository {
  return {
    listAvailable: vi.fn(async () => []),
    listAll: vi.fn(async () => []),
    get: vi.fn(async () => null),
    setAvailability: vi.fn(),
    touch: vi.fn(),
    ...overrides,
  };
}

function fakeOrderRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    ...overrides,
  } as IOrderRepository;
}

function fakeProfile(overrides: Partial<CourierProfileDTO> = {}): CourierProfileDTO {
  return {
    userId: "c1",
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
    createdAt: "2026-08-01T00:00:00.000Z",
    updatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

function fakeCourierProfileRepo(
  overrides: Partial<ICourierProfileRepository> = {},
): ICourierProfileRepository {
  return {
    list: vi.fn(async () => []),
    getByUserId: vi.fn(async () => null),
    create: vi.fn(),
    update: vi.fn(),
    setStatus: vi.fn(),
    bulkSetStatus: vi.fn(),
    listBlockedCourierIds: vi.fn(async () => []),
    ...overrides,
  } as ICourierProfileRepository;
}

describe("CourierAdminService.listCouriers", () => {
  it("merges courier profiles with live status and each courier's active-delivery count", async () => {
    const courierProfiles = fakeCourierProfileRepo({
      list: vi.fn(async () => [fakeProfile({ userId: "c1" }), fakeProfile({ userId: "c2" })]),
    });
    const courierStatus = fakeCourierStatusRepo({
      listAll: vi.fn(async () => [
        { courierId: "c1", isAvailable: true, lastSeenAt: "2026-08-01T00:00:00.000Z" },
        { courierId: "c2", isAvailable: false, lastSeenAt: "2026-08-01T00:05:00.000Z" },
      ]),
    });
    const orders = fakeOrderRepo({
      countActiveDeliveriesByCourier: vi.fn(async (courierId: string) =>
        courierId === "c1" ? 2 : 0,
      ),
    });
    const service = new CourierAdminService(courierStatus, orders, courierProfiles);

    const result = await service.listCouriers();

    expect(result).toEqual([
      expect.objectContaining({
        userId: "c1",
        isAvailable: true,
        lastSeenAt: "2026-08-01T00:00:00.000Z",
        activeDeliveries: 2,
      }),
      expect.objectContaining({
        userId: "c2",
        isAvailable: false,
        lastSeenAt: "2026-08-01T00:05:00.000Z",
        activeDeliveries: 0,
      }),
    ]);
  });

  it("defaults isAvailable=false and lastSeenAt=null when a profile has no courier_status row yet", async () => {
    const courierProfiles = fakeCourierProfileRepo({
      list: vi.fn(async () => [fakeProfile({ userId: "c3" })]),
    });
    const courierStatus = fakeCourierStatusRepo({ listAll: vi.fn(async () => []) });
    const orders = fakeOrderRepo();
    const service = new CourierAdminService(courierStatus, orders, courierProfiles);

    const result = await service.listCouriers();

    expect(result).toEqual([
      expect.objectContaining({ userId: "c3", isAvailable: false, lastSeenAt: null }),
    ]);
  });
});
