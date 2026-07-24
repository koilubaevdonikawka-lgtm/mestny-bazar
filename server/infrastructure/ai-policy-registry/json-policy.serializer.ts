import type { IPolicySerializer } from "@server/application/ai-policy-registry/contracts/policy-serializer.contract";
import {
  createPolicy,
  type Policy,
} from "@server/application/ai-policy-registry/models/policy.model";

/** JSON-based policy serializer. */
export class JsonPolicySerializer implements IPolicySerializer {
  async serialize(policy: Policy): Promise<string> {
    return JSON.stringify(policy);
  }

  async deserialize(serialized: string): Promise<Policy> {
    if (!serialized.trim()) {
      throw new Error("Serialized policy cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Policy>;
    return createPolicy({
      policyId: parsed.policyId ?? "",
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
