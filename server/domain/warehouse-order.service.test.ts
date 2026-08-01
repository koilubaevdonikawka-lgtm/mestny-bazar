import { describe, expect, it, vi } from "vitest";
import { WarehouseOrderService } from "@server/domain/warehouse-order.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

function makeOrder(overrides: Partial<OrderDTO> = {}): OrderDTO {
  return {
    id: "order-1",
    orderNumber: 1,
    status: OrderStatus.CONFIRMED,
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
    ...overrides,
  };
}

function fakeRepo(overrides: Partial<IOrderRepository> = {}): IOrderRepository {
  return {
    create: vi.fn(async () => makeOrder()),
    getById: vi.fn(async () => makeOrder()),
    getByIdempotencyKey: vi.fn(async () => null),
    listByUser: vi.fn(async () => []),
    listAll: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    listByStatuses: vi.fn(async () => []),
    updateStatus: vi.fn(async (_id, _from, status) => makeOrder({ status })),
    updatePaymentStatus: vi.fn(async () => makeOrder()),
    countByStatuses: vi.fn(async () => 0),
    getTodaySummary: vi.fn(async () => ({ orderCount: 0, revenue: 0 })),

    assignCourier: vi.fn(async (_id, courierId) => makeOrder({ assignedCourierId: courierId })),

    countActiveDeliveriesByCourier: vi.fn(async () => 0),

    listByStatusesForCourier: vi.fn(async () => []),
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

const warehouse = { id: "warehouse-1", roles: ["warehouse" as const] };

describe("WarehouseOrderService", () => {
  it("listAssemblyOrders queries only CONFIRMED and ASSEMBLING", async () => {
    const repo = fakeRepo();
    const service = new WarehouseOrderService(repo, fakeLifecycle(), fakeEventBus());

    await service.listAssemblyOrders();

    expect(repo.listByStatuses).toHaveBeenCalledWith([
      OrderStatus.CONFIRMED,
      OrderStatus.ASSEMBLING,
    ]);
  });

  it("getOrder throws OrderNotFoundError when the repository returns null", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new WarehouseOrderService(repo, fakeLifecycle(), fakeEventBus());

    await expect(service.getOrder("missing")).rejects.toBeInstanceOf(OrderNotFoundError);
  });

  it("startAssembly asserts warehouse_start_assembly -> ASSEMBLING and publishes order.assembling_started", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle();
    const events = fakeEventBus();
    const service = new WarehouseOrderService(repo, lifecycle, events);

    await service.startAssembly("order-1", warehouse);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        targetStatus: OrderStatus.ASSEMBLING,
        reason: "warehouse_start_assembly",
        actor: { id: warehouse.id, roles: warehouse.roles },
      }),
    );
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.CONFIRMED,
      OrderStatus.ASSEMBLING,
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.assembling_started" }),
    );
  });

  it("completeAssembly does not update status when the lifecycle policy denies it", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = new WarehouseOrderService(repo, lifecycle, fakeEventBus());

    await expect(service.completeAssembly("order-1", warehouse)).rejects.toThrow("denied");
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("completeAssembly updates status to READY_FOR_DELIVERY and publishes order.ready_for_delivery", async () => {
    const repo = fakeRepo();
    const events = fakeEventBus();
    const service = new WarehouseOrderService(repo, fakeLifecycle(), events);

    await service.completeAssembly("order-1", warehouse);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.CONFIRMED,
      OrderStatus.READY_FOR_DELIVERY,
    );
    expect(events.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: "order.ready_for_delivery" }),
    );
  });
});
