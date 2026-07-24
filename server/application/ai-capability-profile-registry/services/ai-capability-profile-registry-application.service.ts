import type {
  RegisterCapabilityProfileInput,
  UpdateCapabilityProfileInput,
} from "@server/application/ai-capability-profile-registry/models/capability-profile.model";
import {
  DeleteCapabilityProfileUseCase,
  FindCapabilityProfileByNameUseCase,
  GetCapabilityProfileRegistryStatisticsUseCase,
  GetCapabilityProfileUseCase,
  ListCapabilityProfilesByCategoryUseCase,
  ListCapabilityProfilesUseCase,
  RegisterCapabilityProfileUseCase,
  UpdateCapabilityProfileUseCase,
} from "@server/application/ai-capability-profile-registry/use-cases/ai-capability-profile-registry.use-cases";

/** Application facade for AI Capability Profile Registry scenario. */
export class AiCapabilityProfileRegistryApplicationService {
  constructor(
    private readonly registerCapabilityProfileUseCase: RegisterCapabilityProfileUseCase,
    private readonly getCapabilityProfileUseCase: GetCapabilityProfileUseCase,
    private readonly listCapabilityProfilesUseCase: ListCapabilityProfilesUseCase,
    private readonly updateCapabilityProfileUseCase: UpdateCapabilityProfileUseCase,
    private readonly deleteCapabilityProfileUseCase: DeleteCapabilityProfileUseCase,
    private readonly findCapabilityProfileByNameUseCase: FindCapabilityProfileByNameUseCase,
    private readonly listCapabilityProfilesByCategoryUseCase: ListCapabilityProfilesByCategoryUseCase,
    private readonly getCapabilityProfileRegistryStatisticsUseCase: GetCapabilityProfileRegistryStatisticsUseCase,
  ) {}

  registerCapabilityProfile(input: RegisterCapabilityProfileInput) {
    return this.registerCapabilityProfileUseCase.execute(input);
  }

  getCapabilityProfile(capabilityProfileId: string) {
    return this.getCapabilityProfileUseCase.execute(capabilityProfileId);
  }

  listCapabilityProfiles() {
    return this.listCapabilityProfilesUseCase.execute();
  }

  updateCapabilityProfile(input: UpdateCapabilityProfileInput) {
    return this.updateCapabilityProfileUseCase.execute(input);
  }

  deleteCapabilityProfile(capabilityProfileId: string) {
    return this.deleteCapabilityProfileUseCase.execute(capabilityProfileId);
  }

  findCapabilityProfileByName(name: string) {
    return this.findCapabilityProfileByNameUseCase.execute(name);
  }

  listCapabilityProfilesByCategory(category: string) {
    return this.listCapabilityProfilesByCategoryUseCase.execute(category);
  }

  getCapabilityProfileRegistryStatistics() {
    return this.getCapabilityProfileRegistryStatisticsUseCase.execute();
  }
}
