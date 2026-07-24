/** Shared order context for notification templates. */
export interface OrderNotificationContext {
  readonly orderId: string;
  readonly orderNumber: string;
  readonly customerName?: string;
  readonly totalAmount?: number;
  readonly currency?: string;
  readonly status?: string;
}

/** Base contract for provider-agnostic notification templates. */
export interface NotificationTemplate {
  readonly templateId: string;
  render(context: OrderNotificationContext): string;
}
