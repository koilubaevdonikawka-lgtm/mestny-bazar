import type { ArchitectureNodeKindValue, ArchitectureLayerValue } from "./architecture-node.model";

/** Descriptor for a business or process module. */
export interface ModuleDescriptor {
  readonly id: string;
  readonly name: string;
  readonly kind: ArchitectureNodeKindValue;
  readonly layer: ArchitectureLayerValue;
  readonly moduleApiToken: string;
  readonly publicMethods: readonly string[];
  readonly dependencies: readonly string[];
}

export function createModuleDescriptor(input: {
  id: string;
  name: string;
  kind: ArchitectureNodeKindValue;
  layer: ArchitectureLayerValue;
  moduleApiToken: string;
  publicMethods?: readonly string[];
  dependencies?: readonly string[];
}): ModuleDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    kind: input.kind,
    layer: input.layer,
    moduleApiToken: input.moduleApiToken.trim(),
    publicMethods: Object.freeze([...(input.publicMethods ?? [])]),
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
  });
}
