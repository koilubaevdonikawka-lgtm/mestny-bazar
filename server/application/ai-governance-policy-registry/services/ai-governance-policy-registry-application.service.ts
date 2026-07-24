import type {
  RegisterGovernancePolicyInput,
  UpdateGovernancePolicyInput,
} from "@server/application/ai-governance-policy-registry/models/governance-policy.model";
import {
  DeleteGovernancePolicyUseCase,
  FindGovernancePolicyByNameUseCase,
  GetGovernancePolicyRegistryStatisticsUseCase,
  GetGovernancePolicyUseCase,
  ListGovernancePoliciesByCategoryUseCase,
  ListGovernancePoliciesUseCase,
  RegisterGovernancePolicyUseCase,
  UpdateGovernancePolicyUseCase,
} from "@server/application/ai-governance-policy-registry/use-cases/ai-governance-policy-registry.use-cases";

/** Application facade for AI Governance Policy Registry scenario. */
export class AiGovernancePolicyRegistryApplicationService {
  constructor(
    private readonly registerGovernancePolicyUseCase: RegisterGovernancePolicyUseCase,
    private readonly getGovernancePolicyUseCase: GetGovernancePolicyUseCase,
    private readonly listGovernancePoliciesUseCase: ListGovernancePoliciesUseCase,
    private readonly updateGovernancePolicyUseCase: UpdateGovernancePolicyUseCase,
    private readonly deleteGovernancePolicyUseCase: DeleteGovernancePolicyUseCase,
    private readonly findGovernancePolicyByNameUseCase: FindGovernancePolicyByNameUseCase,
    private readonly listGovernancePoliciesByCategoryUseCase: ListGovernancePoliciesByCategoryUseCase,
    private readonly getGovernancePolicyRegistryStatisticsUseCase: GetGovernancePolicyRegistryStatisticsUseCase,
  ) {}

  registerGovernancePolicy(input: RegisterGovernancePolicyInput) {
    return this.registerGovernancePolicyUseCase.execute(input);
  }

  getGovernancePolicy(governancePolicyId: string) {
    return this.getGovernancePolicyUseCase.execute(governancePolicyId);
  }

  listGovernancePolicies() {
    return this.listGovernancePoliciesUseCase.execute();
  }

  updateGovernancePolicy(input: UpdateGovernancePolicyInput) {
    return this.updateGovernancePolicyUseCase.execute(input);
  }

  deleteGovernancePolicy(governancePolicyId: string) {
    return this.deleteGovernancePolicyUseCase.execute(governancePolicyId);
  }

  findGovernancePolicyByName(name: string) {
    return this.findGovernancePolicyByNameUseCase.execute(name);
  }

  listGovernancePoliciesByCategory(category: string) {
    return this.listGovernancePoliciesByCategoryUseCase.execute(category);
  }

  getGovernancePolicyRegistryStatistics() {
    return this.getGovernancePolicyRegistryStatisticsUseCase.execute();
  }
}
