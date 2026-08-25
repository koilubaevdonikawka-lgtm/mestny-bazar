import { describe, expect, it, vi } from "vitest";
import { CourierStatusService } from "@server/domain/courier-status.service";
import type { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: OrderStatus.READY_FOR_DELIVERY,
    paymentStatus: "unpaid",
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
    zoneId: null,
    deliveryTariffId: null,
    deliveryEtaMinMinutes: null,
    deliveryEtaMaxMinutes: null,
    deliveryLatitude: null,
    deliveryLongitude: null,
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
    setAvailability: vi.fn(async (courierId: string, isAvailable: boolean) => ({
      courierId,
      isAvailable,
      lastSeenAt: "2026-08-01T00:00:00.000Z",
    })),
    touch: vi.fn(),
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
    confirmPaid: vi.fn(),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),
    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    listByStatusesForCourier: vi.fn(async () => []),
    listByCourier: vi.fn(async () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 50,
      hasMore: false,
    })),
    listInPeriod: vi.fn(async () => []),
    ...overrides,
  } as IOrderRepository;
}

/** Задача №142 — OrderLifecycleCascadeService is a concrete class, not a port interface; cast like warehouse-order.service.test.ts's fakeCourierAssignment does for the same reason. */
function fakeOrderCascadeService(
  overrides: Partial<OrderLifecycleCascadeService> = {},
): OrderLifecycleCascadeService {
  return {
    checkAndTrigger: vi.fn(async () => {}),
    sweep: vi.fn(async () => {}),
    ...overrides,
  } as unknown as OrderLifecycleCascadeService;
}

describe("CourierStatusService.setAvailability", () => {
  it("delegates to the repository and publishes courier.status_changed", async () => {
    const repo = fakeCourierStatusRepo();
    const events = fakeEventBus();
    const orders = fakeOrderRepo();
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, events, orders, orderCascadeService);

    const result = await service.setAvailability("courier-1", false);

    expect(repo.setAvailability).toHaveBeenCalledWith("courier-1", false);
    expect(result.isAvailable).toBe(false);
    expect(events.publish).toHaveBeenCalledWith({
      type: "courier.status_changed",
      courierId: "courier-1",
      isAvailable: false,
    });
  });

  it("Задача №142 — going unavailable never triggers an assignment sweep", async () => {
    const repo = fakeCourierStatusRepo();
    const orders = fakeOrderRepo();
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, fakeEventBus(), orders, orderCascadeService);

    await service.setAvailability("courier-1", false);

    expect(repo.get).not.toHaveBeenCalled();
    expect(orders.listByStatuses).not.toHaveBeenCalled();
    expect(orderCascadeService.sweep).not.toHaveBeenCalled();
  });

  it("Задача №142 — a courier switching from unavailable to available triggers a sweep of unassigned READY_FOR_DELIVERY orders", async () => {
    const repo = fakeCourierStatusRepo({
      get: vi.fn(async () => ({
        courierId: "courier-1",
        isAvailable: false,
        lastSeenAt: "2026-08-01T00:00:00.000Z",
      })),
    });
    const readyUnassigned = makeOrder({ id: "order-1", assignedCourierId: null });
    const readyAssigned = makeOrder({ id: "order-2", assignedCourierId: "courier-9" });
    const orders = fakeOrderRepo({
      listByStatuses: vi.fn(async () => [readyUnassigned, readyAssigned]),
    });
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, fakeEventBus(), orders, orderCascadeService);

    await service.setAvailability("courier-1", true);

    expect(orders.listByStatuses).toHaveBeenCalledWith([OrderStatus.READY_FOR_DELIVERY]);
    expect(orderCascadeService.sweep).toHaveBeenCalledWith([readyUnassigned]);
  });

  it("Задача №142 — a courier already available toggling to available again does not re-trigger a sweep", async () => {
    const repo = fakeCourierStatusRepo({
      get: vi.fn(async () => ({
        courierId: "courier-1",
        isAvailable: true,
        lastSeenAt: "2026-08-01T00:00:00.000Z",
      })),
    });
    const orders = fakeOrderRepo();
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, fakeEventBus(), orders, orderCascadeService);

    await service.setAvailability("courier-1", true);

    expect(orderCascadeService.sweep).not.toHaveBeenCalled();
  });

  it("Задача №142 — a first-ever toggle to available (no prior status row) still triggers a sweep", async () => {
    const repo = fakeCourierStatusRepo({ get: vi.fn(async () => null) });
    const orders = fakeOrderRepo({
      listByStatuses: vi.fn(async () => [makeOrder({ assignedCourierId: null })]),
    });
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, fakeEventBus(), orders, orderCascadeService);

    await service.setAvailability("courier-1", true);

    expect(orderCascadeService.sweep).toHaveBeenCalled();
  });

  it("Задача №142 — the status-toggle still succeeds even if the assignment sweep throws", async () => {
    const repo = fakeCourierStatusRepo({ get: vi.fn(async () => null) });
    const orders = fakeOrderRepo({
      listByStatuses: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const orderCascadeService = fakeOrderCascadeService();
    const service = new CourierStatusService(repo, fakeEventBus(), orders, orderCascadeService);

    const result = await service.setAvailability("courier-1", true);

    expect(result.isAvailable).toBe(true);
  });
});
