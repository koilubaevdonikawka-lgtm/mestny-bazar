import type {
  PublishEventInput,
  RegisterEventInput,
  SubscribeEventInput,
  UnsubscribeEventInput,
} from "@server/application/event-bus-management/models/event.model";
import {
  ClearEventHistoryUseCase,
  GetEventHistoryUseCase,
  GetEventUseCase,
  ListEventsUseCase,
  PublishEventUseCase,
  RegisterEventUseCase,
  SubscribeEventUseCase,
  UnsubscribeEventUseCase,
} from "@server/application/event-bus-management/use-cases/event-bus-management.use-cases";

/** Application facade for event bus management scenario. */
export class EventBusManagementApplicationService {
  constructor(
    private readonly registerEventUseCase: RegisterEventUseCase,
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly subscribeEventUseCase: SubscribeEventUseCase,
    private readonly unsubscribeEventUseCase: UnsubscribeEventUseCase,
    private readonly getEventUseCase: GetEventUseCase,
    private readonly listEventsUseCase: ListEventsUseCase,
    private readonly getEventHistoryUseCase: GetEventHistoryUseCase,
    private readonly clearEventHistoryUseCase: ClearEventHistoryUseCase,
  ) {}

  registerEvent(input: RegisterEventInput) {
    return this.registerEventUseCase.execute(input);
  }

  publishEvent(input: PublishEventInput) {
    return this.publishEventUseCase.execute(input);
  }

  subscribeEvent(input: SubscribeEventInput) {
    return this.subscribeEventUseCase.execute(input);
  }

  unsubscribeEvent(input: UnsubscribeEventInput) {
    return this.unsubscribeEventUseCase.execute(input);
  }

  getEvent(eventId: string) {
    return this.getEventUseCase.execute(eventId);
  }

  listEvents() {
    return this.listEventsUseCase.execute();
  }

  getEventHistory() {
    return this.getEventHistoryUseCase.execute();
  }

  clearEventHistory() {
    return this.clearEventHistoryUseCase.execute();
  }
}
