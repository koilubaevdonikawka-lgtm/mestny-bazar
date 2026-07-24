import type {
  RegisterExecutionProfileInput,
  UpdateExecutionProfileInput,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";
import {
  DeleteExecutionProfileUseCase,
  FindExecutionProfileByNameUseCase,
  GetExecutionProfileRegistryStatisticsUseCase,
  GetExecutionProfileUseCase,
  ListExecutionProfilesByCategoryUseCase,
  ListExecutionProfilesUseCase,
  RegisterExecutionProfileUseCase,
  UpdateExecutionProfileUseCase,
} from "@server/application/ai-execution-profile-registry/use-cases/ai-execution-profile-registry.use-cases";

/** Application facade for AI Execution Profile Registry scenario. */
export class AiExecutionProfileRegistryApplicationService {
  constructor(
    private readonly registerExecutionProfileUseCase: RegisterExecutionProfileUseCase,
    private readonly getExecutionProfileUseCase: GetExecutionProfileUseCase,
    private readonly listExecutionProfilesUseCase: ListExecutionProfilesUseCase,
    private readonly updateExecutionProfileUseCase: UpdateExecutionProfileUseCase,
    private readonly deleteExecutionProfileUseCase: DeleteExecutionProfileUseCase,
    private readonly findExecutionProfileByNameUseCase: FindExecutionProfileByNameUseCase,
    private readonly listExecutionProfilesByCategoryUseCase: ListExecutionProfilesByCategoryUseCase,
    private readonly getExecutionProfileRegistryStatisticsUseCase: GetExecutionProfileRegistryStatisticsUseCase,
  ) {}

  registerExecutionProfile(input: RegisterExecutionProfileInput) {
    return this.registerExecutionProfileUseCase.execute(input);
  }

  getExecutionProfile(executionProfileId: string) {
    return this.getExecutionProfileUseCase.execute(executionProfileId);
  }

  listExecutionProfiles() {
    return this.listExecutionProfilesUseCase.execute();
  }

  updateExecutionProfile(input: UpdateExecutionProfileInput) {
    return this.updateExecutionProfileUseCase.execute(input);
  }

  deleteExecutionProfile(executionProfileId: string) {
    return this.deleteExecutionProfileUseCase.execute(executionProfileId);
  }

  findExecutionProfileByName(name: string) {
    return this.findExecutionProfileByNameUseCase.execute(name);
  }

  listExecutionProfilesByCategory(category: string) {
    return this.listExecutionProfilesByCategoryUseCase.execute(category);
  }

  getExecutionProfileRegistryStatistics() {
    return this.getExecutionProfileRegistryStatisticsUseCase.execute();
  }
}
