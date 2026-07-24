import type {
  DeletePolicyResult,
  FindPolicyByNameResult,
  ListPoliciesByCategoryResult,
  ListPoliciesResult,
  Policy,
  PolicyRegistryStatistics,
  RegisterPolicyInput,
  UpdatePolicyInput,
} from "@server/application/ai-policy-registry/models/policy.model";
import type { AiPolicyRegistryService } from "@server/application/ai-policy-registry/services/ai-policy-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPolicyUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(input: RegisterPolicyInput): Promise<UseCaseResult<Policy>> {
    return this.policyRegistry.registerPolicy(input).then(useCaseResult);
  }
}

export class GetPolicyUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(policyId: string): Promise<UseCaseResult<Policy | null>> {
    return this.policyRegistry.getPolicy(policyId).then(useCaseResult);
  }
}

export class ListPoliciesUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(): Promise<UseCaseResult<ListPoliciesResult>> {
    return this.policyRegistry.listPolicies().then(useCaseResult);
  }
}

export class UpdatePolicyUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(input: UpdatePolicyInput): Promise<UseCaseResult<Policy>> {
    return this.policyRegistry.updatePolicy(input).then(useCaseResult);
  }
}

export class DeletePolicyUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(policyId: string): Promise<UseCaseResult<DeletePolicyResult>> {
    return this.policyRegistry.deletePolicy(policyId).then(useCaseResult);
  }
}

export class FindPolicyByNameUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPolicyByNameResult>> {
    return this.policyRegistry.findPolicyByName(name).then(useCaseResult);
  }
}

export class ListPoliciesByCategoryUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListPoliciesByCategoryResult>> {
    return this.policyRegistry.listPoliciesByCategory(category).then(useCaseResult);
  }
}

export class GetPolicyRegistryStatisticsUseCase {
  constructor(private readonly policyRegistry: AiPolicyRegistryService) {}

  execute(): Promise<UseCaseResult<PolicyRegistryStatistics>> {
    return this.policyRegistry.getPolicyRegistryStatistics().then(useCaseResult);
  }
}
