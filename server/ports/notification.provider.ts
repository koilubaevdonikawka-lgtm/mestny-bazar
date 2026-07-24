import type { OrderDTO } from "@shared/contracts/order";

export type NotificationChannel = "telegram" | "whatsapp";

export interface NotificationSubscribeRequest {
  userId: string;
  channel: NotificationChannel;
  contact: string;
}

export interface INotificationProvider {
  sendOrderUpdate(order: OrderDTO, message: string): Promise<void>;
  subscribe(request: NotificationSubscribeRequest): Promise<void>;
}
