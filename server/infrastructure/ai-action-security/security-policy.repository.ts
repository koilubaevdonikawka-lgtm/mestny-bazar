import type { ISecurityPolicyRepository } from "@server/application/ai-action-security/contracts/security-policy-repository.contract";
import type { SecurityPolicy } from "@server/application/ai-action-security/models/security-policy.model";

/** In-memory security policy store. */
export class SecurityPolicyRepository implements ISecurityPolicyRepository {
  private readonly policies = new Map<string, SecurityPolicy>();
  private readonly policiesByName = new Map<string, string>();

  async save(policy: SecurityPolicy): Promise<void> {
    const existing = this.policies.get(policy.policyId);
    if (existing && existing.name !== policy.name) {
      this.policiesByName.delete(existing.name);
    }

    this.policies.set(policy.policyId, policy);
    this.policiesByName.set(policy.name, policy.policyId);
  }

  async findById(policyId: string): Promise<SecurityPolicy | null> {
    return this.policies.get(policyId.trim()) ?? null;
  }

  async findByName(name: string): Promise<SecurityPolicy | null> {
    const policyId = this.policiesByName.get(name.trim());
    if (!policyId) {
      return null;
    }
    return this.findById(policyId);
  }

  async findAll(): Promise<readonly SecurityPolicy[]> {
    return Object.freeze([...this.policies.values()]);
  }

  async delete(policyId: string): Promise<boolean> {
    const policy = await this.findById(policyId);
    if (!policy) {
      return false;
    }
    this.policies.delete(policy.policyId);
    this.policiesByName.delete(policy.name);
    return true;
  }
}
