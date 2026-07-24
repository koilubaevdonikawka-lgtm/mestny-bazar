import type { IRiskProfileSerializer } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-serializer.contract";
import {
  createRiskProfile,
  type RiskProfile,
} from "@server/application/ai-risk-profile-registry/models/risk-profile.model";

/** JSON-based risk profile serializer. */
export class JsonRiskProfileSerializer implements IRiskProfileSerializer {
  async serialize(riskProfile: RiskProfile): Promise<string> {
    return JSON.stringify(riskProfile);
  }

  async deserialize(serialized: string): Promise<RiskProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized risk profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<RiskProfile>;
    return createRiskProfile({
      riskProfileId: parsed.riskProfileId ?? "",
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
