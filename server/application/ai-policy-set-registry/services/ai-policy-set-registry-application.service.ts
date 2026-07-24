import type {
  RegisterPolicySetInput,
  UpdatePolicySetInput,
} from "@server/application/ai-policy-set-registry/models/policy-set.model";
import {
  DeletePolicySetUseCase,
  FindPolicySetByNameUseCase,
  GetPolicySetRegistryStatisticsUseCase,
  GetPolicySetUseCase,
  ListPolicySetsByCategoryUseCase,
  ListPolicySetsUseCase,
  RegisterPolicySetUseCase,
  UpdatePolicySetUseCase,
} from "@server/application/ai-policy-set-registry/use-cases/ai-policy-set-registry.use-cases";

/** Application facade for AI Policy Set Registry scenario. */
export class AiPolicySetRegistryApplicationService {
  constructor(
    private readonly registerPolicySetUseCase: RegisterPolicySetUseCase,
    private readonly getPolicySetUseCase: GetPolicySetUseCase,
    private readonly listPolicySetsUseCase: ListPolicySetsUseCase,
    private readonly updatePolicySetUseCase: UpdatePolicySetUseCase,
    private readonly deletePolicySetUseCase: DeletePolicySetUseCase,
    private readonly findPolicySetByNameUseCase: FindPolicySetByNameUseCase,
    private readonly listPolicySetsByCategoryUseCase: ListPolicySetsByCategoryUseCase,
    private readonly getPolicySetRegistryStatisticsUseCase: GetPolicySetRegistryStatisticsUseCase,
  ) {}

  registerPolicySet(input: RegisterPolicySetInput) {
    return this.registerPolicySetUseCase.execute(input);
  }

  getPolicySet(policySetId: string) {
    return this.getPolicySetUseCase.execute(policySetId);
  }

  listPolicySets() {
    return this.listPolicySetsUseCase.execute();
  }

  updatePolicySet(input: UpdatePolicySetInput) {
    return this.updatePolicySetUseCase.execute(input);
  }

  deletePolicySet(policySetId: string) {
    return this.deletePolicySetUseCase.execute(policySetId);
  }

  findPolicySetByName(name: string) {
    return this.findPolicySetByNameUseCase.execute(name);
  }

  listPolicySetsByCategory(category: string) {
    return this.listPolicySetsByCategoryUseCase.execute(category);
  }

  getPolicySetRegistryStatistics() {
    return this.getPolicySetRegistryStatisticsUseCase.execute();
  }
}
