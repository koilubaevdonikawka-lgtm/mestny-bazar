import type {
  DeleteRuntimeProfileResult,
  FindRuntimeProfileByNameResult,
  ListRuntimeProfilesByCategoryResult,
  ListRuntimeProfilesResult,
  RegisterRuntimeProfileInput,
  RuntimeProfile,
  RuntimeProfileRegistryStatistics,
  UpdateRuntimeProfileInput,
} from "@server/application/ai-runtime-profile-registry/models/runtime-profile.model";
import type { AiRuntimeProfileRegistryService } from "@server/application/ai-runtime-profile-registry/services/ai-runtime-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterRuntimeProfileUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(input: RegisterRuntimeProfileInput): Promise<UseCaseResult<RuntimeProfile>> {
    return this.runtimeProfileRegistry.registerRuntimeProfile(input).then(useCaseResult);
  }
}

export class GetRuntimeProfileUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(runtimeProfileId: string): Promise<UseCaseResult<RuntimeProfile | null>> {
    return this.runtimeProfileRegistry.getRuntimeProfile(runtimeProfileId).then(useCaseResult);
  }
}

export class ListRuntimeProfilesUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListRuntimeProfilesResult>> {
    return this.runtimeProfileRegistry.listRuntimeProfiles().then(useCaseResult);
  }
}

export class UpdateRuntimeProfileUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(input: UpdateRuntimeProfileInput): Promise<UseCaseResult<RuntimeProfile>> {
    return this.runtimeProfileRegistry.updateRuntimeProfile(input).then(useCaseResult);
  }
}

export class DeleteRuntimeProfileUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(runtimeProfileId: string): Promise<UseCaseResult<DeleteRuntimeProfileResult>> {
    return this.runtimeProfileRegistry.deleteRuntimeProfile(runtimeProfileId).then(useCaseResult);
  }
}

export class FindRuntimeProfileByNameUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindRuntimeProfileByNameResult>> {
    return this.runtimeProfileRegistry.findRuntimeProfileByName(name).then(useCaseResult);
  }
}

export class ListRuntimeProfilesByCategoryUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListRuntimeProfilesByCategoryResult>> {
    return this.runtimeProfileRegistry.listRuntimeProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetRuntimeProfileRegistryStatisticsUseCase {
  constructor(private readonly runtimeProfileRegistry: AiRuntimeProfileRegistryService) {}

  execute(): Promise<UseCaseResult<RuntimeProfileRegistryStatistics>> {
    return this.runtimeProfileRegistry.getRuntimeProfileRegistryStatistics().then(useCaseResult);
  }
}
