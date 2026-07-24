import type { PlatformSnapshot } from "@server/platform/digital-twin/digital-twin/models";

/** Contract for twin synchronization with platform metadata. */
export interface ISynchronizationEngine {
  synchronize(): readonly PlatformSnapshot[];
}
