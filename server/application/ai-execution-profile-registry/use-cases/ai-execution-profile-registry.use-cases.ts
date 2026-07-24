import type {
  DeleteExecutionProfileResult,
  FindExecutionProfileByNameResult,
  ListExecutionProfilesByCategoryResult,
  ListExecutionProfilesResult,
  RegisterExecutionProfileInput,
  ExecutionProfile,
  ExecutionProfileRegistryStatistics,
  UpdateExecutionProfileInput,
} from "@server/application/ai-execution-profile-registry/models/execution-profile.model";
import type { AiExecutionProfileRegistryService } from "@server/application/ai-execution-profile-registry/services/ai-execution-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterExecutionProfileUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(input: RegisterExecutionProfileInput): Promise<UseCaseResult<ExecutionProfile>> {
    return this.executionProfileRegistry.registerExecutionProfile(input).then(useCaseResult);
  }
}

export class GetExecutionProfileUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(executionProfileId: string): Promise<UseCaseResult<ExecutionProfile | null>> {
    return this.executionProfileRegistry.getExecutionProfile(executionProfileId).then(useCaseResult);
  }
}

export class ListExecutionProfilesUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListExecutionProfilesResult>> {
    return this.executionProfileRegistry.listExecutionProfiles().then(useCaseResult);
  }
}

export class UpdateExecutionProfileUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(input: UpdateExecutionProfileInput): Promise<UseCaseResult<ExecutionProfile>> {
    return this.executionProfileRegistry.updateExecutionProfile(input).then(useCaseResult);
  }
}

export class DeleteExecutionProfileUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(executionProfileId: string): Promise<UseCaseResult<DeleteExecutionProfileResult>> {
    return this.executionProfileRegistry.deleteExecutionProfile(executionProfileId).then(useCaseResult);
  }
}

export class FindExecutionProfileByNameUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindExecutionProfileByNameResult>> {
    return this.executionProfileRegistry.findExecutionProfileByName(name).then(useCaseResult);
  }
}

export class ListExecutionProfilesByCategoryUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListExecutionProfilesByCategoryResult>> {
    return this.executionProfileRegistry.listExecutionProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetExecutionProfileRegistryStatisticsUseCase {
  constructor(private readonly executionProfileRegistry: AiExecutionProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ExecutionProfileRegistryStatistics>> {
    return this.executionProfileRegistry.getExecutionProfileRegistryStatistics().then(useCaseResult);
  }
}
