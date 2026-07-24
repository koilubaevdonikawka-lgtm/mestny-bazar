import type { IGovernancePolicySerializer } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-serializer.contract";
import {
  createGovernancePolicy,
  type GovernancePolicy,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";

/** JSON-based governance policy serializer. */
export class JsonGovernancePolicySerializer implements IGovernancePolicySerializer {
  async serialize(governancePolicy: GovernancePolicy): Promise<string> {
    return JSON.stringify(governancePolicy);
  }

  async deserialize(serialized: string): Promise<GovernancePolicy> {
    if (!serialized.trim()) {
      throw new Error("Serialized governance policy cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<GovernancePolicy>;
    return createGovernancePolicy({
      governancePolicyId: parsed.governancePolicyId ?? "",
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
