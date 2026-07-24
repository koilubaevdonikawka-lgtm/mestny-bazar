import type {
  RegisterPolicyInput,
  UpdatePolicyInput,
} from "@server/application/ai-policy-registry/models/policy.model";
import {
  DeletePolicyUseCase,
  FindPolicyByNameUseCase,
  GetPolicyRegistryStatisticsUseCase,
  GetPolicyUseCase,
  ListPoliciesByCategoryUseCase,
  ListPoliciesUseCase,
  RegisterPolicyUseCase,
  UpdatePolicyUseCase,
} from "@server/application/ai-policy-registry/use-cases/ai-policy-registry.use-cases";

/** Application facade for AI Policy Registry scenario. */
export class AiPolicyRegistryApplicationService {
  constructor(
    private readonly registerPolicyUseCase: RegisterPolicyUseCase,
    private readonly getPolicyUseCase: GetPolicyUseCase,
    private readonly listPoliciesUseCase: ListPoliciesUseCase,
    private readonly updatePolicyUseCase: UpdatePolicyUseCase,
    private readonly deletePolicyUseCase: DeletePolicyUseCase,
    private readonly findPolicyByNameUseCase: FindPolicyByNameUseCase,
    private readonly listPoliciesByCategoryUseCase: ListPoliciesByCategoryUseCase,
    private readonly getPolicyRegistryStatisticsUseCase: GetPolicyRegistryStatisticsUseCase,
  ) {}

  registerPolicy(input: RegisterPolicyInput) {
    return this.registerPolicyUseCase.execute(input);
  }

  getPolicy(policyId: string) {
    return this.getPolicyUseCase.execute(policyId);
  }

  listPolicies() {
    return this.listPoliciesUseCase.execute();
  }

  updatePolicy(input: UpdatePolicyInput) {
    return this.updatePolicyUseCase.execute(input);
  }

  deletePolicy(policyId: string) {
    return this.deletePolicyUseCase.execute(policyId);
  }

  findPolicyByName(name: string) {
    return this.findPolicyByNameUseCase.execute(name);
  }

  listPoliciesByCategory(category: string) {
    return this.listPoliciesByCategoryUseCase.execute(category);
  }

  getPolicyRegistryStatistics() {
    return this.getPolicyRegistryStatisticsUseCase.execute();
  }
}
