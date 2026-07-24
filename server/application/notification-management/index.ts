export type { INotificationRepository } from "./contracts/notification-repository.contract";
export type {
  INotificationChannel,
  NotificationChannelRequest,
  NotificationChannelResult,
} from "./contracts/notification-channel.contract";
export type { INotificationStatusProvider } from "./contracts/notification-status-provider.contract";
export type { INotificationHistoryRepository } from "./contracts/notification-history-repository.contract";
export type {
  INotificationTemplateProvider,
  NotificationTemplate,
} from "./contracts/notification-template-provider.contract";
export type { INotificationEventPublisher } from "./contracts/notification-event-publisher.contract";
export type {
  ITelegramProvider,
  IEmailProvider,
  ISmsProvider,
  IPushProvider,
  IWhatsAppProvider,
  INotificationAnalyticsProvider,
} from "./contracts/notification-extension-ports.contract";
export {
  NotificationStatus,
  createNotification,
  withNotificationStatus,
  withChannelReference,
  isNotificationStatus,
} from "./models/notification.model";
export type { Notification } from "./models/notification.model";
export { createNotificationHistoryEntry } from "./models/notification-history.model";
export type {
  NotificationHistoryEntry,
  NotificationHistoryView,
  CancelNotificationResult,
  RetryNotificationResult,
  SendNotificationResult,
  NotificationsListResult,
} from "./models/notification-history.model";
export { NotificationManagementService } from "./services/notification-management.service";
export { NotificationManagementApplicationService } from "./services/notification-management-application.service";
export {
  CreateNotificationUseCase,
  SendNotificationUseCase,
  GetNotificationUseCase,
  GetNotificationsUseCase,
  RetryNotificationUseCase,
  CancelNotificationUseCase,
  GetNotificationHistoryUseCase,
} from "./use-cases/notification-management.use-cases";
