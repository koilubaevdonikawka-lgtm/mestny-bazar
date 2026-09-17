import { describe, expect, it, vi } from "vitest";
import { CourierOrderService } from "@server/domain/courier-order.service";
import { ForbiddenError, OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { ICourierStatusRepository } from "@server/ports/courier-status.repository";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    userId: null,
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

function fakeRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    create: vi.fn(async () => makeOrder()),
    getById: vi.fn(async () => makeOrder()),
    getForAssembly: vi.fn(async () => makeOrder()),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(async (_id, _from, status) => makeOrder({ status })),
    updatePaymentStatus: vi.fn(async () => makeOrder()),
    confirmPaid: vi.fn(async () => makeOrder()),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),
    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),
    countActiveDeliveriesByCourier: vi.fn(async () => 0),
    markCashCollected: vi.fn(async () => makeOrder()),
    getCashCollectedTodayByCourier: vi.fn(async () => 0),
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
  };
}

function fakeLifecycle(overrides: Partial<IOrderLifecyclePolicy> = {}): IOrderLifecyclePolicy {
  return {
    canTransition: vi.fn(() => ({ allowed: true })),
    assertCanTransition: vi.fn(() => {}),
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

function fakeCourierStatusRepo(
  overrides: Partial<ICourierStatusRepository> = {},
): ICourierStatusRepository {
  return {
    listAvailable: vi.fn(async () => []),
    listAll: vi.fn(async () => []),
    get: vi.fn(async () => null),
    setAvailability: vi.fn(async () => ({
      courierId: "courier-1",
      isAvailable: true,
      lastSeenAt: "",
    })),
    touch: vi.fn(async () => {}),
    ...overrides,
  };
}

const courier = { id: "courier-1", roles: ["courier" as const] };

function buildService(deps: {
  repo?: IOrderRepository;
  lifecycle?: IOrderLifecyclePolicy;
  events?: IMarketplaceEventBus;
  courierStatus?: ICourierStatusRepository;
}) {
  return new CourierOrderService(
    deps.repo ?? fakeRepo(),
    deps.lifecycle ?? fakeLifecycle(),
    deps.events ?? fakeEventBus(),
    deps.courierStatus ?? fakeCourierStatusRepo(),
  );
}

describe("CourierOrderService", () => {
  it("listDeliveryOrders queries only this courier's orders in the delivery-queue statuses", async () => {
    const repo = fakeRepo();
    const courierStatus = fakeCourierStatusRepo();
    const service = buildService({ repo, courierStatus });

    await service.listDeliveryOrders(courier);

    expect(repo.listByStatusesForCourier).toHaveBeenCalledWith(
      [
        OrderStatus.READY_FOR_DELIVERY,
        OrderStatus.ASSEMBLING,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.ARRIVED,
      ],
      courier.id,
    );
    expect(courierStatus.touch).toHaveBeenCalledWith(courier.id);
  });

  it("Задача №135 — getOrder returns the order when it's assigned to this courier", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: courier.id })),
    });
    const service = buildService({ repo });

    await expect(service.getOrder("order-1", courier)).resolves.toMatchObject({
      assignedCourierId: courier.id,
    });
  });

  it("Задача №135 — getOrder returns an unclaimed READY_FOR_DELIVERY order (acceptOrder's own free-claim case)", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({ assignedCourierId: null, status: OrderStatus.READY_FOR_DELIVERY }),
      ),
    });
    const service = buildService({ repo });

    await expect(service.getOrder("order-1", courier)).resolves.toMatchObject({
      assignedCourierId: null,
    });
  });

  it("Задача №135 — getOrder throws ForbiddenError for an order assigned to a different courier", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: "someone-else" })),
    });
    const service = buildService({ repo });

    await expect(service.getOrder("order-1", courier)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("Задача №135 — getOrder throws ForbiddenError for an unclaimed order NOT in READY_FOR_DELIVERY", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({ assignedCourierId: null, status: OrderStatus.ASSEMBLING }),
      ),
    });
    const service = buildService({ repo });

    await expect(service.getOrder("order-1", courier)).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("acceptOrder validates the transition and persists the assignment when the order is unassigned", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => makeOrder({ assignedCourierId: null })) });
    const lifecycle = fakeLifecycle();
    const events = fakeEventBus();
    const service = buildService({ repo, lifecycle, events });

    await service.acceptOrder("order-1", courier);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        targetStatus: OrderStatus.READY_FOR_DELIVERY,
        reason: "courier_accept",
      }),
    );
    expect(repo.assignCourier).toHaveBeenCalledWith("order-1", courier.id);
    expect(repo.updateStatus).not.toHaveBeenCalled();
    expect(events.publish).toHaveBeenCalledWith({
      type: "courier.assigned",
      order: expect.objectContaining({ assignedCourierId: courier.id }),
      courierId: courier.id,
    });
  });

  it("acceptOrder is a no-op claim when the order is already assigned to this same courier", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: courier.id })),
    });
    const events = fakeEventBus();
    const service = buildService({ repo, events });

    const result = await service.acceptOrder("order-1", courier);

    expect(result.assignedCourierId).toBe(courier.id);
    expect(repo.assignCourier).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("acceptOrder throws ForbiddenError when the order is assigned to a different courier", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: "someone-else" })),
    });
    const service = buildService({ repo });

    await expect(service.acceptOrder("order-1", courier)).rejects.toBeInstanceOf(ForbiddenError);
    expect(repo.assignCourier).not.toHaveBeenCalled();
  });

  it("acceptOrder throws OrderNotFoundError for a nonexistent order", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = buildService({ repo });

    await expect(service.acceptOrder("missing", courier)).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });

  it("startDelivery updates status to OUT_FOR_DELIVERY and publishes order.out_for_delivery", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: courier.id })),
    });
    const events = fakeEventBus();
    const service = buildService({ repo, events });

    await service.startDelivery("order-1", courier);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.OUT_FOR_DELIVERY,
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.out_for_delivery" }),
    );
  });

  it("Задача №135 — startDelivery passes assignedCourierId through to the lifecycle policy", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: courier.id })),
    });
    const lifecycle = fakeLifecycle();
    const service = buildService({ repo, lifecycle });

    await service.startDelivery("order-1", courier);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ assignedCourierId: courier.id }),
    );
  });

  it("Задача №135 — startDelivery is rejected end-to-end when the order is assigned to a different courier", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () => makeOrder({ assignedCourierId: "someone-else" })),
    });
    const service = buildService({ repo });

    await expect(service.startDelivery("order-1", courier)).rejects.toBeInstanceOf(ForbiddenError);
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("markArrival does not update status when the lifecycle policy denies it", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = buildService({ repo, lifecycle });

    await expect(service.markArrival("order-1", courier)).rejects.toThrow("denied");
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("markArrival publishes order.arrived once allowed", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = buildService({ repo, events });

    await service.markArrival("order-1", courier);
    expect(events.publish).toHaveBeenCalledWith(expect.objectContaining({ type: "order.arrived" }));
  });

  it("completeDelivery updates status to DELIVERED and publishes order.delivered", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = buildService({ repo, events });

    await service.completeDelivery("order-1", courier);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.delivered" }),
    );
  });

  it("Задача №171 — completeDelivery passes paymentMethod/paymentStatus through to the lifecycle policy", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({ assignedCourierId: courier.id, paymentMethod: "CASH", paymentStatus: "paid" }),
      ),
    });
    const lifecycle = fakeLifecycle();
    const service = buildService({ repo, lifecycle });

    await service.completeDelivery("order-1", courier);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({ paymentMethod: "CASH", paymentStatus: "paid" }),
    );
  });

  it("Задача №212 — markCashPaymentReceived persists via markCashCollected and does NOT publish any event (Журналы событий reversal)", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({
          assignedCourierId: courier.id,
          status: OrderStatus.ARRIVED,
          paymentMethod: "CASH",
          paymentStatus: "unpaid",
        }),
      ),
    });
    const events = fakeEventBus();
    const service = buildService({ repo, events });

    await service.markCashPaymentReceived("order-1", courier);

    expect(repo.markCashCollected).toHaveBeenCalledWith("order-1", courier.id);
    expect(repo.updatePaymentStatus).not.toHaveBeenCalled();
    // Задача №212 — reverses №171/№211's audit-log publication for this action.
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("Задача №211 — markCashPaymentReceived is idempotent: a repeat tap on an already-paid order does not throw or re-persist", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({
          assignedCourierId: courier.id,
          status: OrderStatus.ARRIVED,
          paymentMethod: "CASH",
          paymentStatus: "paid",
        }),
      ),
    });
    const lifecycle = fakeLifecycle();
    const events = fakeEventBus();
    const service = buildService({ repo, lifecycle, events });

    const result = await service.markCashPaymentReceived("order-1", courier);

    expect(result.paymentStatus).toBe("paid");
    expect(lifecycle.assertCanTransition).not.toHaveBeenCalled();
    expect(repo.markCashCollected).not.toHaveBeenCalled();
    expect(events.publish).not.toHaveBeenCalled();
  });

  it("Задача №211 — markCashPaymentReceived is rejected for an ONLINE order (CourierMarkCashPaidRule's NOT_CASH_PAYMENT check)", async () => {
    // paymentStatus: "unpaid" (not "paid") deliberately — the idempotency
    // short-circuit above only fires on an already-"paid" order, and an
    // ONLINE order's Finik-confirmed payment would already be "paid" by
    // this point, which would trivially skip the lifecycle check this
    // test means to exercise.
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({
          assignedCourierId: courier.id,
          status: OrderStatus.ARRIVED,
          paymentMethod: "ONLINE",
          paymentStatus: "unpaid",
        }),
      ),
    });
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("Only cash-payment orders can be marked paid this way");
      }),
    });
    const service = buildService({ repo, lifecycle });

    await expect(service.markCashPaymentReceived("order-1", courier)).rejects.toThrow(
      "Only cash-payment orders can be marked paid this way",
    );
    expect(repo.markCashCollected).not.toHaveBeenCalled();
  });

  it("Задача №171 — markCashPaymentReceived passes context (assignedCourierId/paymentMethod/paymentStatus) to the lifecycle policy and does not persist when denied", async () => {
    const repo = fakeRepo({
      getById: vi.fn(async () =>
        makeOrder({
          assignedCourierId: courier.id,
          status: OrderStatus.ARRIVED,
          paymentMethod: "CASH",
          paymentStatus: "unpaid",
        }),
      ),
    });
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = buildService({ repo, lifecycle });

    await expect(service.markCashPaymentReceived("order-1", courier)).rejects.toThrow("denied");
    expect(repo.markCashCollected).not.toHaveBeenCalled();
  });

  it("Задача №143 — listOrderHistory queries listByCourier scoped to this courier's own id", async () => {
    const repo = fakeRepo({
      listByCourier: vi.fn(async () => ({
        items: [makeOrder({ status: OrderStatus.DELIVERED })],
        total: 1,
        page: 1,
        pageSize: 50,
        hasMore: false,
      })),
    });
    const service = buildService({ repo });

    const result = await service.listOrderHistory(courier, { page: 2, pageSize: 20 });

    expect(repo.listByCourier).toHaveBeenCalledWith(courier.id, { page: 2, pageSize: 20 });
    expect(result.items).toHaveLength(1);
  });
});
