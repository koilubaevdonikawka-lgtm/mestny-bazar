import type {
  INotificationModule,
  OrderCreatedNotificationInput,
} from "@server/application/modules/checkout/checkout/contracts";
import type {
  SendNotificationDto,
  SendOrderNotificationDto,
} from "@server/application/modules/notification/notification/dto";
import type { Notification } from "@server/application/modules/notification/notification/models";
import type { NotificationService } from "@server/application/modules/notification/notification/services";

/** Public entry point for the Notification business capability module. */
export class NotificationModule implements INotificationModule {
  constructor(private readonly service: NotificationService) {}

  send(dto: SendNotificationDto): Promise<Notification> {
    return this.service.send(dto);
  }

  sendOrderCreated(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.service.sendOrderCreated(dto);
  }

  sendPaymentSucceeded(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.service.sendPaymentSucceeded(dto);
  }

  sendPaymentFailed(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.service.sendPaymentFailed(dto);
  }

  sendOrderStatusChanged(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.service.sendOrderStatusChanged(dto);
  }

  async notifyOrderCreated(input: OrderCreatedNotificationInput): Promise<void> {
    await this.sendOrderCreated({
      orderId: input.orderId,
      customerId: input.customerId,
      orderNumber: input.orderId,
    });
  }
}
