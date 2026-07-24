export const ArchitectureNodeKind = {
  BusinessCapabilityModule: "business-capability-module",
  BusinessProcessModule: "business-process-module",
  PlatformModule: "platform-module",
  InfrastructureAdapter: "infrastructure-adapter",
  ProviderAdapter: "provider-adapter",
  Contract: "contract",
  DomainEvent: "domain-event",
} as const;

export type ArchitectureNodeKindValue =
  (typeof ArchitectureNodeKind)[keyof typeof ArchitectureNodeKind];

export const ArchitectureLayer = {
  Domain: "domain",
  Application: "application",
  Platform: "platform",
  Infrastructure: "infrastructure",
  Integration: "integration",
} as const;

export type ArchitectureLayerValue = (typeof ArchitectureLayer)[keyof typeof ArchitectureLayer];

/** Registered architecture node. */
export interface ArchitectureNode {
  readonly id: string;
  readonly name: string;
  readonly kind: ArchitectureNodeKindValue;
  readonly layer: ArchitectureLayerValue;
  readonly description?: string;
  readonly registered: boolean;
}

export function createArchitectureNode(input: {
  id: string;
  name: string;
  kind: ArchitectureNodeKindValue;
  layer: ArchitectureLayerValue;
  description?: string;
  registered?: boolean;
}): ArchitectureNode {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    kind: input.kind,
    layer: input.layer,
    description: input.description?.trim() || undefined,
    registered: input.registered ?? true,
  });
}
