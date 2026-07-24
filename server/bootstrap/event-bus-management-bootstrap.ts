import type { IEventDispatcher } from "@server/application/event-bus-management/contracts/event-dispatcher.contract";
import type { IEventHistoryRepository } from "@server/application/event-bus-management/contracts/event-history-repository.contract";
import type { IEventPublisher } from "@server/application/event-bus-management/contracts/event-publisher.contract";
import type { IEventRepository } from "@server/application/event-bus-management/contracts/event-repository.contract";
import type { IEventSubscriber } from "@server/application/event-bus-management/contracts/event-subscriber.contract";
import {
  ClearEventHistoryUseCase,
  EventBusManagementApplicationService,
  EventBusManagementService,
  GetEventHistoryUseCase,
  GetEventUseCase,
  ListEventsUseCase,
  PublishEventUseCase,
  RegisterEventUseCase,
  SubscribeEventUseCase,
  UnsubscribeEventUseCase,
} from "@server/application/event-bus-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultEventDispatcher } from "@server/infrastructure/event-bus-management/default-event.dispatcher";
import { EventHistoryRepository } from "@server/infrastructure/event-bus-management/event-history.repository";
import { EventRepository } from "@server/infrastructure/event-bus-management/event.repository";
import { InMemoryEventPublisher } from "@server/infrastructure/event-bus-management/in-memory-event.publisher";
import { InMemoryEventSubscriber } from "@server/infrastructure/event-bus-management/in-memory-event.subscriber";

/** Registers event bus management services and use cases. */
export function registerEventBusManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.EventBusManagementEventRepository, () =>
    new EventRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.EventBusManagementEventPublisher, () =>
    new InMemoryEventPublisher(),
  );

  registry.registerSingleton(InfrastructureTokens.EventBusManagementEventSubscriber, () =>
    new InMemoryEventSubscriber(),
  );

  registry.registerSingleton(
    InfrastructureTokens.EventBusManagementEventDispatcher,
    (provider) =>
      new DefaultEventDispatcher(
        provider.resolve<IEventSubscriber>(InfrastructureTokens.EventBusManagementEventSubscriber),
      ),
  );

  registry.registerSingleton(InfrastructureTokens.EventBusManagementEventHistoryRepository, () =>
    new EventHistoryRepository(),
  );

  registry.registerTransient(InfrastructureTokens.EventBusManagementService, (provider) =>
    new EventBusManagementService(
      provider.resolve<IEventRepository>(InfrastructureTokens.EventBusManagementEventRepository),
      provider.resolve<IEventPublisher>(InfrastructureTokens.EventBusManagementEventPublisher),
      provider.resolve<IEventSubscriber>(InfrastructureTokens.EventBusManagementEventSubscriber),
      provider.resolve<IEventDispatcher>(InfrastructureTokens.EventBusManagementEventDispatcher),
      provider.resolve<IEventHistoryRepository>(
        InfrastructureTokens.EventBusManagementEventHistoryRepository,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.EventBusManagementRegisterEventUseCase,
    (provider) =>
      new RegisterEventUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementPublishEventUseCase,
    (provider) =>
      new PublishEventUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementSubscribeEventUseCase,
    (provider) =>
      new SubscribeEventUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementUnsubscribeEventUseCase,
    (provider) =>
      new UnsubscribeEventUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementGetEventUseCase,
    (provider) =>
      new GetEventUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementListEventsUseCase,
    (provider) =>
      new ListEventsUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementGetEventHistoryUseCase,
    (provider) =>
      new GetEventHistoryUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.EventBusManagementClearEventHistoryUseCase,
    (provider) =>
      new ClearEventHistoryUseCase(
        provider.resolve<EventBusManagementService>(InfrastructureTokens.EventBusManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.EventBusManagementApplicationService,
    (provider) =>
      new EventBusManagementApplicationService(
        provider.resolve<RegisterEventUseCase>(
          InfrastructureTokens.EventBusManagementRegisterEventUseCase,
        ),
        provider.resolve<PublishEventUseCase>(
          InfrastructureTokens.EventBusManagementPublishEventUseCase,
        ),
        provider.resolve<SubscribeEventUseCase>(
          InfrastructureTokens.EventBusManagementSubscribeEventUseCase,
        ),
        provider.resolve<UnsubscribeEventUseCase>(
          InfrastructureTokens.EventBusManagementUnsubscribeEventUseCase,
        ),
        provider.resolve<GetEventUseCase>(
          InfrastructureTokens.EventBusManagementGetEventUseCase,
        ),
        provider.resolve<ListEventsUseCase>(
          InfrastructureTokens.EventBusManagementListEventsUseCase,
        ),
        provider.resolve<GetEventHistoryUseCase>(
          InfrastructureTokens.EventBusManagementGetEventHistoryUseCase,
        ),
        provider.resolve<ClearEventHistoryUseCase>(
          InfrastructureTokens.EventBusManagementClearEventHistoryUseCase,
        ),
      ),
  );
}
