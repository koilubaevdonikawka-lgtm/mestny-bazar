import type {
  CapabilityDependency,
  CapabilityDescriptor,
} from "@server/platform/capabilities/capabilities/models";

/** Contract for capability dependency resolution (metadata only). */
export interface ICapabilityDependencyEngine {
  resolve(
    capability: CapabilityDescriptor,
    all: readonly CapabilityDescriptor[],
  ): CapabilityDependency;
  buildGraph(capabilities: readonly CapabilityDescriptor[]): Readonly<Record<string, readonly string[]>>;
}
