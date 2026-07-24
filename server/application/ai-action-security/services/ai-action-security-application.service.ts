import type {
  RegisterSecurityPolicyInput,
  UpdateSecurityPolicyInput,
  ValidateAgentActionInput,
} from "@server/application/ai-action-security/models/security-policy.model";
import {
  DeleteSecurityPolicyUseCase,
  GetSecurityAuditHistoryUseCase,
  GetSecurityPolicyUseCase,
  GetSecurityStatisticsUseCase,
  ListSecurityPoliciesUseCase,
  RegisterSecurityPolicyUseCase,
  UpdateSecurityPolicyUseCase,
  ValidateAgentActionUseCase,
} from "@server/application/ai-action-security/use-cases/ai-action-security.use-cases";

/** Application facade for AI Action Security scenario. */
export class AiActionSecurityApplicationService {
  constructor(
    private readonly registerSecurityPolicyUseCase: RegisterSecurityPolicyUseCase,
    private readonly getSecurityPolicyUseCase: GetSecurityPolicyUseCase,
    private readonly listSecurityPoliciesUseCase: ListSecurityPoliciesUseCase,
    private readonly updateSecurityPolicyUseCase: UpdateSecurityPolicyUseCase,
    private readonly deleteSecurityPolicyUseCase: DeleteSecurityPolicyUseCase,
    private readonly validateAgentActionUseCase: ValidateAgentActionUseCase,
    private readonly getSecurityAuditHistoryUseCase: GetSecurityAuditHistoryUseCase,
    private readonly getSecurityStatisticsUseCase: GetSecurityStatisticsUseCase,
  ) {}

  registerSecurityPolicy(input: RegisterSecurityPolicyInput) {
    return this.registerSecurityPolicyUseCase.execute(input);
  }

  getSecurityPolicy(policyId: string) {
    return this.getSecurityPolicyUseCase.execute(policyId);
  }

  listSecurityPolicies() {
    return this.listSecurityPoliciesUseCase.execute();
  }

  updateSecurityPolicy(input: UpdateSecurityPolicyInput) {
    return this.updateSecurityPolicyUseCase.execute(input);
  }

  deleteSecurityPolicy(policyId: string) {
    return this.deleteSecurityPolicyUseCase.execute(policyId);
  }

  validateAgentAction(input: ValidateAgentActionInput) {
    return this.validateAgentActionUseCase.execute(input);
  }

  getSecurityAuditHistory() {
    return this.getSecurityAuditHistoryUseCase.execute();
  }

  getSecurityStatistics() {
    return this.getSecurityStatisticsUseCase.execute();
  }
}
