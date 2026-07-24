/** Feature flag definition — no domain data. */
export interface FeatureFlag {
  readonly flagId: string;
  readonly key: string;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly tags: Readonly<Record<string, string>>;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FeatureFlagStatus {
  readonly key: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly updatedAt: string;
}

export interface RegisterFeatureFlagInput {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly enabled?: boolean;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface UpdateFeatureFlagInput {
  readonly key: string;
  readonly name?: string;
  readonly description?: string;
  readonly tags?: Readonly<Record<string, string>>;
}

export interface ListFeatureFlagsResult {
  readonly flags: readonly FeatureFlag[];
  readonly total: number;
}

export function createFeatureFlag(input: {
  flagId: string;
  key: string;
  name: string;
  description?: string;
  enabled?: boolean;
  tags?: Readonly<Record<string, string>>;
  createdAt?: string;
  updatedAt?: string;
}): FeatureFlag {
  const now = new Date().toISOString();
  return Object.freeze({
    flagId: input.flagId.trim(),
    key: input.key.trim(),
    name: input.name.trim(),
    description: (input.description ?? "").trim(),
    enabled: input.enabled ?? false,
    tags: Object.freeze({ ...(input.tags ?? {}) }),
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
  });
}

export function toFeatureFlagStatus(flag: FeatureFlag): FeatureFlagStatus {
  return Object.freeze({
    key: flag.key,
    name: flag.name,
    enabled: flag.enabled,
    updatedAt: flag.updatedAt,
  });
}
