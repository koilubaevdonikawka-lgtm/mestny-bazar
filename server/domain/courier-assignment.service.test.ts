import { describe, expect, it, vi } from "vitest";
import { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { ICourierAssignmentPolicy } from "@server/ports/courier-assignment.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: "CONFIRMED",
    paymentStatus: "paid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
    discountAmount: 0,
    couponCode: null,
    total: 100,
    currency: "KGS",
    customerName: "Buyer",
    customerPhone: "996700000000",
    addressSnapshot: "addr",
    notes: null,
    paymentUrl: null,
    items: [],
    createdAt: new Date().toISOString(),
    paidAt: null,
    assignedCourierId: null,
    ...overrides,
  };
}

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
    create: vi.fn(),
    getById: vi.fn(async () => null),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(),
    updatePaymentStatus: vi.fn(),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),
    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    listByStatusesForCourier: vi.fn(async () => []),
    listInPeriod: vi.fn(async () => []),
    ...overrides,
  } as IOrderRepository;
}

function fakePolicy(overrides: Partial<ICourierAssignmentPolicy> = {}): ICourierAssignmentPolicy {
  return { selectCourier: vi.fn(() => ({ courierId: null })), ...overrides };
}

function fakeEventBus(overrides: Partial<IMarketplaceEventBus> = {}): IMarketplaceEventBus {
  return {
    publish: vi.fn(async (_event: MarketplaceEvent) => {}),
    subscribe: vi.fn(),
    ...overrides,
  };
}

describe("CourierAssignmentService.assignCourier", () => {
  it("returns the order unchanged when it already has a courier", async () => {
    const orderRepo = fakeOrderRepo();
    const service = new CourierAssignmentService(
      fakeCourierStatusRepo(),
      orderRepo,
      fakePolicy(),
      fakeEventBus(),
    );
    const order = makeOrder({ assignedCourierId: "courier-1" });

    const result = await service.assignCourier(order);

    expect(result).toBe(order);
    expect(orderRepo.assignCourier).not.toHaveBeenCalled();
  });

  it("returns null when no couriers are available", async () => {
    const courierStatus = fakeCourierStatusRepo({ listAvailable: vi.fn(async () => []) });
    const service = new CourierAssignmentService(
      courierStatus,
      fakeOrderRepo(),
      fakePolicy(),
      fakeEventBus(),
    );

    expect(await service.assignCourier(makeOrder())).toBeNull();
  });

  it("returns null when the policy picks no one", async () => {
    const courierStatus = fakeCourierStatusRepo({
      listAvailable: vi.fn(async () => [{ courierId: "c1", isAvailable: true, lastSeenAt: "" }]),
    });
    const policy = fakePolicy({ selectCourier: vi.fn(() => ({ courierId: null })) });
    const service = new CourierAssignmentService(
      courierStatus,
      fakeOrderRepo(),
      policy,
      fakeEventBus(),
    );

    expect(await service.assignCourier(makeOrder())).toBeNull();
  });

  it("assigns the picked courier, persists it, and publishes courier.assigned", async () => {
    const courierStatus = fakeCourierStatusRepo({
      listAvailable: vi.fn(async () => [{ courierId: "c1", isAvailable: true, lastSeenAt: "" }]),
    });
    const orderRepo = fakeOrderRepo();
    const policy = fakePolicy({ selectCourier: vi.fn(() => ({ courierId: "c1" })) });
    const events = fakeEventBus();
    const service = new CourierAssignmentService(courierStatus, orderRepo, policy, events);
    const order = makeOrder();

    const result = await service.assignCourier(order);

    expect(orderRepo.assignCourier).toHaveBeenCalledWith(order.id, "c1");
    expect(result?.assignedCourierId).toBe("c1");
    expect(events.publish).toHaveBeenCalledWith({
      type: "courier.assigned",
      order: expect.objectContaining({ assignedCourierId: "c1" }),
      courierId: "c1",
    });
  });

  it("does not publish courier.assigned when it loses the concurrent-assignment race", async () => {
    const courierStatus = fakeCourierStatusRepo({
      listAvailable: vi.fn(async () => [{ courierId: "c1", isAvailable: true, lastSeenAt: "" }]),
    });
    // Simulates another caller winning the atomic assign — persisted result carries a different courierId.
    const orderRepo = fakeOrderRepo({
      assignCourier: vi.fn(async () => makeOrder({ assignedCourierId: "someone-else" })),
    });
    const policy = fakePolicy({ selectCourier: vi.fn(() => ({ courierId: "c1" })) });
    const events = fakeEventBus();
    const service = new CourierAssignmentService(courierStatus, orderRepo, policy, events);

    const result = await service.assignCourier(makeOrder());

    expect(result?.assignedCourierId).toBe("someone-else");
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("passes each available courier's active-delivery count as a candidate to the policy", async () => {
    const courierStatus = fakeCourierStatusRepo({
      listAvailable: vi.fn(async () => [
        { courierId: "c1", isAvailable: true, lastSeenAt: "" },
        { courierId: "c2", isAvailable: true, lastSeenAt: "" },
      ]),
    });
    const orderRepo = fakeOrderRepo({
      countActiveDeliveriesByCourier: vi.fn(async (courierId: string) =>
        courierId === "c1" ? 3 : 0,
      ),
    });
    const policy = fakePolicy();
    const service = new CourierAssignmentService(courierStatus, orderRepo, policy, fakeEventBus());

    await service.assignCourier(makeOrder());

    expect(policy.selectCourier).toHaveBeenCalledWith(
      expect.objectContaining({
        candidates: expect.arrayContaining([
          { courierId: "c1", activeDeliveries: 3 },
          { courierId: "c2", activeDeliveries: 0 },
        ]),
      }),
    );
  });
});
