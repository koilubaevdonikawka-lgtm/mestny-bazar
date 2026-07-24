export interface PlaceOrderWorkflowResult {
  readonly checkoutId: string;
  readonly orderId: string;
  readonly paymentId: string;
  readonly customerId: string;
  readonly stage: "awaiting_payment";
}

export interface PaymentSucceededWorkflowResult {
  readonly paymentId: string;
  readonly orderId: string;
  readonly pickingTaskId: string;
  readonly stage: "warehouse_picking";
}

export interface PaymentFailedWorkflowResult {
  readonly paymentId: string;
  readonly orderId: string;
  readonly cancelled: boolean;
  readonly stage: "cancelled";
}

export interface WarehouseCompletedWorkflowResult {
  readonly taskId: string;
  readonly orderId: string;
  readonly deliveryId: string;
  readonly stage: "delivery_pending";
}

export interface DeliveryCompletedWorkflowResult {
  readonly deliveryId: string;
  readonly orderId: string;
  readonly stage: "completed";
}

export interface CancelOrderWorkflowResult {
  readonly orderId: string;
  readonly cancelled: boolean;
  readonly stage: "cancelled";
}
