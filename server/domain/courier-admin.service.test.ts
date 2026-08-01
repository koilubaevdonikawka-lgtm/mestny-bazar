import { describe, expect, it, vi } from "vitest";
import { CourierAdminService } from "@server/domain/courier-admin.service";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";

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

describe("CourierAdminService.listCouriers", () => {
  it("merges courier status with each courier's active-delivery count", async () => {
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
    const service = new CourierAdminService(courierStatus, orders);

    const result = await service.listCouriers();

    expect(result).toEqual([
      {
        courierId: "c1",
        isAvailable: true,
        lastSeenAt: "2026-08-01T00:00:00.000Z",
        activeDeliveries: 2,
      },
      {
        courierId: "c2",
        isAvailable: false,
        lastSeenAt: "2026-08-01T00:05:00.000Z",
        activeDeliveries: 0,
      },
    ]);
  });
});
