export {
  type ReleaseCreatedEvent,
  createReleaseCreatedEvent,
} from "./release-created.event";
export {
  type ReleaseValidatedEvent,
  createReleaseValidatedEvent,
} from "./release-validated.event";
export {
  type ReleasePackagedEvent,
  createReleasePackagedEvent,
} from "./release-packaged.event";
export {
  type ReleasePublishedEvent,
  createReleasePublishedEvent,
} from "./release-published.event";

export type ReleasePlatformEvent =
  | ReleaseCreatedEvent
  | ReleaseValidatedEvent
  | ReleasePackagedEvent
  | ReleasePublishedEvent;
