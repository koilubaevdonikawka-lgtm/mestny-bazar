import type { CapabilityCatalog } from "@server/platform/capabilities/capabilities/models";

export interface CatalogGeneratedEvent {
  readonly type: "capabilities.catalog.generated";
  readonly catalog: CapabilityCatalog;
}

export function createCatalogGeneratedEvent(catalog: CapabilityCatalog): CatalogGeneratedEvent {
  return Object.freeze({ type: "capabilities.catalog.generated", catalog });
}
