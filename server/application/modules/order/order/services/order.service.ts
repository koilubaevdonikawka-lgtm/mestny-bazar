import type { IOrderStore } from "@server/application/modules/order/order/contracts";
import type { IOrderStatusChangeHook } from "@server/application/modules/order/order/contracts/order-status-change-hook.contract";
import type { CreateOrderDto, UpdateOrderStatusDto } from "@server/application/modules/order/order/dto";
import {
  createOrderCreatedEvent,
  createOrderStatusChangedEvent,
} from "@server/application/modules/order/order/events";
import {
  assertOrderStatus,
  createOrder,
  OrderStatus,
  type Order,
  type OrderTotals,
  withOrderCancellationReason,
  withOrderCourierId,
  withOrderRefundReason,
  withOrderStatus,
} from "@server/application/modules/order/order/models";
import type { IIdGenerator } from "@server/application/ports";

/** Order business capability service — orchestrates order lifecycle via IOrderStore. */
export class OrderService {
  constructor(
    private readonly store: IOrderStore,
    private readonly idGenerator: IIdGenerator,
    private readonly statusChangeHook?: IOrderStatusChangeHook,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    validateCreateOrderDto(dto);

    const orderId = this.idGenerator.generate();
    const orderNumber = this.buildOrderNumber();
    const currency = dto.currency?.trim() || dto.pricingSnapshot?.currency || "KGS";
    const items = dto.items ?? [];
    const pricingSnapshot = dto.pricingSnapshot;

    const order = createOrder({
      id: orderId,
      orderNumber,
      customerId: dto.customerId,
      address: dto.address,
      phone: dto.phone,
      comment: dto.comment,
      paymentMethod: dto.paymentMethod,
      deliveryMethod: dto.deliveryMethod,
      currency,
      deliveryFee: dto.deliveryFee,
      discount: pricingSnapshot?.discount ?? dto.discount,
      totals: pricingSnapshot
        ? buildTotalsFromPricingSnapshot(pricingSnapshot, dto.deliveryFee ?? 0)
        : undefined,
      items: items.map((item) =>
        Object.freeze({
          id: this.idGenerator.generate(),
          productId: item.productId,
          sellerId: item.sellerId,
          catalogId: item.catalogId,
          name: item.name,
          priceAmount: item.priceAmount,
          currency: item.currency || currency,
          quantity: item.quantity,
        }),
      ),
    });

    await this.store.saveOrder(order);
    createOrderCreatedEvent({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      status: order.status,
      itemCount: order.items.length,
      totalAmount: order.totals.total.amount,
      currency: order.totals.total.currency,
    });
    await this.statusChangeHook?.onOrderCreated(order);

    return order;
  }

  async getOrder(orderId: string): Promise<Order | null> {
    return this.store.findById(orderId.trim());
  }

  async updateOrderStatus(dto: UpdateOrderStatusDto): Promise<Order> {
    const orderId = dto.orderId.trim();
    const nextStatus = assertOrderStatus(dto.status);

    const existing = await this.store.findById(orderId);
    if (!existing) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (existing.status === nextStatus) {
      return existing;
    }

    let updated = withOrderStatus(existing, nextStatus);
    if (dto.courierId !== undefined) {
      updated = withOrderCourierId(updated, dto.courierId);
    }
    if (dto.reason && nextStatus === OrderStatus.Cancelled) {
      updated = withOrderCancellationReason(updated, dto.reason);
    }
    if (dto.reason && nextStatus === OrderStatus.Refunded) {
      updated = withOrderRefundReason(updated, dto.reason);
    }

    await this.store.updateOrder(updated);
    createOrderStatusChangedEvent({
      orderId: updated.id,
      previousStatus: existing.status,
      newStatus: updated.status,
    });

    await this.statusChangeHook?.onStatusChanged({
      order: updated,
      previousStatus: existing.status,
      reason: dto.reason,
      actor: dto.actor,
    });

    return updated;
  }

  private buildOrderNumber(): string {
    return `ORD-${Date.now()}-${this.idGenerator.generate().slice(0, 8)}`;
  }
}

function buildTotalsFromPricingSnapshot(
  pricingSnapshot: NonNullable<CreateOrderDto["pricingSnapshot"]>,
  deliveryFee: number,
): OrderTotals {
  const currency = pricingSnapshot.currency.trim();
  const deliveryFeeAmount = Number(deliveryFee.toFixed(2));
  const totalAmount = Number((pricingSnapshot.total + deliveryFeeAmount).toFixed(2));

  return Object.freeze({
    subtotal: money(pricingSnapshot.subtotal, currency),
    deliveryFee: money(deliveryFeeAmount, currency),
    discount: money(pricingSnapshot.discount, currency),
    total: money(totalAmount, currency),
  });
}

function money(amount: number, currency: string) {
  return Object.freeze({ amount: Number(amount.toFixed(2)), currency });
}

function validateCreateOrderDto(dto: CreateOrderDto): void {
  if (!dto.customerId?.trim()) {
    throw new Error("Customer id is required.");
  }
  if (!dto.address?.trim()) {
    throw new Error("Delivery address is required.");
  }
  if (!dto.phone?.trim()) {
    throw new Error("Phone number is required.");
  }
  if (!dto.paymentMethod?.trim()) {
    throw new Error("Payment method is required.");
  }
  if (!dto.deliveryMethod?.trim()) {
    throw new Error("Delivery method is required.");
  }
}
