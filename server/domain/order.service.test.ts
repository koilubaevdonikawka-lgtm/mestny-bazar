import { describe, expect, it, vi } from "vitest";
import { OrderService } from "@server/domain/order.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

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

const userId = "user-1";

describe("OrderService", () => {
  it("createOrder delegates to the repository", async () => {
    const repo = fakeRepo();
    const service = new OrderService(repo, fakeLifecycle());

    await service.createOrder({ userId } as never);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it("getOrderByIdempotencyKey delegates to the repository", async () => {
    const repo = fakeRepo();
    const service = new OrderService(repo, fakeLifecycle());

    await service.getOrderByIdempotencyKey("idem-1");
    expect(repo.getByIdempotencyKey).toHaveBeenCalledWith("idem-1");
  });

  it("getOrder scopes the lookup to the given user", async () => {
    const repo = fakeRepo();
    const service = new OrderService(repo, fakeLifecycle());

    await service.getOrder("order-1", userId);
    expect(repo.getById).toHaveBeenCalledWith("order-1", userId);
  });

  it("listOrders delegates to listByUser", async () => {
    const repo = fakeRepo();
    const service = new OrderService(repo, fakeLifecycle());

    await service.listOrders(userId);
    expect(repo.listByUser).toHaveBeenCalledWith(userId);
  });

  describe("cancelOrder", () => {
    it("throws OrderNotFoundError when the order does not exist for this user", async () => {
      const repo = fakeRepo({ getById: vi.fn(async () => null) });
      const service = new OrderService(repo, fakeLifecycle());

      await expect(service.cancelOrder("missing", userId)).rejects.toBeInstanceOf(
        OrderNotFoundError,
      );
    });

    it("asserts the customer_cancel transition before updating anything", async () => {
      const repo = fakeRepo({
        getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID })),
      });
      const lifecycle = fakeLifecycle();
      const service = new OrderService(repo, lifecycle);

      await service.cancelOrder("order-1", userId);

      expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order-1",
          currentStatus: OrderStatus.PAID,
          targetStatus: OrderStatus.CANCELLED,
          actor: { id: userId },
          reason: "customer_cancel",
        }),
      );
    });

    it("does not update status when the lifecycle policy denies the transition", async () => {
      const repo = fakeRepo();
      const lifecycle = fakeLifecycle({
        assertCanTransition: vi.fn(() => {
          throw new Error("denied");
        }),
      });
      const service = new OrderService(repo, lifecycle);

      await expect(service.cancelOrder("order-1", userId)).rejects.toThrow("denied");
      expect(repo.updateStatus).not.toHaveBeenCalled();
    });

    it("updates status with the read status as fromStatus once the transition is allowed", async () => {
      const repo = fakeRepo({
        getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID })),
      });
      const service = new OrderService(repo, fakeLifecycle());

      await service.cancelOrder("order-1", userId);

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "order-1",
        OrderStatus.PAID,
        OrderStatus.CANCELLED,
      );
    });
  });
});
