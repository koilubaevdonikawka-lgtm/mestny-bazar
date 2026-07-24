import type {
  RegisterAcceleratorProfileInput,
  UpdateAcceleratorProfileInput,
} from "@server/application/ai-accelerator-profile-registry/models/accelerator-profile.model";
import {
  DeleteAcceleratorProfileUseCase,
  FindAcceleratorProfileByNameUseCase,
  GetAcceleratorProfileRegistryStatisticsUseCase,
  GetAcceleratorProfileUseCase,
  ListAcceleratorProfilesByCategoryUseCase,
  ListAcceleratorProfilesUseCase,
  RegisterAcceleratorProfileUseCase,
  UpdateAcceleratorProfileUseCase,
} from "@server/application/ai-accelerator-profile-registry/use-cases/ai-accelerator-profile-registry.use-cases";

/** Application facade for AI Accelerator Profile Registry scenario. */
export class AiAcceleratorProfileRegistryApplicationService {
  constructor(
    private readonly registerAcceleratorProfileUseCase: RegisterAcceleratorProfileUseCase,
    private readonly getAcceleratorProfileUseCase: GetAcceleratorProfileUseCase,
    private readonly listAcceleratorProfilesUseCase: ListAcceleratorProfilesUseCase,
    private readonly updateAcceleratorProfileUseCase: UpdateAcceleratorProfileUseCase,
    private readonly deleteAcceleratorProfileUseCase: DeleteAcceleratorProfileUseCase,
    private readonly findAcceleratorProfileByNameUseCase: FindAcceleratorProfileByNameUseCase,
    private readonly listAcceleratorProfilesByCategoryUseCase: ListAcceleratorProfilesByCategoryUseCase,
    private readonly getAcceleratorProfileRegistryStatisticsUseCase: GetAcceleratorProfileRegistryStatisticsUseCase,
  ) {}

  registerAcceleratorProfile(input: RegisterAcceleratorProfileInput) {
    return this.registerAcceleratorProfileUseCase.execute(input);
  }

  getAcceleratorProfile(acceleratorProfileId: string) {
    return this.getAcceleratorProfileUseCase.execute(acceleratorProfileId);
  }

  listAcceleratorProfiles() {
    return this.listAcceleratorProfilesUseCase.execute();
  }

  updateAcceleratorProfile(input: UpdateAcceleratorProfileInput) {
    return this.updateAcceleratorProfileUseCase.execute(input);
  }

  deleteAcceleratorProfile(acceleratorProfileId: string) {
    return this.deleteAcceleratorProfileUseCase.execute(acceleratorProfileId);
  }

  findAcceleratorProfileByName(name: string) {
    return this.findAcceleratorProfileByNameUseCase.execute(name);
  }

  listAcceleratorProfilesByCategory(category: string) {
    return this.listAcceleratorProfilesByCategoryUseCase.execute(category);
  }

  getAcceleratorProfileRegistryStatistics() {
    return this.getAcceleratorProfileRegistryStatisticsUseCase.execute();
  }
}
