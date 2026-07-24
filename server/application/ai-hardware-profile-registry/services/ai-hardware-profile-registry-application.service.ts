import type {
  RegisterHardwareProfileInput,
  UpdateHardwareProfileInput,
} from "@server/application/ai-hardware-profile-registry/models/hardware-profile.model";
import {
  DeleteHardwareProfileUseCase,
  FindHardwareProfileByNameUseCase,
  GetHardwareProfileRegistryStatisticsUseCase,
  GetHardwareProfileUseCase,
  ListHardwareProfilesByCategoryUseCase,
  ListHardwareProfilesUseCase,
  RegisterHardwareProfileUseCase,
  UpdateHardwareProfileUseCase,
} from "@server/application/ai-hardware-profile-registry/use-cases/ai-hardware-profile-registry.use-cases";

/** Application facade for AI Hardware Profile Registry scenario. */
export class AiHardwareProfileRegistryApplicationService {
  constructor(
    private readonly registerHardwareProfileUseCase: RegisterHardwareProfileUseCase,
    private readonly getHardwareProfileUseCase: GetHardwareProfileUseCase,
    private readonly listHardwareProfilesUseCase: ListHardwareProfilesUseCase,
    private readonly updateHardwareProfileUseCase: UpdateHardwareProfileUseCase,
    private readonly deleteHardwareProfileUseCase: DeleteHardwareProfileUseCase,
    private readonly findHardwareProfileByNameUseCase: FindHardwareProfileByNameUseCase,
    private readonly listHardwareProfilesByCategoryUseCase: ListHardwareProfilesByCategoryUseCase,
    private readonly getHardwareProfileRegistryStatisticsUseCase: GetHardwareProfileRegistryStatisticsUseCase,
  ) {}

  registerHardwareProfile(input: RegisterHardwareProfileInput) {
    return this.registerHardwareProfileUseCase.execute(input);
  }

  getHardwareProfile(hardwareProfileId: string) {
    return this.getHardwareProfileUseCase.execute(hardwareProfileId);
  }

  listHardwareProfiles() {
    return this.listHardwareProfilesUseCase.execute();
  }

  updateHardwareProfile(input: UpdateHardwareProfileInput) {
    return this.updateHardwareProfileUseCase.execute(input);
  }

  deleteHardwareProfile(hardwareProfileId: string) {
    return this.deleteHardwareProfileUseCase.execute(hardwareProfileId);
  }

  findHardwareProfileByName(name: string) {
    return this.findHardwareProfileByNameUseCase.execute(name);
  }

  listHardwareProfilesByCategory(category: string) {
    return this.listHardwareProfilesByCategoryUseCase.execute(category);
  }

  getHardwareProfileRegistryStatistics() {
    return this.getHardwareProfileRegistryStatisticsUseCase.execute();
  }
}
