export interface OrderWorkflowSnapshot {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
}

export interface CreateOrderWorkflowResult {
  readonly orderId: string;
  readonly customerId: string;
  readonly status: string;
}

/** Order coordination port for workflow orchestration. */
export interface IOrderWorkflowService {
  createFromCheckout(customerId: string, checkoutId: string): Promise<CreateOrderWorkflowResult>;
  confirmOrder(orderId: string): Promise<void>;
  markProcessing(orderId: string): Promise<void>;
  markShipped(orderId: string): Promise<void>;
  markDelivered(orderId: string): Promise<void>;
  cancelOrder(orderId: string, customerId: string, reason?: string): Promise<boolean>;
  getOrder(orderId: string): Promise<OrderWorkflowSnapshot | null>;
}
