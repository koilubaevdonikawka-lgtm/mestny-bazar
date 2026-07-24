export interface SendOrderNotificationDto {
  readonly orderId: string;
  readonly customerId: string;
  readonly orderNumber?: string;
  readonly customerName?: string;
  readonly totalAmount?: number;
  readonly currency?: string;
  readonly status?: string;
}
