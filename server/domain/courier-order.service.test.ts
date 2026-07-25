import { describe, expect, it, vi } from "vitest";
import { CourierOrderService } from "@server/domain/courier-order.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
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
    updateStatus: vi.fn(async (_id, status) => makeOrder({ status })),
    updatePaymentStatus: vi.fn(async () => makeOrder()),
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

const courier = { id: "courier-1", roles: ["courier" as const] };

describe("CourierOrderService", () => {
  it("listDeliveryOrders queries only the delivery-queue statuses", async () => {
    const repo = fakeRepo();
    const service = new CourierOrderService(repo, fakeLifecycle());

    await service.listDeliveryOrders();

    expect(repo.listByStatuses).toHaveBeenCalledWith([
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.ASSEMBLING,
      OrderStatus.OUT_FOR_DELIVERY,
      OrderStatus.ARRIVED,
    ]);
  });

  it("acceptOrder validates the transition but never mutates status", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle();
    const service = new CourierOrderService(repo, lifecycle);

    await service.acceptOrder("order-1", courier);

    expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
      expect.objectContaining({
        targetStatus: OrderStatus.READY_FOR_DELIVERY,
        reason: "courier_accept",
      }),
    );
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("acceptOrder throws OrderNotFoundError for a nonexistent order", async () => {
    const repo = fakeRepo({ getById: vi.fn(async () => null) });
    const service = new CourierOrderService(repo, fakeLifecycle());

    await expect(service.acceptOrder("missing", courier)).rejects.toBeInstanceOf(
      OrderNotFoundError,
    );
  });

  it("startDelivery updates status to OUT_FOR_DELIVERY once allowed", async () => {
    const repo = fakeRepo();
    const service = new CourierOrderService(repo, fakeLifecycle());

    await service.startDelivery("order-1", courier);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.OUT_FOR_DELIVERY,
    );
  });

  it("markArrival does not update status when the lifecycle policy denies it", async () => {
    const repo = fakeRepo();
    const lifecycle = fakeLifecycle({
      assertCanTransition: vi.fn(() => {
        throw new Error("denied");
      }),
    });
    const service = new CourierOrderService(repo, lifecycle);

    await expect(service.markArrival("order-1", courier)).rejects.toThrow("denied");
    expect(repo.updateStatus).not.toHaveBeenCalled();
  });

  it("completeDelivery updates status to DELIVERED", async () => {
    const repo = fakeRepo();
    const service = new CourierOrderService(repo, fakeLifecycle());

    await service.completeDelivery("order-1", courier);
    expect(repo.updateStatus).toHaveBeenCalledWith(
      "order-1",
      OrderStatus.READY_FOR_DELIVERY,
      OrderStatus.DELIVERED,
    );
  });
});
