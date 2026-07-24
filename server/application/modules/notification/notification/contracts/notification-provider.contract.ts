import type {
  NotificationChannelValue,
  NotificationRecipient,
  NotificationStatusValue,
} from "@server/application/modules/notification/notification/models";

/** Provider delivery request for the Notification capability module. */
export interface NotificationDeliveryRequest {
  readonly channel: NotificationChannelValue;
  readonly recipient: NotificationRecipient;
  readonly body: string;
  readonly subject?: string | null;
  readonly parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Provider delivery result for the Notification capability module. */
export interface NotificationDeliveryResult {
  readonly externalMessageId: string;
  readonly status: NotificationStatusValue;
}

/** Notification delivery contract — implemented by infrastructure adapters. */
export interface INotificationProvider {
  send(request: NotificationDeliveryRequest): Promise<NotificationDeliveryResult>;
}
