import type { IAccountabilityProfileSerializer } from "@server/application/ai-accountability-profile-registry/contracts/accountability-profile-serializer.contract";
import {
  createAccountabilityProfile,
  type AccountabilityProfile,
} from "@server/application/ai-accountability-profile-registry/models/accountability-profile.model";

/** JSON-based accountability profile serializer. */
export class JsonAccountabilityProfileSerializer implements IAccountabilityProfileSerializer {
  async serialize(accountabilityProfile: AccountabilityProfile): Promise<string> {
    return JSON.stringify(accountabilityProfile);
  }

  async deserialize(serialized: string): Promise<AccountabilityProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized accountability profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<AccountabilityProfile>;
    return createAccountabilityProfile({
      accountabilityProfileId: parsed.accountabilityProfileId ?? "",
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
