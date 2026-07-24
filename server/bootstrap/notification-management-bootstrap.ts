import type { INotificationChannel } from "@server/application/notification-management/contracts/notification-channel.contract";
import type { INotificationEventPublisher } from "@server/application/notification-management/contracts/notification-event-publisher.contract";
import type { INotificationHistoryRepository } from "@server/application/notification-management/contracts/notification-history-repository.contract";
import type { INotificationRepository } from "@server/application/notification-management/contracts/notification-repository.contract";
import type { INotificationStatusProvider } from "@server/application/notification-management/contracts/notification-status-provider.contract";
import type { INotificationTemplateProvider } from "@server/application/notification-management/contracts/notification-template-provider.contract";
import {
  CancelNotificationUseCase,
  CreateNotificationUseCase,
  GetNotificationHistoryUseCase,
  GetNotificationsUseCase,
  GetNotificationUseCase,
  NotificationManagementApplicationService,
  NotificationManagementService,
  RetryNotificationUseCase,
  SendNotificationUseCase,
} from "@server/application/notification-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultNotificationStatusProvider } from "@server/infrastructure/notification-management/default-notification-status.provider";
import { DefaultNotificationTemplateProvider } from "@server/infrastructure/notification-management/default-notification-template.provider";
import { MockNotificationChannel } from "@server/infrastructure/notification-management/mock-notification.channel";
import { NoopNotificationEventPublisher } from "@server/infrastructure/notification-management/noop-notification-event.publisher";
import { NotificationHistoryRepository } from "@server/infrastructure/notification-management/notification-history.repository";
import { NotificationRepository } from "@server/infrastructure/notification-management/notification.repository";

/** Registers notification management services and use cases. */
export function registerNotificationManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.NotificationManagementRepository, () =>
    new NotificationRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationManagementHistoryRepository, () =>
    new NotificationHistoryRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationManagementChannel, () =>
    new MockNotificationChannel(),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationStatusProvider, () =>
    new DefaultNotificationStatusProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationTemplateProvider, () =>
    new DefaultNotificationTemplateProvider(),
  );

  registry.registerSingleton(InfrastructureTokens.NotificationEventPublisher, () =>
    new NoopNotificationEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.NotificationManagementService, (provider) =>
    new NotificationManagementService(
      provider.resolve<INotificationRepository>(
        InfrastructureTokens.NotificationManagementRepository,
      ),
      provider.resolve<INotificationChannel>(InfrastructureTokens.NotificationManagementChannel),
      provider.resolve<INotificationStatusProvider>(
        InfrastructureTokens.NotificationStatusProvider,
      ),
      provider.resolve<INotificationTemplateProvider>(
        InfrastructureTokens.NotificationTemplateProvider,
      ),
      provider.resolve<INotificationHistoryRepository>(
        InfrastructureTokens.NotificationManagementHistoryRepository,
      ),
      provider.resolve<INotificationEventPublisher>(
        InfrastructureTokens.NotificationEventPublisher,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.NotificationManagementCreateNotificationUseCase,
    (provider) =>
      new CreateNotificationUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementSendNotificationUseCase,
    (provider) =>
      new SendNotificationUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementGetNotificationUseCase,
    (provider) =>
      new GetNotificationUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementGetNotificationsUseCase,
    (provider) =>
      new GetNotificationsUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementRetryNotificationUseCase,
    (provider) =>
      new RetryNotificationUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementCancelNotificationUseCase,
    (provider) =>
      new CancelNotificationUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.NotificationManagementGetNotificationHistoryUseCase,
    (provider) =>
      new GetNotificationHistoryUseCase(
        provider.resolve<NotificationManagementService>(
          InfrastructureTokens.NotificationManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.NotificationManagementApplicationService,
    (provider) =>
      new NotificationManagementApplicationService(
        provider.resolve<CreateNotificationUseCase>(
          InfrastructureTokens.NotificationManagementCreateNotificationUseCase,
        ),
        provider.resolve<SendNotificationUseCase>(
          InfrastructureTokens.NotificationManagementSendNotificationUseCase,
        ),
        provider.resolve<GetNotificationUseCase>(
          InfrastructureTokens.NotificationManagementGetNotificationUseCase,
        ),
        provider.resolve<GetNotificationsUseCase>(
          InfrastructureTokens.NotificationManagementGetNotificationsUseCase,
        ),
        provider.resolve<RetryNotificationUseCase>(
          InfrastructureTokens.NotificationManagementRetryNotificationUseCase,
        ),
        provider.resolve<CancelNotificationUseCase>(
          InfrastructureTokens.NotificationManagementCancelNotificationUseCase,
        ),
        provider.resolve<GetNotificationHistoryUseCase>(
          InfrastructureTokens.NotificationManagementGetNotificationHistoryUseCase,
        ),
      ),
  );
}
