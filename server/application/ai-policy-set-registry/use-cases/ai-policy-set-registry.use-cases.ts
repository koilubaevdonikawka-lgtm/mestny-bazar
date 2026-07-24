import type {
  DeletePolicySetResult,
  FindPolicySetByNameResult,
  ListPolicySetsByCategoryResult,
  ListPolicySetsResult,
  RegisterPolicySetInput,
  PolicySet,
  PolicySetRegistryStatistics,
  UpdatePolicySetInput,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";
import type { AiPolicySetRegistryService } from "@server/application/ai-policy-set-registry/services/ai-policy-set-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterPolicySetUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(input: RegisterPolicySetInput): Promise<UseCaseResult<PolicySet>> {
    return this.policySetRegistry.registerPolicySet(input).then(useCaseResult);
  }
}

export class GetPolicySetUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(policySetId: string): Promise<UseCaseResult<PolicySet | null>> {
    return this.policySetRegistry.getPolicySet(policySetId).then(useCaseResult);
  }
}

export class ListPolicySetsUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(): Promise<UseCaseResult<ListPolicySetsResult>> {
    return this.policySetRegistry.listPolicySets().then(useCaseResult);
  }
}

export class UpdatePolicySetUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(input: UpdatePolicySetInput): Promise<UseCaseResult<PolicySet>> {
    return this.policySetRegistry.updatePolicySet(input).then(useCaseResult);
  }
}

export class DeletePolicySetUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(policySetId: string): Promise<UseCaseResult<DeletePolicySetResult>> {
    return this.policySetRegistry.deletePolicySet(policySetId).then(useCaseResult);
  }
}

export class FindPolicySetByNameUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindPolicySetByNameResult>> {
    return this.policySetRegistry.findPolicySetByName(name).then(useCaseResult);
  }
}

export class ListPolicySetsByCategoryUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListPolicySetsByCategoryResult>> {
    return this.policySetRegistry.listPolicySetsByCategory(category).then(useCaseResult);
  }
}

export class GetPolicySetRegistryStatisticsUseCase {
  constructor(private readonly policySetRegistry: AiPolicySetRegistryService) {}

  execute(): Promise<UseCaseResult<PolicySetRegistryStatistics>> {
    return this.policySetRegistry.getPolicySetRegistryStatistics().then(useCaseResult);
  }
}
