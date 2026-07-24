import type { IExplainabilityProfileSerializer } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-serializer.contract";
import {
  createExplainabilityProfile,
  type ExplainabilityProfile,
} from "@server/application/ai-explainability-profile-registry/models/explainability-profile.model";

/** JSON-based explainability profile serializer. */
export class JsonExplainabilityProfileSerializer implements IExplainabilityProfileSerializer {
  async serialize(explainabilityProfile: ExplainabilityProfile): Promise<string> {
    return JSON.stringify(explainabilityProfile);
  }

  async deserialize(serialized: string): Promise<ExplainabilityProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized explainability profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ExplainabilityProfile>;
    return createExplainabilityProfile({
      explainabilityProfileId: parsed.explainabilityProfileId ?? "",
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
