import type {
  RegisterTransparencyProfileInput,
  UpdateTransparencyProfileInput,
} from "@server/application/ai-transparency-profile-registry/models/transparency-profile.model";
import {
  DeleteTransparencyProfileUseCase,
  FindTransparencyProfileByNameUseCase,
  GetTransparencyProfileRegistryStatisticsUseCase,
  GetTransparencyProfileUseCase,
  ListTransparencyProfilesByCategoryUseCase,
  ListTransparencyProfilesUseCase,
  RegisterTransparencyProfileUseCase,
  UpdateTransparencyProfileUseCase,
} from "@server/application/ai-transparency-profile-registry/use-cases/ai-transparency-profile-registry.use-cases";

/** Application facade for AI Transparency Profile Registry scenario. */
export class AiTransparencyProfileRegistryApplicationService {
  constructor(
    private readonly registerTransparencyProfileUseCase: RegisterTransparencyProfileUseCase,
    private readonly getTransparencyProfileUseCase: GetTransparencyProfileUseCase,
    private readonly listTransparencyProfilesUseCase: ListTransparencyProfilesUseCase,
    private readonly updateTransparencyProfileUseCase: UpdateTransparencyProfileUseCase,
    private readonly deleteTransparencyProfileUseCase: DeleteTransparencyProfileUseCase,
    private readonly findTransparencyProfileByNameUseCase: FindTransparencyProfileByNameUseCase,
    private readonly listTransparencyProfilesByCategoryUseCase: ListTransparencyProfilesByCategoryUseCase,
    private readonly getTransparencyProfileRegistryStatisticsUseCase: GetTransparencyProfileRegistryStatisticsUseCase,
  ) {}

  registerTransparencyProfile(input: RegisterTransparencyProfileInput) {
    return this.registerTransparencyProfileUseCase.execute(input);
  }

  getTransparencyProfile(transparencyProfileId: string) {
    return this.getTransparencyProfileUseCase.execute(transparencyProfileId);
  }

  listTransparencyProfiles() {
    return this.listTransparencyProfilesUseCase.execute();
  }

  updateTransparencyProfile(input: UpdateTransparencyProfileInput) {
    return this.updateTransparencyProfileUseCase.execute(input);
  }

  deleteTransparencyProfile(transparencyProfileId: string) {
    return this.deleteTransparencyProfileUseCase.execute(transparencyProfileId);
  }

  findTransparencyProfileByName(name: string) {
    return this.findTransparencyProfileByNameUseCase.execute(name);
  }

  listTransparencyProfilesByCategory(category: string) {
    return this.listTransparencyProfilesByCategoryUseCase.execute(category);
  }

  getTransparencyProfileRegistryStatistics() {
    return this.getTransparencyProfileRegistryStatisticsUseCase.execute();
  }
}
