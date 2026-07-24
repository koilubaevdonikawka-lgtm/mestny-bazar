import type { INotificationStatusProvider } from "@server/application/notification-management/contracts/notification-status-provider.contract";
import { NotificationStatus } from "@server/application/notification-management/models/notification.model";

const TRANSITIONS: Readonly<Record<NotificationStatus, readonly NotificationStatus[]>> =
  Object.freeze({
    [NotificationStatus.Pending]: Object.freeze([
      NotificationStatus.Sent,
      NotificationStatus.Failed,
      NotificationStatus.Cancelled,
    ]),
    [NotificationStatus.Sent]: Object.freeze([]),
    [NotificationStatus.Failed]: Object.freeze([
      NotificationStatus.Pending,
      NotificationStatus.Cancelled,
    ]),
    [NotificationStatus.Cancelled]: Object.freeze([]),
  });

/** Default notification status transition rules. */
export class DefaultNotificationStatusProvider implements INotificationStatusProvider {
  canTransition(from: NotificationStatus, to: NotificationStatus): boolean {
    return TRANSITIONS[from].includes(to);
  }

  getAllowedTransitions(from: NotificationStatus): readonly NotificationStatus[] {
    return TRANSITIONS[from];
  }

  isTerminal(status: NotificationStatus): boolean {
    return status === NotificationStatus.Sent || status === NotificationStatus.Cancelled;
  }

  canRetry(status: NotificationStatus): boolean {
    return status === NotificationStatus.Failed;
  }
}
