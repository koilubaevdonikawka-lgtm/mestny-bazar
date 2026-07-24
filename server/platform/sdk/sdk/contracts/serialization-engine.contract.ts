import type { SerializationProfile } from "@server/platform/sdk/sdk/models";

/** Contract for SDK serialization and deserialization. */
export interface ISerializationEngine {
  serialize<T>(payload: T, profile?: SerializationProfile): string;
  deserialize<T>(payload: string, profile?: SerializationProfile): T;
  getProfile(profileId?: string): SerializationProfile;
}
