import type { PublishedEvent } from "@server/application/event-bus-management/models/event.model";

export interface IEventDispatcher {
  dispatch(event: PublishedEvent): Promise<number>;
}
