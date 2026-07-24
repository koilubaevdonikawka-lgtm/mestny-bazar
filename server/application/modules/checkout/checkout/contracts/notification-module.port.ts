export interface OrderCreatedNotificationInput {
  readonly orderId: string;
  readonly customerId: string;
}

/** Notification module contract for checkout orchestration. */
export interface INotificationModule {
  notifyOrderCreated(input: OrderCreatedNotificationInput): Promise<void>;
}
