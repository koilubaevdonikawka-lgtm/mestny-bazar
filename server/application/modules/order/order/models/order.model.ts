import type { OrderReadModel } from "@server/domain/order";
import {
  createOrderItem,
  mergeOrderItems,
  type OrderItem,
  type OrderMoneyAmount,
} from "@server/application/modules/order/order/models/order-item.model";
import { OrderStatus, type OrderStatus as OrderStatusType } from "@server/application/modules/order/order/models/order-status.model";

export interface OrderTotals {
  readonly subtotal: OrderMoneyAmount;
  readonly deliveryFee: OrderMoneyAmount;
  readonly discount: OrderMoneyAmount;
  readonly total: OrderMoneyAmount;
}

/** Order aggregate snapshot owned by the Order capability module. */
export interface Order {
  readonly id: string;
  readonly orderNumber: string;
  readonly customerId: string;
  readonly status: OrderStatusType;
  readonly items: readonly OrderItem[];
  readonly address: string;
  readonly phone: string;
  readonly comment: string | null;
  readonly paymentMethod: string;
  readonly deliveryMethod: string;
  readonly totals: OrderTotals;
  readonly courierId: string | null;
  readonly cancellationReason: string | null;
  readonly refundReason: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function money(amount: number, currency: string): OrderMoneyAmount {
  return Object.freeze({ amount: Number(amount.toFixed(2)), currency });
}

export function calculateOrderTotals(input: {
  items: readonly OrderItem[];
  currency: string;
  deliveryFee?: number;
  discount?: number;
}): OrderTotals {
  const currency = input.currency.trim();
  const subtotalAmount = Number(
    input.items.reduce((sum, item) => sum + item.subtotal.amount, 0).toFixed(2),
  );
  const deliveryFeeAmount = Number((input.deliveryFee ?? 0).toFixed(2));
  const discountAmount = Number((input.discount ?? 0).toFixed(2));
  const totalAmount = Number((subtotalAmount + deliveryFeeAmount - discountAmount).toFixed(2));

  return Object.freeze({
    subtotal: money(subtotalAmount, currency),
    deliveryFee: money(deliveryFeeAmount, currency),
    discount: money(discountAmount, currency),
    total: money(totalAmount, currency),
  });
}

export function createOrder(input: {
  id: string;
  orderNumber: string;
  customerId: string;
  address: string;
  phone: string;
  comment?: string | null;
  paymentMethod: string;
  deliveryMethod: string;
  currency: string;
  deliveryFee?: number;
  discount?: number;
  totals?: OrderTotals;
  items: readonly {
    id: string;
    productId: string;
    sellerId: string;
    catalogId: string;
    name: string;
    priceAmount: number;
    currency: string;
    quantity: number;
  }[];
}): Order {
  const currency = input.currency.trim();
  const timestamp = new Date().toISOString();
  const items = mergeOrderItems(
    input.items.map((item) =>
      createOrderItem({
        id: item.id,
        productId: item.productId,
        sellerId: item.sellerId,
        catalogId: item.catalogId,
        name: item.name,
        priceAmount: item.priceAmount,
        currency: item.currency || currency,
        quantity: item.quantity,
      }),
    ),
  );

  const totals =
    input.totals ??
    calculateOrderTotals({
      items,
      currency,
      deliveryFee: input.deliveryFee,
      discount: input.discount,
    });

  return Object.freeze({
    id: input.id.trim(),
    orderNumber: input.orderNumber.trim(),
    customerId: input.customerId.trim(),
    status: OrderStatus.Draft,
    items,
    address: input.address.trim(),
    phone: input.phone.trim(),
    comment: input.comment?.trim() ?? null,
    paymentMethod: input.paymentMethod.trim(),
    deliveryMethod: input.deliveryMethod.trim(),
    totals,
    courierId: null,
    cancellationReason: null,
    refundReason: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function withOrderStatus(order: Order, status: OrderStatusType): Order {
  return Object.freeze({
    ...order,
    status,
    updatedAt: new Date().toISOString(),
  });
}

export function withOrderCourierId(order: Order, courierId: string | null): Order {
  return Object.freeze({
    ...order,
    courierId: courierId?.trim() ?? null,
    updatedAt: new Date().toISOString(),
  });
}

export function withOrderCancellationReason(order: Order, reason: string | null): Order {
  return Object.freeze({
    ...order,
    cancellationReason: reason?.trim() ?? null,
    updatedAt: new Date().toISOString(),
  });
}

export function withOrderRefundReason(order: Order, reason: string | null): Order {
  return Object.freeze({
    ...order,
    refundReason: reason?.trim() ?? null,
    updatedAt: new Date().toISOString(),
  });
}

export function toOrderReadModel(order: Order): OrderReadModel {
  return Object.freeze({
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    status: order.status,
    items: order.items.map((item) =>
      Object.freeze({
        id: item.id,
        productId: item.productId,
        sellerId: item.sellerId,
        catalogId: item.catalogId,
        name: item.name,
        price: Object.freeze({ ...item.price }),
        quantity: item.quantity,
        subtotal: Object.freeze({ ...item.subtotal }),
      }),
    ),
    address: order.address,
    phone: order.phone,
    comment: order.comment,
    paymentMethod: order.paymentMethod,
    deliveryMethod: order.deliveryMethod,
    totals: {
      subtotal: Object.freeze({ ...order.totals.subtotal }),
      deliveryFee: Object.freeze({ ...order.totals.deliveryFee }),
      discount: Object.freeze({ ...order.totals.discount }),
      total: Object.freeze({ ...order.totals.total }),
    },
    courierId: order.courierId,
    cancellationReason: order.cancellationReason,
    refundReason: order.refundReason,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  });
}
