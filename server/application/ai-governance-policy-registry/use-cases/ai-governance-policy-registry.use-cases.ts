import type {
  DeleteGovernancePolicyResult,
  FindGovernancePolicyByNameResult,
  GovernancePolicy,
  GovernancePolicyRegistryStatistics,
  ListGovernancePoliciesByCategoryResult,
  ListGovernancePoliciesResult,
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyInput,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";
import type { AiGovernancePolicyRegistryService } from "@server/application/ai-governance-policy-registry/services/ai-governance-policy-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterGovernancePolicyUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(input: RegisterGovernancePolicyInput): Promise<UseCaseResult<GovernancePolicy>> {
    return this.governancePolicyRegistry.registerGovernancePolicy(input).then(useCaseResult);
  }
}

export class GetGovernancePolicyUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(governancePolicyId: string): Promise<UseCaseResult<GovernancePolicy | null>> {
    return this.governancePolicyRegistry.getGovernancePolicy(governancePolicyId).then(useCaseResult);
  }
}

export class ListGovernancePoliciesUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(): Promise<UseCaseResult<ListGovernancePoliciesResult>> {
    return this.governancePolicyRegistry.listGovernancePolicies().then(useCaseResult);
  }
}

export class UpdateGovernancePolicyUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(input: UpdateGovernancePolicyInput): Promise<UseCaseResult<GovernancePolicy>> {
    return this.governancePolicyRegistry.updateGovernancePolicy(input).then(useCaseResult);
  }
}

export class DeleteGovernancePolicyUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(governancePolicyId: string): Promise<UseCaseResult<DeleteGovernancePolicyResult>> {
    return this.governancePolicyRegistry.deleteGovernancePolicy(governancePolicyId).then(useCaseResult);
  }
}

export class FindGovernancePolicyByNameUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindGovernancePolicyByNameResult>> {
    return this.governancePolicyRegistry.findGovernancePolicyByName(name).then(useCaseResult);
  }
}

export class ListGovernancePoliciesByCategoryUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListGovernancePoliciesByCategoryResult>> {
    return this.governancePolicyRegistry.listGovernancePoliciesByCategory(category).then(useCaseResult);
  }
}

export class GetGovernancePolicyRegistryStatisticsUseCase {
  constructor(private readonly governancePolicyRegistry: AiGovernancePolicyRegistryService) {}

  execute(): Promise<UseCaseResult<GovernancePolicyRegistryStatistics>> {
    return this.governancePolicyRegistry.getGovernancePolicyRegistryStatistics().then(useCaseResult);
  }
}
