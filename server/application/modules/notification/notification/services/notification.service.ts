import type { INotificationProvider } from "@server/application/modules/notification/notification/contracts";
import type {
  SendNotificationDto,
  SendOrderNotificationDto,
} from "@server/application/modules/notification/notification/dto";
import {
  createNotificationFailedEvent,
  createNotificationSentEvent,
} from "@server/application/modules/notification/notification/events";
import {
  createNotification,
  createNotificationRecipient,
  NotificationChannel,
  NotificationRecipientType,
  type Notification,
  withNotificationFailed,
  withNotificationSent,
} from "@server/application/modules/notification/notification/models";
import {
  buildOrderCreatedMessage,
  buildOrderStatusChangedMessage,
  buildPaymentFailedMessage,
  buildPaymentSucceededMessage,
} from "@server/application/modules/notification/notification/services/notification-message.builder";
import type { IIdGenerator } from "@server/application/ports";

/** Notification business capability service — orchestrates delivery via INotificationProvider. */
export class NotificationService {
  constructor(
    private readonly provider: INotificationProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async send(dto: SendNotificationDto): Promise<Notification> {
    validateSendNotificationDto(dto);

    const notification = createNotification({
      id: this.idGenerator.generate(),
      channel: dto.channel,
      recipient: dto.recipient,
      body: dto.body,
      subject: dto.subject,
      metadata: dto.metadata,
    });

    return this.deliver(notification, dto.parseMode);
  }

  sendOrderCreated(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.sendOrderNotification(dto, "order.created", buildOrderCreatedMessage(dto));
  }

  sendPaymentSucceeded(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.sendOrderNotification(dto, "order.paid", buildPaymentSucceededMessage(dto));
  }

  sendPaymentFailed(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.sendOrderNotification(dto, "order.payment_failed", buildPaymentFailedMessage(dto));
  }

  sendOrderStatusChanged(dto: SendOrderNotificationDto): Promise<Notification> {
    return this.sendOrderNotification(
      dto,
      "order.status_changed",
      buildOrderStatusChangedMessage(dto),
    );
  }

  private sendOrderNotification(
    dto: SendOrderNotificationDto,
    templateId: string,
    body: string,
  ): Promise<Notification> {
    validateOrderNotificationDto(dto);

    return this.send({
      channel: NotificationChannel.Telegram,
      recipient: createNotificationRecipient({
        type: NotificationRecipientType.Customer,
        id: dto.customerId,
        address: dto.customerId,
      }),
      body,
      metadata: Object.freeze({
        orderId: dto.orderId,
        template: templateId,
      }),
    });
  }

  private async deliver(
    notification: Notification,
    parseMode: "HTML" | "Markdown" | "MarkdownV2" = "HTML",
  ): Promise<Notification> {
    try {
      const result = await this.provider.send({
        channel: notification.channel,
        recipient: notification.recipient,
        body: notification.body,
        subject: notification.subject,
        parseMode,
        metadata: notification.metadata,
      });

      const sent = withNotificationSent(notification, result.externalMessageId);
      createNotificationSentEvent({
        notificationId: sent.id,
        channel: sent.channel,
        recipientId: sent.recipient.id,
        externalMessageId: result.externalMessageId,
      });
      return sent;
    } catch (error) {
      const failed = withNotificationFailed(notification);
      createNotificationFailedEvent({
        notificationId: failed.id,
        channel: failed.channel,
        recipientId: failed.recipient.id,
        reason: error instanceof Error ? error.message : "Notification delivery failed.",
      });
      return failed;
    }
  }
}

function validateSendNotificationDto(dto: SendNotificationDto): void {
  if (!dto.body?.trim()) {
    throw new Error("Notification body is required.");
  }
  if (!dto.recipient?.id?.trim()) {
    throw new Error("Notification recipient id is required.");
  }
}

function validateOrderNotificationDto(dto: SendOrderNotificationDto): void {
  if (!dto.orderId?.trim()) {
    throw new Error("Order id is required.");
  }
  if (!dto.customerId?.trim()) {
    throw new Error("Customer id is required.");
  }
}
