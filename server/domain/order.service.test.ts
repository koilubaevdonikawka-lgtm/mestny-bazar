import { describe, expect, it, vi } from "vitest";
import { OrderService } from "@server/domain/order.service";
import { InventoryService } from "@server/domain/inventory.service";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import type { IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus, MarketplaceEvent } from "@server/ports/marketplace-events.port";
import type { IProductRepository, StockReservationItem } from "@server/ports/product.repository";
import type { OrderDTO, OrderItemDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";

function makeOrderItem(overrides: Partial<OrderItemDTO> = {}): OrderItemDTO {
  return {
    id: "item-1",
    productId: "product-1",
    productName: "Молоко",
    productImageUrl: null,
    quantity: 2,
    unitPrice: 100,
    lineTotal: 200,
    ...overrides,
  };
}

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

function fakeProductRepository(overrides: Partial<IProductRepository> = {}): IProductRepository {
  return {
    list: vi.fn(async () => ({ items: [], total: 0, page: 1, pageSize: 50, hasMore: false })),
    getBySlug: vi.fn(async () => null),
    getById: vi.fn(async () => null),
    getManyByIds: vi.fn(async () => []),
    getManyBySlugs: vi.fn(async () => []),
    checkStock: vi.fn(async () => true),
    reserveStock: vi.fn(async (_items: StockReservationItem[]) => {}),
    releaseStock: vi.fn(async (_items: StockReservationItem[]) => {}),
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

function buildService(
  deps: {
    repo?: IOrderRepository;
    lifecycle?: IOrderLifecyclePolicy;
    productRepo?: IProductRepository;
    events?: IMarketplaceEventBus;
  } = {},
) {
  const repo = deps.repo ?? fakeRepo();
  const lifecycle = deps.lifecycle ?? fakeLifecycle();
  const productRepo = deps.productRepo ?? fakeProductRepository();
  const events = deps.events ?? fakeEventBus();
  const inventory = new InventoryService(productRepo);
  const service = new OrderService(repo, lifecycle, inventory, events);
  return { service, repo, lifecycle, productRepo, events };
}

const userId = "user-1";

describe("OrderService", () => {
  it("createOrder delegates to the repository", async () => {
    const { service, repo } = buildService();

    await service.createOrder({ userId } as never);
    expect(repo.create).toHaveBeenCalledTimes(1);
  });

  it("getOrderByIdempotencyKey delegates to the repository", async () => {
    const { service, repo } = buildService();

    await service.getOrderByIdempotencyKey("idem-1");
    expect(repo.getByIdempotencyKey).toHaveBeenCalledWith("idem-1");
  });

  it("getOrder scopes the lookup to the given user", async () => {
    const { service, repo } = buildService();

    await service.getOrder("order-1", userId);
    expect(repo.getById).toHaveBeenCalledWith("order-1", userId);
  });

  it("listOrders delegates to listByUser", async () => {
    const { service, repo } = buildService();

    await service.listOrders(userId);
    expect(repo.listByUser).toHaveBeenCalledWith(userId);
  });

  describe("cancelOrder", () => {
    it("throws OrderNotFoundError when the order does not exist for this user", async () => {
      const { service } = buildService({ repo: fakeRepo({ getById: vi.fn(async () => null) }) });

      await expect(service.cancelOrder("missing", userId)).rejects.toBeInstanceOf(
        OrderNotFoundError,
      );
    });

    it("asserts the customer_cancel transition, including order.createdAt, before updating anything", async () => {
      const createdAt = new Date().toISOString();
      const { service, lifecycle } = buildService({
        repo: fakeRepo({
          getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID, createdAt })),
        }),
      });

      await service.cancelOrder("order-1", userId);

      expect(lifecycle.assertCanTransition).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: "order-1",
          currentStatus: OrderStatus.PAID,
          targetStatus: OrderStatus.CANCELLED,
          actor: { id: userId },
          reason: "customer_cancel",
          orderCreatedAt: createdAt,
        }),
      );
    });

    it("does not update status, release stock, or publish an event when the lifecycle policy denies the transition", async () => {
      const { service, repo, productRepo, events } = buildService({
        lifecycle: fakeLifecycle({
          assertCanTransition: vi.fn(() => {
            throw new Error("denied");
          }),
        }),
      });

      await expect(service.cancelOrder("order-1", userId)).rejects.toThrow("denied");
      expect(repo.updateStatus).not.toHaveBeenCalled();
      expect(productRepo.releaseStock).not.toHaveBeenCalled();
      expect(events.publish).not.toHaveBeenCalled();
    });

    it("updates status with the read status as fromStatus once the transition is allowed", async () => {
      const { service, repo } = buildService({
        repo: fakeRepo({ getById: vi.fn(async () => makeOrder({ status: OrderStatus.PAID })) }),
      });

      await service.cancelOrder("order-1", userId);

      expect(repo.updateStatus).toHaveBeenCalledWith(
        "order-1",
        OrderStatus.PAID,
        OrderStatus.CANCELLED,
      );
    });

    it("releases reserved stock for every line item that has a productId", async () => {
      const cancelled = makeOrder({
        status: OrderStatus.CANCELLED,
        items: [
          makeOrderItem({ productId: "product-1", quantity: 2 }),
          makeOrderItem({ productId: "product-2", quantity: 3 }),
          makeOrderItem({ productId: null, quantity: 1 }),
        ],
      });
      const { service, productRepo } = buildService({
        repo: fakeRepo({ updateStatus: vi.fn(async () => cancelled) }),
      });

      await service.cancelOrder("order-1", userId);

      expect(productRepo.releaseStock).toHaveBeenCalledWith([
        { productId: "product-1", quantity: 2 },
        { productId: "product-2", quantity: 3 },
      ]);
    });

    it("does not call releaseStock when the order has no line items with a productId", async () => {
      const { service, productRepo } = buildService({
        repo: fakeRepo({
          updateStatus: vi.fn(async () =>
            makeOrder({
              status: OrderStatus.CANCELLED,
              items: [makeOrderItem({ productId: null })],
            }),
          ),
        }),
      });

      await service.cancelOrder("order-1", userId);
      expect(productRepo.releaseStock).not.toHaveBeenCalled();
    });

    it("still returns the cancelled order even if releasing stock fails (best-effort, not fatal)", async () => {
      const cancelled = makeOrder({
        status: OrderStatus.CANCELLED,
        items: [makeOrderItem({ productId: "product-1" })],
      });
      const { service } = buildService({
        repo: fakeRepo({ updateStatus: vi.fn(async () => cancelled) }),
        productRepo: fakeProductRepository({
          releaseStock: vi.fn(async () => {
            throw new Error("db unavailable");
          }),
        }),
      });

      await expect(service.cancelOrder("order-1", userId)).resolves.toEqual(cancelled);
    });

    it("publishes an order.cancelled event with the cancelled order and the customer_cancel reason", async () => {
      const cancelled = makeOrder({ status: OrderStatus.CANCELLED });
      const { service, events } = buildService({
        repo: fakeRepo({ updateStatus: vi.fn(async () => cancelled) }),
      });

      await service.cancelOrder("order-1", userId);

      expect(events.publish).toHaveBeenCalledWith({
        type: "order.cancelled",
        order: cancelled,
        reason: "customer_cancel",
      });
    });

    it("returns the cancelled order from the repository", async () => {
      const cancelled = makeOrder({ status: OrderStatus.CANCELLED });
      const { service } = buildService({
        repo: fakeRepo({ updateStatus: vi.fn(async () => cancelled) }),
      });

      await expect(service.cancelOrder("order-1", userId)).resolves.toEqual(cancelled);
    });
  });
});
