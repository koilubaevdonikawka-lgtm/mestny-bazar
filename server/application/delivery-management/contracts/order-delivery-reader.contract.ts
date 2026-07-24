/** Read-only order snapshot for delivery initiation and validation. */
export interface OrderDeliverySnapshot {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
  readonly deliverable: boolean;
}

/**
 * Read-only order access for Delivery Management.
 * Implemented by an adapter over Order Management — no Order Repository access.
 */
export interface IOrderDeliveryReader {
  getOrderForDelivery(orderId: string): Promise<OrderDeliverySnapshot | null>;
}
