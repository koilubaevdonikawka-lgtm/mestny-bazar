export const ArchitectureDependencyKind = {
  Uses: "uses",
  Implements: "implements",
  Registers: "registers",
  Publishes: "publishes",
} as const;

export type ArchitectureDependencyKindValue =
  (typeof ArchitectureDependencyKind)[keyof typeof ArchitectureDependencyKind];

/** Directed dependency between architecture nodes. */
export interface ArchitectureDependency {
  readonly from: string;
  readonly to: string;
  readonly kind: ArchitectureDependencyKindValue;
  readonly description?: string;
}

export function createArchitectureDependency(input: {
  from: string;
  to: string;
  kind: ArchitectureDependencyKindValue;
  description?: string;
}): ArchitectureDependency {
  return Object.freeze({
    from: input.from.trim(),
    to: input.to.trim(),
    kind: input.kind,
    description: input.description?.trim() || undefined,
  });
}
