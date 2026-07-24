/**
 * AI Action Security — validates AI actions before execution.
 *
 * Fully independent module. No business logic or domain knowledge.
 * Does not execute actions — only analyzes and returns validation results.
 */
import type { IAgentActionValidator } from "@server/application/ai-action-security/contracts/agent-action-validator.contract";
import type { ISecurityAuditRepository } from "@server/application/ai-action-security/contracts/security-audit-repository.contract";
import type { ISecurityDecisionEngine } from "@server/application/ai-action-security/contracts/security-decision-engine.contract";
import type { ISecurityPolicyRepository } from "@server/application/ai-action-security/contracts/security-policy-repository.contract";
import type { ISecurityStatisticsProvider } from "@server/application/ai-action-security/contracts/security-statistics-provider.contract";
import {
  createSecurityAuditEntry,
  createSecurityPolicy,
  type DeleteSecurityPolicyResult,
  type GetSecurityAuditHistoryResult,
  type ListSecurityPoliciesResult,
  type RegisterSecurityPolicyInput,
  type SecurityPolicy,
  type SecurityStatistics,
  type UpdateSecurityPolicyInput,
  type ValidateAgentActionInput,
  type ValidateAgentActionResult,
} from "@server/application/ai-action-security/models/security-policy.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiActionSecurityService {
  constructor(
    private readonly policyRepository: ISecurityPolicyRepository,
    private readonly actionValidator: IAgentActionValidator,
    private readonly decisionEngine: ISecurityDecisionEngine,
    private readonly auditRepository: ISecurityAuditRepository,
    private readonly statisticsProvider: ISecurityStatisticsProvider,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerSecurityPolicy(input: RegisterSecurityPolicyInput): Promise<SecurityPolicy> {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Security policy name is required.");
    }
    if (await this.policyRepository.findByName(name)) {
      throw new Error(`Security policy already exists: ${name}`);
    }

    const policy = createSecurityPolicy({
      policyId: this.idGenerator.generate(),
      name,
      description: input.description,
      rules: input.rules,
      status: input.status,
    });

    await this.policyRepository.save(policy);
    return policy;
  }

  async getSecurityPolicy(policyId: string): Promise<SecurityPolicy | null> {
    return this.policyRepository.findById(policyId.trim());
  }

  async listSecurityPolicies(): Promise<ListSecurityPoliciesResult> {
    const policies = Object.freeze(
      [...(await this.policyRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ policies, total: policies.length });
  }

  async updateSecurityPolicy(input: UpdateSecurityPolicyInput): Promise<SecurityPolicy> {
    const policyId = input.policyId.trim();
    const existing = await this.policyRepository.findById(policyId);
    if (!existing) {
      throw new Error(`Security policy not found: ${policyId}`);
    }

    const nextName = input.name?.trim() ?? existing.name;
    if (nextName !== existing.name && (await this.policyRepository.findByName(nextName))) {
      throw new Error(`Security policy already exists: ${nextName}`);
    }

    const updated = createSecurityPolicy({
      policyId: existing.policyId,
      name: nextName,
      description: input.description ?? existing.description,
      rules: input.rules ?? existing.rules,
      status: input.status ?? existing.status,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    });

    await this.policyRepository.save(updated);
    return updated;
  }

  async deleteSecurityPolicy(policyId: string): Promise<DeleteSecurityPolicyResult> {
    const normalizedPolicyId = policyId.trim();
    const deleted = await this.policyRepository.delete(normalizedPolicyId);
    return Object.freeze({ policyId: normalizedPolicyId, deleted });
  }

  async validateAgentAction(input: ValidateAgentActionInput): Promise<ValidateAgentActionResult> {
    this.actionValidator.validate(input);

    const policies = await this.resolvePolicies(input.policyId);
    const decision = await this.decisionEngine.decide(input, policies);
    await this.statisticsProvider.recordCheck(decision.allowed);

    const auditId = this.idGenerator.generate();
    const validationInput = Object.freeze({
      actionName: input.actionName.trim(),
      agentId: input.agentId ?? null,
      payload: input.payload ?? null,
      policyId: input.policyId ?? null,
    });

    await this.auditRepository.save(
      createSecurityAuditEntry({
        auditId,
        actionName: input.actionName.trim(),
        agentId: input.agentId ?? null,
        allowed: decision.allowed,
        reason: decision.reason,
        policyId: decision.policyId,
        input: validationInput,
      }),
    );

    return Object.freeze({
      auditId,
      actionName: input.actionName.trim(),
      allowed: decision.allowed,
      reason: decision.reason,
      policyId: decision.policyId,
      mock: decision.mock,
    });
  }

  async getSecurityAuditHistory(): Promise<GetSecurityAuditHistoryResult> {
    const entries = Object.freeze([...(await this.auditRepository.findAll())]);
    return Object.freeze({ entries, total: entries.length });
  }

  async getSecurityStatistics(): Promise<SecurityStatistics> {
    const policies = await this.policyRepository.findAll();
    const activePolicies = policies.filter((policy) => policy.status === "active").length;
    return this.statisticsProvider.getStatistics({
      totalPolicies: policies.length,
      activePolicies,
    });
  }

  private async resolvePolicies(policyId?: string): Promise<readonly SecurityPolicy[]> {
    if (policyId?.trim()) {
      const policy = await this.policyRepository.findById(policyId.trim());
      if (!policy) {
        throw new Error(`Security policy not found: ${policyId}`);
      }
      return Object.freeze([policy]);
    }

    return Object.freeze(
      (await this.policyRepository.findAll()).filter((policy) => policy.status === "active"),
    );
  }
}
