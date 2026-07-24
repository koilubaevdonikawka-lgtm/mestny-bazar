import type { IPrivacyProfileSerializer } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-serializer.contract";
import {
  createPrivacyProfile,
  type PrivacyProfile,
} from "@server/application/ai-privacy-profile-registry/models/privacy-profile.model";

/** JSON-based privacy profile serializer. */
export class JsonPrivacyProfileSerializer implements IPrivacyProfileSerializer {
  async serialize(privacyProfile: PrivacyProfile): Promise<string> {
    return JSON.stringify(privacyProfile);
  }

  async deserialize(serialized: string): Promise<PrivacyProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized privacy profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<PrivacyProfile>;
    return createPrivacyProfile({
      privacyProfileId: parsed.privacyProfileId ?? "",
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
