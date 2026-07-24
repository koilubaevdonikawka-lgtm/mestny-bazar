import type { IComplianceProfileSerializer } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-serializer.contract";
import {
  createComplianceProfile,
  type ComplianceProfile,
} from "@server/application/ai-compliance-profile-registry/models/compliance-profile.model";

/** JSON-based compliance profile serializer. */
export class JsonComplianceProfileSerializer implements IComplianceProfileSerializer {
  async serialize(complianceProfile: ComplianceProfile): Promise<string> {
    return JSON.stringify(complianceProfile);
  }

  async deserialize(serialized: string): Promise<ComplianceProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized compliance profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<ComplianceProfile>;
    return createComplianceProfile({
      complianceProfileId: parsed.complianceProfileId ?? "",
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
