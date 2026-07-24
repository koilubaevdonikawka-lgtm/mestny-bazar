import type { IInfrastructureProfileSerializer } from "@server/application/ai-infrastructure-profile-registry/contracts/infrastructure-profile-serializer.contract";
import {
  createInfrastructureProfile,
  type InfrastructureProfile,
} from "@server/application/ai-infrastructure-profile-registry/models/infrastructure-profile.model";

/** JSON-based infrastructure profile serializer. */
export class JsonInfrastructureProfileSerializer implements IInfrastructureProfileSerializer {
  async serialize(infrastructureProfile: InfrastructureProfile): Promise<string> {
    return JSON.stringify(infrastructureProfile);
  }

  async deserialize(serialized: string): Promise<InfrastructureProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized infrastructure profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<InfrastructureProfile>;
    return createInfrastructureProfile({
      infrastructureProfileId: parsed.infrastructureProfileId ?? "",
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
