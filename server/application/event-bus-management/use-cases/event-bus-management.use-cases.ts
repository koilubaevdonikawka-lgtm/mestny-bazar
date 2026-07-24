import type {
  ClearEventHistoryResult,
  EventDefinition,
  EventHistoryResult,
  EventSubscription,
  ListEventsResult,
  PublishEventInput,
  PublishedEvent,
  RegisterEventInput,
  SubscribeEventInput,
  UnsubscribeEventInput,
} from "@server/application/event-bus-management/models/event.model";
import type { EventBusManagementService } from "@server/application/event-bus-management/services/event-bus-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterEventUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(input: RegisterEventInput): Promise<UseCaseResult<EventDefinition>> {
    return this.eventBus.registerEvent(input).then(useCaseResult);
  }
}

export class PublishEventUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(input: PublishEventInput): Promise<UseCaseResult<PublishedEvent>> {
    return this.eventBus.publishEvent(input).then(useCaseResult);
  }
}

export class SubscribeEventUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(input: SubscribeEventInput): Promise<UseCaseResult<EventSubscription>> {
    return this.eventBus.subscribeEvent(input).then(useCaseResult);
  }
}

export class UnsubscribeEventUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(input: UnsubscribeEventInput): Promise<UseCaseResult<{ subscriptionId: string; unsubscribed: boolean }>> {
    return this.eventBus.unsubscribeEvent(input).then(useCaseResult);
  }
}

export class GetEventUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(eventId: string): Promise<UseCaseResult<EventDefinition | null>> {
    return this.eventBus.getEvent(eventId).then(useCaseResult);
  }
}

export class ListEventsUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(): Promise<UseCaseResult<ListEventsResult>> {
    return this.eventBus.listEvents().then(useCaseResult);
  }
}

export class GetEventHistoryUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(): Promise<UseCaseResult<EventHistoryResult>> {
    return this.eventBus.getEventHistory().then(useCaseResult);
  }
}

export class ClearEventHistoryUseCase {
  constructor(private readonly eventBus: EventBusManagementService) {}

  execute(): Promise<UseCaseResult<ClearEventHistoryResult>> {
    return this.eventBus.clearEventHistory().then(useCaseResult);
  }
}
