export type SerializationFormat = "json";

/** Serialization profile for SDK data exchange. */
export interface SerializationProfile {
  readonly id: string;
  readonly format: SerializationFormat;
  readonly dtoMapping: boolean;
  readonly contractMapping: boolean;
  readonly versionMapping: boolean;
}

export function createSerializationProfile(input: {
  id?: string;
  format?: SerializationFormat;
  dtoMapping?: boolean;
  contractMapping?: boolean;
  versionMapping?: boolean;
}): SerializationProfile {
  return Object.freeze({
    id: input.id ?? "default-json-profile",
    format: input.format ?? "json",
    dtoMapping: input.dtoMapping ?? true,
    contractMapping: input.contractMapping ?? true,
    versionMapping: input.versionMapping ?? true,
  });
}
