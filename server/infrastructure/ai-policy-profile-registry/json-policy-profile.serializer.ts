import type { IPolicyProfileSerializer } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-serializer.contract";
import {
  createPolicyProfile,
  type PolicyProfile,
} from "@server/application/ai-policy-profile-registry/models/policy-profile.model";

/** JSON-based policy profile serializer. */
export class JsonPolicyProfileSerializer implements IPolicyProfileSerializer {
  async serialize(policyProfile: PolicyProfile): Promise<string> {
    return JSON.stringify(policyProfile);
  }

  async deserialize(serialized: string): Promise<PolicyProfile> {
    if (!serialized.trim()) {
      throw new Error("Serialized policy profile cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<PolicyProfile>;
    return createPolicyProfile({
      policyProfileId: parsed.policyProfileId ?? "",
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
