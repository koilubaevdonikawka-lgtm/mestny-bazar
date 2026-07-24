import type { CapabilityCatalog } from "@server/platform/capabilities/capabilities/models";

/** Contract for capability catalog generation. */
export interface ICapabilityCatalog {
  generate(): CapabilityCatalog;
}
