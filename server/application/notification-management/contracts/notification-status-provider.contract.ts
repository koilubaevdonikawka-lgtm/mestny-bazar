import type { NotificationStatus } from "@server/application/notification-management/models/notification.model";

export interface INotificationStatusProvider {
  canTransition(from: NotificationStatus, to: NotificationStatus): boolean;
  getAllowedTransitions(from: NotificationStatus): readonly NotificationStatus[];
  isTerminal(status: NotificationStatus): boolean;
  canRetry(status: NotificationStatus): boolean;
}
