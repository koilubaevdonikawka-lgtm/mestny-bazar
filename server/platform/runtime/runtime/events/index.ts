export {
  ApplicationStartedEventName,
  type ApplicationStartedEvent,
  createApplicationStartedEvent,
} from "./application-started.event";
export {
  ApplicationStoppedEventName,
  type ApplicationStoppedEvent,
  createApplicationStoppedEvent,
} from "./application-stopped.event";
export {
  ProviderHealthChangedEventName,
  type ProviderHealthChangedEvent,
  createProviderHealthChangedEvent,
} from "./provider-health-changed.event";
export {
  ConfigurationReloadedEventName,
  type ConfigurationReloadedEvent,
  createConfigurationReloadedEvent,
} from "./configuration-reloaded.event";

export type RuntimePlatformEvent =
  | ApplicationStartedEvent
  | ApplicationStoppedEvent
  | ProviderHealthChangedEvent
  | ConfigurationReloadedEvent;
