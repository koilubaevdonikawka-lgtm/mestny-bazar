import type {
  RegisterMemoryProfileInput,
  UpdateMemoryProfileInput,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";
import {
  DeleteMemoryProfileUseCase,
  FindMemoryProfileByNameUseCase,
  GetMemoryProfileRegistryStatisticsUseCase,
  GetMemoryProfileUseCase,
  ListMemoryProfilesByCategoryUseCase,
  ListMemoryProfilesUseCase,
  RegisterMemoryProfileUseCase,
  UpdateMemoryProfileUseCase,
} from "@server/application/ai-memory-profile-registry/use-cases/ai-memory-profile-registry.use-cases";

/** Application facade for AI Memory Profile Registry scenario. */
export class AiMemoryProfileRegistryApplicationService {
  constructor(
    private readonly registerMemoryProfileUseCase: RegisterMemoryProfileUseCase,
    private readonly getMemoryProfileUseCase: GetMemoryProfileUseCase,
    private readonly listMemoryProfilesUseCase: ListMemoryProfilesUseCase,
    private readonly updateMemoryProfileUseCase: UpdateMemoryProfileUseCase,
    private readonly deleteMemoryProfileUseCase: DeleteMemoryProfileUseCase,
    private readonly findMemoryProfileByNameUseCase: FindMemoryProfileByNameUseCase,
    private readonly listMemoryProfilesByCategoryUseCase: ListMemoryProfilesByCategoryUseCase,
    private readonly getMemoryProfileRegistryStatisticsUseCase: GetMemoryProfileRegistryStatisticsUseCase,
  ) {}

  registerMemoryProfile(input: RegisterMemoryProfileInput) {
    return this.registerMemoryProfileUseCase.execute(input);
  }

  getMemoryProfile(memoryProfileId: string) {
    return this.getMemoryProfileUseCase.execute(memoryProfileId);
  }

  listMemoryProfiles() {
    return this.listMemoryProfilesUseCase.execute();
  }

  updateMemoryProfile(input: UpdateMemoryProfileInput) {
    return this.updateMemoryProfileUseCase.execute(input);
  }

  deleteMemoryProfile(memoryProfileId: string) {
    return this.deleteMemoryProfileUseCase.execute(memoryProfileId);
  }

  findMemoryProfileByName(name: string) {
    return this.findMemoryProfileByNameUseCase.execute(name);
  }

  listMemoryProfilesByCategory(category: string) {
    return this.listMemoryProfilesByCategoryUseCase.execute(category);
  }

  getMemoryProfileRegistryStatistics() {
    return this.getMemoryProfileRegistryStatisticsUseCase.execute();
  }
}
