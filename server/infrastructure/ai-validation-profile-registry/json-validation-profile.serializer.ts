import type { IValidationProfileSerializer } from "@server/application/ai-validation-profile-registry/contracts/validation-profile-serializer.contract";
import {
  createValidationProfile,
  type ValidationProfile,
} from "@server/application/ai-validation-profile-registry/models/validation-profile.model";

/** JSON-based validation profile serializer. */
export class JsonValidationProfileSerializer implements IValidationProfileSerializer {
  async serialize(validationProfile: ValidationProfile): Promise<string> {
    return JSON.stringify(validationProfile);
  }

  async deserialize(serialized: string): Promise<ValidationProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized validation profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ValidationProfile>;
    return createValidationProfile({
      validationProfileId: parsed.validationProfileId ?? "",
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
