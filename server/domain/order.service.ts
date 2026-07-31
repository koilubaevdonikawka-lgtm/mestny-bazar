import type { CreateOrderData, IOrderRepository } from "@server/ports/order.repository";
import type { IOrderLifecyclePolicy } from "@server/ports/order-lifecycle.port";
import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { OrderDTO } from "@shared/contracts/order";
import { OrderStatus } from "@shared/contracts/order";
import { OrderNotFoundError } from "@server/domain/orders.errors";
import { InventoryService } from "@server/domain/inventory.service";
import { logger } from "@shared/observability/logger";

export class OrderService {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly orderLifecycle: IOrderLifecyclePolicy,
    private readonly inventory: InventoryService,
    private readonly events: IMarketplaceEventBus,
  ) {}

  async createOrder(data: CreateOrderData): Promise<OrderDTO> {
    return this.orders.create(data);
  }

  async getOrderByIdempotencyKey(idempotencyKey: string): Promise<OrderDTO | null> {
    return this.orders.getByIdempotencyKey(idempotencyKey);
  }

  async getOrder(id: string, userId?: string): Promise<OrderDTO | null> {
    return this.orders.getById(id, userId);
  }

  async listOrders(userId: string): Promise<OrderDTO[]> {
    return this.orders.listByUser(userId);
  }

  async cancelOrder(orderId: string, userId: string): Promise<OrderDTO> {
    const order = await this.orders.getById(orderId, userId);
    if (!order) throw new OrderNotFoundError();

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.CANCELLED,
      actor: { id: userId },
      reason: "customer_cancel",
      orderCreatedAt: order.createdAt,
    });

    const cancelled = await this.orders.updateStatus(orderId, order.status, OrderStatus.CANCELLED);

    // The order is already cancelled (durable, customer-visible) at this
    // point — a stock-release hiccup must not undo that or fail the
    // request. Same acceptable-narrow-window tradeoff CheckoutService
    // already makes for its own release-on-error path.
    const stockItems = cancelled.items
      .filter((item): item is typeof item & { productId: string } => item.productId !== null)
      .map((item) => ({ productId: item.productId, quantity: item.quantity }));

    if (stockItems.length > 0) {
      await this.inventory.releaseStock(stockItems).catch(() => {
        logger.error("Failed to release reserved stock after a customer order cancellation", {
          orderId,
        });
      });
    }

    await this.events.publish({
      type: "order.cancelled",
      order: cancelled,
      reason: "customer_cancel",
    });

    return cancelled;
  }
}
