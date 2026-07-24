export {
  type CapabilityRegisteredEvent,
  createCapabilityRegisteredEvent,
} from "./capability-registered.event";
export {
  type CapabilitiesDiscoveredEvent,
  createCapabilitiesDiscoveredEvent,
} from "./capabilities-discovered.event";
export {
  type DependenciesResolvedEvent,
  createDependenciesResolvedEvent,
} from "./dependencies-resolved.event";
export {
  type AvailabilityCalculatedEvent,
  createAvailabilityCalculatedEvent,
} from "./availability-calculated.event";
export {
  type CatalogGeneratedEvent,
  createCatalogGeneratedEvent,
} from "./catalog-generated.event";

export type CapabilityPlatformEvent =
  | CapabilityRegisteredEvent
  | CapabilitiesDiscoveredEvent
  | DependenciesResolvedEvent
  | AvailabilityCalculatedEvent
  | CatalogGeneratedEvent;
