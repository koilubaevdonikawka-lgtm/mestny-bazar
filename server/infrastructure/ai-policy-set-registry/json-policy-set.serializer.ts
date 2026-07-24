import type { IPolicySetSerializer } from "@server/application/ai-policy-set-registry/contracts/policy-set-serializer.contract";
import {
  createPolicySet,
  type PolicySet,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";

/** JSON-based policy set serializer. */
export class JsonPolicySetSerializer implements IPolicySetSerializer {
  async serialize(policySet: PolicySet): Promise<string> {
    return JSON.stringify(policySet);
  }

  async deserialize(serialized: string): Promise<PolicySet> {
    if (!serialized.trim()) {
      throw new Error("Serialized policy set cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<PolicySet>;
    return createPolicySet({
      policySetId: parsed.policySetId ?? "",
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
