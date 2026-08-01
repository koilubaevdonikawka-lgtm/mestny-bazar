import { describe, expect, it, vi } from "vitest";
import { OrderLifecycleCascadeService } from "@server/domain/order-lifecycle-cascade.service";
import { CourierAssignmentService } from "@server/domain/courier-assignment.service";
import type { IOrderCascadeRepository } from "@server/ports/order-cascade.repository";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { ICourierAssignmentPolicy } from "@server/ports/courier-assignment.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { CUSTOMER_CANCELLATION_WINDOW_MS } from "@shared/lib/order-cancellation";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: OrderStatus.CREATED,
    paymentStatus: "unpaid",
    paymentMethod: "CASH",
    subtotal: 100,
    deliveryFee: 0,
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

function fakeCascadeRepo(
  overrides: Partial<IOrderCascadeRepository> = {},
): IOrderCascadeRepository {
  return { claim: vi.fn(async () => true), ...overrides };
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
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),
    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    listByStatusesForCourier: vi.fn(async () => []),
    ...overrides,
  } as IOrderRepository;
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

function fakeAssignmentPolicy(
  overrides: Partial<ICourierAssignmentPolicy> = {},
): ICourierAssignmentPolicy {
  return { selectCourier: vi.fn(() => ({ courierId: null })), ...overrides };
}

/** No available couriers by default — checkAndTrigger's assignment attempt is then a safe no-op for tests focused purely on the buffer-cascade behavior. */
function buildService(deps: {
  cascadeRepo?: IOrderCascadeRepository;
  events?: IMarketplaceEventBus;
  orderRepo?: IOrderRepository;
  courierStatusRepo?: ICourierStatusRepository;
  assignmentPolicy?: ICourierAssignmentPolicy;
}) {
  const events = deps.events ?? fakeEventBus();
  const courierAssignment = new CourierAssignmentService(
    deps.courierStatusRepo ?? fakeCourierStatusRepo(),
    deps.orderRepo ?? fakeOrderRepo(),
    deps.assignmentPolicy ?? fakeAssignmentPolicy(),
    events,
  );
  return new OrderLifecycleCascadeService(
    deps.cascadeRepo ?? fakeCascadeRepo(),
    events,
    courierAssignment,
  );
}

const EXPIRED_CREATED_AT = new Date(
  Date.now() - CUSTOMER_CANCELLATION_WINDOW_MS - 1000,
).toISOString();
const FRESH_CREATED_AT = new Date().toISOString();

describe("OrderLifecycleCascadeService.checkAndTrigger — buffer gate", () => {
  it("does nothing while the order is still within its cancellation buffer", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = buildService({ cascadeRepo, events });

    await service.checkAndTrigger(makeOrder({ createdAt: FRESH_CREATED_AT }));

    expect(cascadeRepo.claim).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("claims and publishes order.operational_cascade_started once the buffer has expired", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = buildService({ cascadeRepo, events });
    const order = makeOrder({ createdAt: EXPIRED_CREATED_AT });

    await service.checkAndTrigger(order);

    expect(cascadeRepo.claim).toHaveBeenCalledWith(order.id);
    expect(events.publish).toHaveBeenCalledWith({
      type: "order.operational_cascade_started",
      order,
    });
  });

  it("does not publish when another caller already claimed the cascade", async () => {
    const cascadeRepo = fakeCascadeRepo({ claim: vi.fn(async () => false) });
    const events = fakeEventBus();
    const service = buildService({ cascadeRepo, events });

    await service.checkAndTrigger(makeOrder({ createdAt: EXPIRED_CREATED_AT }));

    expect(events.publish).not.toHaveBeenCalled();
  });

  it("does not claim/publish the cascade for an order whose status is no longer CREATED/PAID", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = buildService({ cascadeRepo, events });

    await service.checkAndTrigger(
      makeOrder({ createdAt: EXPIRED_CREATED_AT, status: OrderStatus.CONFIRMED }),
    );

    expect(cascadeRepo.claim).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });
});

describe("OrderLifecycleCascadeService.checkAndTrigger — courier auto-assignment", () => {
  it("attempts assignment for a CONFIRMED order without a courier yet", async () => {
    const orderRepo = fakeOrderRepo();
    const courierStatusRepo = fakeCourierStatusRepo({
      listAvailable: vi.fn(async () => [
        { courierId: "courier-1", isAvailable: true, lastSeenAt: "" },
      ]),
    });
    const assignmentPolicy = fakeAssignmentPolicy({
      selectCourier: vi.fn(() => ({ courierId: "courier-1" })),
    });
    const events = fakeEventBus();
    const service = buildService({ orderRepo, courierStatusRepo, assignmentPolicy, events });
    const order = makeOrder({ status: OrderStatus.CONFIRMED, assignedCourierId: null });

    await service.checkAndTrigger(order);

    expect(orderRepo.assignCourier).toHaveBeenCalledWith(order.id, "courier-1");
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "courier.assigned", courierId: "courier-1" }),
    );
  });

  it("does not attempt assignment when the order already has a courier", async () => {
    const orderRepo = fakeOrderRepo();
    const service = buildService({ orderRepo });
    const order = makeOrder({ status: OrderStatus.CONFIRMED, assignedCourierId: "courier-1" });

    await service.checkAndTrigger(order);

    expect(orderRepo.assignCourier).not.toHaveBeenCalled();
  });

  it("does not attempt assignment for a status outside the eligible set (e.g. CREATED)", async () => {
    const orderRepo = fakeOrderRepo();
    const service = buildService({ orderRepo });
    const order = makeOrder({ status: OrderStatus.CREATED, assignedCourierId: null });

    await service.checkAndTrigger(order);

    expect(orderRepo.assignCourier).not.toHaveBeenCalled();
  });
});

describe("OrderLifecycleCascadeService.sweep", () => {
  it("checks every order in the batch, isolating individual failures", async () => {
    const cascadeRepo = fakeCascadeRepo();
    const events = fakeEventBus();
    const service = buildService({ cascadeRepo, events });
    const orders = [
      makeOrder({ id: "a", createdAt: EXPIRED_CREATED_AT }),
      makeOrder({ id: "b", createdAt: FRESH_CREATED_AT }),
    ];

    await service.sweep(orders);

    expect(cascadeRepo.claim).toHaveBeenCalledTimes(1);
    expect(cascadeRepo.claim).toHaveBeenCalledWith("a");
  });

  it("does not reject when an individual order's claim throws", async () => {
    const cascadeRepo = fakeCascadeRepo({
      claim: vi.fn(async () => {
        throw new Error("db down");
      }),
    });
    const service = buildService({ cascadeRepo });

    await expect(
      service.sweep([makeOrder({ createdAt: EXPIRED_CREATED_AT })]),
    ).resolves.toBeUndefined();
  });
});
