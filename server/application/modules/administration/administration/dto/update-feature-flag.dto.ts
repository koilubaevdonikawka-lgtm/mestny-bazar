export interface UpdateFeatureFlagDto {
  readonly actorId: string;
  readonly key: string;
  readonly enabled: boolean;
  readonly description?: string;
}

export interface GetFeatureFlagDto {
  readonly key: string;
}
