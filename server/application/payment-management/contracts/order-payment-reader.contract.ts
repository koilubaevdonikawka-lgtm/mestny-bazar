/** Read-only order snapshot for payment initiation and validation. */
export interface OrderPaymentSnapshot {
  readonly orderId: string;
  readonly customerId: string;
  readonly subtotal: number;
  readonly currency: string;
  readonly status: string;
  readonly payable: boolean;
}

/**
 * Read-only order access for Payment Management.
 * Implemented by an adapter over Order Management — no Order Repository access.
 */
export interface IOrderPaymentReader {
  getOrderForPayment(orderId: string): Promise<OrderPaymentSnapshot | null>;
}
