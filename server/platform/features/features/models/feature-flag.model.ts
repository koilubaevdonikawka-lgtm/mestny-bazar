export type FeatureFlagKind =
  | "boolean"
  | "percentage"
  | "environment"
  | "provider"
  | "platform";

/** Feature flag metadata descriptor. */
export interface FeatureFlag {
  readonly id: string;
  readonly featureId: string;
  readonly kind: FeatureFlagKind;
  readonly enabled: boolean;
  readonly value: boolean | number | string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createFeatureFlag(input: {
  id?: string;
  featureId: string;
  kind: FeatureFlagKind;
  enabled?: boolean;
  value?: boolean | number | string;
  metadata?: Readonly<Record<string, unknown>>;
}): FeatureFlag {
  return Object.freeze({
    id: input.id ?? `flag-${Date.now()}`,
    featureId: input.featureId.trim(),
    kind: input.kind,
    enabled: input.enabled ?? true,
    value: input.value ?? true,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
