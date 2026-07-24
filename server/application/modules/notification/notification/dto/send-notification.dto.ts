import type { NotificationChannelValue } from "@server/application/modules/notification/notification/models";
import type { NotificationRecipient } from "@server/application/modules/notification/notification/models";

export interface SendNotificationDto {
  readonly channel: NotificationChannelValue;
  readonly recipient: NotificationRecipient;
  readonly body: string;
  readonly subject?: string | null;
  readonly parseMode?: "HTML" | "Markdown" | "MarkdownV2";
  readonly metadata?: Readonly<Record<string, string>>;
}
