export type FeatureCategory =
  | "platform"
  | "experimental"
  | "beta"
  | "internal"
  | "deprecated";

/** Registered platform feature metadata. */
export interface FeatureDescriptor {
  readonly id: string;
  readonly name: string;
  readonly category: FeatureCategory;
  readonly description: string;
  readonly enabled: boolean;
  readonly registeredAt: string;
  readonly updatedAt: string;
}

export function createFeatureDescriptor(input: {
  id?: string;
  name: string;
  category: FeatureCategory;
  description?: string;
  enabled?: boolean;
  registeredAt?: string;
  updatedAt?: string;
}): FeatureDescriptor {
  const now = new Date().toISOString();
  return Object.freeze({
    id: input.id ?? `feature-${Date.now()}`,
    name: input.name.trim(),
    category: input.category,
    description: input.description?.trim() ?? "",
    enabled: input.enabled ?? false,
    registeredAt: input.registeredAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}
