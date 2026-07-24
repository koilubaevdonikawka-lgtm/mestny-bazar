import type { ITrustProfileSerializer } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-serializer.contract";
import {
  createTrustProfile,
  type TrustProfile,
} from "@server/application/ai-trust-profile-registry/models/trust-profile.model";

/** JSON-based trust profile serializer. */
export class JsonTrustProfileSerializer implements ITrustProfileSerializer {
  async serialize(trustProfile: TrustProfile): Promise<string> {
    return JSON.stringify(trustProfile);
  }

  async deserialize(serialized: string): Promise<TrustProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized trust profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<TrustProfile>;
    return createTrustProfile({
      trustProfileId: parsed.trustProfileId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
