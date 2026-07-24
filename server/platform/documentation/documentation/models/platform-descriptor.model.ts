/** Descriptor for a platform module. */
export interface PlatformDescriptor {
  readonly id: string;
  readonly name: string;
  readonly path: string;
  readonly components: readonly string[];
  readonly dependencies: readonly string[];
}

export function createPlatformDescriptor(input: {
  id: string;
  name: string;
  path: string;
  components?: readonly string[];
  dependencies?: readonly string[];
}): PlatformDescriptor {
  return Object.freeze({
    id: input.id.trim(),
    name: input.name.trim(),
    path: input.path.trim(),
    components: Object.freeze([...(input.components ?? [])]),
    dependencies: Object.freeze([...(input.dependencies ?? [])]),
  });
}
