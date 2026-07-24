import type { ISerializationEngine } from "@server/platform/sdk/sdk/contracts";
import {
  createSerializationProfile,
  type SerializationProfile,
} from "@server/platform/sdk/sdk/models";

const DEFAULT_PROFILE = createSerializationProfile({ id: "default-json-profile" });

/** Serializes and deserializes SDK payloads with DTO and contract mapping. */
export class SerializationEngine implements ISerializationEngine {
  private readonly profiles = new Map<string, SerializationProfile>([
    [DEFAULT_PROFILE.id, DEFAULT_PROFILE],
  ]);

  getProfile(profileId?: string): SerializationProfile {
    const id = profileId?.trim() || DEFAULT_PROFILE.id;
    return this.profiles.get(id) ?? DEFAULT_PROFILE;
  }

  serialize<T>(payload: T, profile?: SerializationProfile): string {
    const activeProfile = profile ?? DEFAULT_PROFILE;
    const mapped = this.applyMappings(payload, activeProfile);
    return JSON.stringify(mapped);
  }

  deserialize<T>(payload: string, profile?: SerializationProfile): T {
    const activeProfile = profile ?? DEFAULT_PROFILE;
    const parsed = JSON.parse(payload) as T;
    return this.applyReverseMappings(parsed, activeProfile) as T;
  }

  registerProfile(profile: SerializationProfile): void {
    this.profiles.set(profile.id, Object.freeze({ ...profile }));
  }

  private applyMappings<T>(payload: T, profile: SerializationProfile): unknown {
    if (!profile.dtoMapping && !profile.contractMapping && !profile.versionMapping) {
      return payload;
    }
    if (payload && typeof payload === "object") {
      return Object.freeze({
        ...(payload as Record<string, unknown>),
        _sdk: Object.freeze({
          format: profile.format,
          dtoMapping: profile.dtoMapping,
          contractMapping: profile.contractMapping,
          versionMapping: profile.versionMapping,
        }),
      });
    }
    return payload;
  }

  private applyReverseMappings<T>(payload: T, profile: SerializationProfile): unknown {
    if (!payload || typeof payload !== "object") {
      return payload;
    }
    const record = { ...(payload as Record<string, unknown>) };
    if (profile.dtoMapping || profile.contractMapping || profile.versionMapping) {
      delete record._sdk;
    }
    return record;
  }
}
