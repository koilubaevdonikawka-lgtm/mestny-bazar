import type {
  RegisterNetworkProfileInput,
  UpdateNetworkProfileInput,
} from "@server/application/ai-network-profile-registry/models/network-profile.model";
import {
  DeleteNetworkProfileUseCase,
  FindNetworkProfileByNameUseCase,
  GetNetworkProfileRegistryStatisticsUseCase,
  GetNetworkProfileUseCase,
  ListNetworkProfilesByCategoryUseCase,
  ListNetworkProfilesUseCase,
  RegisterNetworkProfileUseCase,
  UpdateNetworkProfileUseCase,
} from "@server/application/ai-network-profile-registry/use-cases/ai-network-profile-registry.use-cases";

/** Application facade for AI Network Profile Registry scenario. */
export class AiNetworkProfileRegistryApplicationService {
  constructor(
    private readonly registerNetworkProfileUseCase: RegisterNetworkProfileUseCase,
    private readonly getNetworkProfileUseCase: GetNetworkProfileUseCase,
    private readonly listNetworkProfilesUseCase: ListNetworkProfilesUseCase,
    private readonly updateNetworkProfileUseCase: UpdateNetworkProfileUseCase,
    private readonly deleteNetworkProfileUseCase: DeleteNetworkProfileUseCase,
    private readonly findNetworkProfileByNameUseCase: FindNetworkProfileByNameUseCase,
    private readonly listNetworkProfilesByCategoryUseCase: ListNetworkProfilesByCategoryUseCase,
    private readonly getNetworkProfileRegistryStatisticsUseCase: GetNetworkProfileRegistryStatisticsUseCase,
  ) {}

  registerNetworkProfile(input: RegisterNetworkProfileInput) {
    return this.registerNetworkProfileUseCase.execute(input);
  }

  getNetworkProfile(networkProfileId: string) {
    return this.getNetworkProfileUseCase.execute(networkProfileId);
  }

  listNetworkProfiles() {
    return this.listNetworkProfilesUseCase.execute();
  }

  updateNetworkProfile(input: UpdateNetworkProfileInput) {
    return this.updateNetworkProfileUseCase.execute(input);
  }

  deleteNetworkProfile(networkProfileId: string) {
    return this.deleteNetworkProfileUseCase.execute(networkProfileId);
  }

  findNetworkProfileByName(name: string) {
    return this.findNetworkProfileByNameUseCase.execute(name);
  }

  listNetworkProfilesByCategory(category: string) {
    return this.listNetworkProfilesByCategoryUseCase.execute(category);
  }

  getNetworkProfileRegistryStatistics() {
    return this.getNetworkProfileRegistryStatisticsUseCase.execute();
  }
}
