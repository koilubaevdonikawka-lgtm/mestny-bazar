import type {
  DeleteMemoryProfileResult,
  FindMemoryProfileByNameResult,
  MemoryProfile,
  MemoryProfileRegistryStatistics,
  ListMemoryProfilesByCategoryResult,
  ListMemoryProfilesResult,
  RegisterMemoryProfileInput,
  UpdateMemoryProfileInput,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";
import type { AiMemoryProfileRegistryService } from "@server/application/ai-memory-profile-registry/services/ai-memory-profile-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterMemoryProfileUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(input: RegisterMemoryProfileInput): Promise<UseCaseResult<MemoryProfile>> {
    return this.memoryProfileRegistry.registerMemoryProfile(input).then(useCaseResult);
  }
}

export class GetMemoryProfileUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(memoryProfileId: string): Promise<UseCaseResult<MemoryProfile | null>> {
    return this.memoryProfileRegistry.getMemoryProfile(memoryProfileId).then(useCaseResult);
  }
}

export class ListMemoryProfilesUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(): Promise<UseCaseResult<ListMemoryProfilesResult>> {
    return this.memoryProfileRegistry.listMemoryProfiles().then(useCaseResult);
  }
}

export class UpdateMemoryProfileUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(input: UpdateMemoryProfileInput): Promise<UseCaseResult<MemoryProfile>> {
    return this.memoryProfileRegistry.updateMemoryProfile(input).then(useCaseResult);
  }
}

export class DeleteMemoryProfileUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(memoryProfileId: string): Promise<UseCaseResult<DeleteMemoryProfileResult>> {
    return this.memoryProfileRegistry.deleteMemoryProfile(memoryProfileId).then(useCaseResult);
  }
}

export class FindMemoryProfileByNameUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindMemoryProfileByNameResult>> {
    return this.memoryProfileRegistry.findMemoryProfileByName(name).then(useCaseResult);
  }
}

export class ListMemoryProfilesByCategoryUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(category: string): Promise<UseCaseResult<ListMemoryProfilesByCategoryResult>> {
    return this.memoryProfileRegistry.listMemoryProfilesByCategory(category).then(useCaseResult);
  }
}

export class GetMemoryProfileRegistryStatisticsUseCase {
  constructor(private readonly memoryProfileRegistry: AiMemoryProfileRegistryService) {}

  execute(): Promise<UseCaseResult<MemoryProfileRegistryStatistics>> {
    return this.memoryProfileRegistry.getMemoryProfileRegistryStatistics().then(useCaseResult);
  }
}
