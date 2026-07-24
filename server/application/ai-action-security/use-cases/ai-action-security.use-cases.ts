import type {
  DeleteSecurityPolicyResult,
  GetSecurityAuditHistoryResult,
  ListSecurityPoliciesResult,
  RegisterSecurityPolicyInput,
  SecurityPolicy,
  SecurityStatistics,
  UpdateSecurityPolicyInput,
  ValidateAgentActionInput,
  ValidateAgentActionResult,
} from "@server/application/ai-action-security/models/security-policy.model";
import type { AiActionSecurityService } from "@server/application/ai-action-security/services/ai-action-security.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterSecurityPolicyUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(input: RegisterSecurityPolicyInput): Promise<UseCaseResult<SecurityPolicy>> {
    return this.security.registerSecurityPolicy(input).then(useCaseResult);
  }
}

export class GetSecurityPolicyUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(policyId: string): Promise<UseCaseResult<SecurityPolicy | null>> {
    return this.security.getSecurityPolicy(policyId).then(useCaseResult);
  }
}

export class ListSecurityPoliciesUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(): Promise<UseCaseResult<ListSecurityPoliciesResult>> {
    return this.security.listSecurityPolicies().then(useCaseResult);
  }
}

export class UpdateSecurityPolicyUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(input: UpdateSecurityPolicyInput): Promise<UseCaseResult<SecurityPolicy>> {
    return this.security.updateSecurityPolicy(input).then(useCaseResult);
  }
}

export class DeleteSecurityPolicyUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(policyId: string): Promise<UseCaseResult<DeleteSecurityPolicyResult>> {
    return this.security.deleteSecurityPolicy(policyId).then(useCaseResult);
  }
}

export class ValidateAgentActionUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(input: ValidateAgentActionInput): Promise<UseCaseResult<ValidateAgentActionResult>> {
    return this.security.validateAgentAction(input).then(useCaseResult);
  }
}

export class GetSecurityAuditHistoryUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(): Promise<UseCaseResult<GetSecurityAuditHistoryResult>> {
    return this.security.getSecurityAuditHistory().then(useCaseResult);
  }
}

export class GetSecurityStatisticsUseCase {
  constructor(private readonly security: AiActionSecurityService) {}

  execute(): Promise<UseCaseResult<SecurityStatistics>> {
    return this.security.getSecurityStatistics().then(useCaseResult);
  }
}
