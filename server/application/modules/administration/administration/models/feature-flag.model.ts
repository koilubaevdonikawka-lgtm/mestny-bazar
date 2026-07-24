/** Server-side feature flag owned by Administration. */
export interface FeatureFlag {
  readonly key: string;
  readonly enabled: boolean;
  readonly description: string | null;
  readonly updatedAt: string;
  readonly updatedBy: string;
}

export function createFeatureFlag(input: {
  key: string;
  enabled?: boolean;
  description?: string | null;
  updatedBy: string;
}): FeatureFlag {
  const timestamp = new Date().toISOString();
  return Object.freeze({
    key: input.key.trim(),
    enabled: input.enabled ?? false,
    description: input.description?.trim() || null,
    updatedAt: timestamp,
    updatedBy: input.updatedBy.trim(),
  });
}

export function withFeatureFlagUpdate(
  flag: FeatureFlag,
  input: {
    enabled: boolean;
    description?: string | null;
    updatedBy: string;
  },
): FeatureFlag {
  return Object.freeze({
    ...flag,
    enabled: input.enabled,
    description:
      input.description === undefined ? flag.description : input.description?.trim() || null,
    updatedAt: new Date().toISOString(),
    updatedBy: input.updatedBy.trim(),
  });
}
