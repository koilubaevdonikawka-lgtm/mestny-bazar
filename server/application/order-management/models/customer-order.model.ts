/** Order lifecycle statuses for Order Management. */
export const OrderManagementStatus = {
  Created: "Created",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
} as const;

export type OrderManagementStatus =
  (typeof OrderManagementStatus)[keyof typeof OrderManagementStatus];

/** Line item on a customer order. */
export interface OrderLine {
  readonly productId: string;
  readonly sellerId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitPrice: number;
  readonly currency: string;
  readonly lineTotal: number;
}

/** Customer order created from an Order Draft. */
export interface CustomerOrder {
  readonly orderId: string;
  readonly customerId: string;
  readonly checkoutId: string;
  readonly status: OrderManagementStatus;
  readonly lines: readonly OrderLine[];
  readonly subtotal: number;
  readonly currency: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function createCustomerOrder(input: {
  orderId: string;
  customerId: string;
  checkoutId: string;
  lines: readonly OrderLine[];
  subtotal: number;
  currency: string;
}): CustomerOrder {
  const now = new Date().toISOString();
  return Object.freeze({
    orderId: input.orderId,
    customerId: input.customerId.trim(),
    checkoutId: input.checkoutId.trim(),
    status: OrderManagementStatus.Created,
    lines: Object.freeze([...input.lines]),
    subtotal: input.subtotal,
    currency: input.currency,
    createdAt: now,
    updatedAt: now,
  });
}

export function withOrderStatus(
  order: CustomerOrder,
  status: OrderManagementStatus,
): CustomerOrder {
  return Object.freeze({
    ...order,
    status,
    updatedAt: new Date().toISOString(),
  });
}
