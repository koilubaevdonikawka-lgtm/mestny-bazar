import type { IGovernanceProfileSerializer } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-serializer.contract";
import {
  createGovernanceProfile,
  type GovernanceProfile,
} from "@server/application/ai-governance-profile-registry/models/governance-profile.model";

/** JSON-based governance profile serializer. */
export class JsonGovernanceProfileSerializer implements IGovernanceProfileSerializer {
  async serialize(governanceProfile: GovernanceProfile): Promise<string> {
    return JSON.stringify(governanceProfile);
  }

  async deserialize(serialized: string): Promise<GovernanceProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized governance profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<GovernanceProfile>;
    return createGovernanceProfile({
      governanceProfileId: parsed.governanceProfileId ?? "",
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
