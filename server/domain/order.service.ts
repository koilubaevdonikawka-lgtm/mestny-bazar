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

    return this.finalizeCancellation(orderId, order.status, "customer_cancel");
  }

  /**
   * Задача №172 — a customer who returned from the Finik payment page
   * without completing payment can cancel their own order, regardless of
   * FEATURE_CUSTOMER_CANCELLATION (Задача №133) — CustomerCancelUnpaidOnlineOrderRule
   * has no such gate and no cancellation-window check; it only ever applies
   * to an unpaid ONLINE order still in CREATED.
   */
  async cancelUnpaidOnlineOrder(orderId: string, userId: string): Promise<OrderDTO> {
    const order = await this.orders.getById(orderId, userId);
    if (!order) throw new OrderNotFoundError();

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.CANCELLED,
      actor: { id: userId },
      reason: "customer_cancel_unpaid_online",
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
    });

    return this.finalizeCancellation(orderId, order.status, "customer_cancel_unpaid_online");
  }

  private async finalizeCancellation(
    orderId: string,
    fromStatus: OrderStatus,
    reason: string,
  ): Promise<OrderDTO> {
    const cancelled = await this.orders.updateStatus(orderId, fromStatus, OrderStatus.CANCELLED);

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
      reason,
    });

    return cancelled;
  }

  /**
   * Webhook-confirmed online payment (Промпт №075). Idempotent — a
   * redelivered webhook for an already-paid order is a no-op.
   *
   * Задача №132 — the idempotency check must look at BOTH `status` and
   * `paymentStatus`: a prior call using the old two-separate-writes
   * sequence (updateStatus then updatePaymentStatus) could be interrupted
   * between them, leaving status=PAID but paymentStatus!="paid" (order
   * #104). Checking only paymentStatus (as this used to) would miss that
   * partial state and re-attempt the CREATED→PAID transition, which
   * PaymentConfirmedRule correctly denies once status is no longer
   * CREATED. When status is already PAID, the transition itself is done —
   * only the missing field needs finishing, never assertCanTransition
   * again. The main path now uses confirmPaid(), a single atomic UPDATE
   * (status + paymentStatus + paidAt together), so this partial state
   * cannot be produced going forward — this branch only exists to heal
   * orders left over from before that fix.
   */
  async confirmPayment(orderId: string): Promise<OrderDTO> {
    const order = await this.orders.getById(orderId);
    if (!order) throw new OrderNotFoundError();
    if (order.status === OrderStatus.PAID && order.paymentStatus === "paid") return order;

    if (order.status === OrderStatus.PAID) {
      const paid = await this.orders.updatePaymentStatus(orderId, "paid");
      await this.events.publish({ type: "order.paid", order: paid });
      return paid;
    }

    this.orderLifecycle.assertCanTransition({
      orderId,
      currentStatus: order.status,
      targetStatus: OrderStatus.PAID,
      actor: { id: null },
      reason: "payment_confirmed",
      orderCreatedAt: order.createdAt,
    });

    const paid = await this.orders.confirmPaid(orderId, order.status);

    await this.events.publish({ type: "order.paid", order: paid });

    return paid;
  }
}
