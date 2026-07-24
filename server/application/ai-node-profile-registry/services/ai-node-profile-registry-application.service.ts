import type {
  RegisterNodeProfileInput,
  UpdateNodeProfileInput,
} from "@server/application/ai-node-profile-registry/models/node-profile.model";
import {
  DeleteNodeProfileUseCase,
  FindNodeProfileByNameUseCase,
  GetNodeProfileRegistryStatisticsUseCase,
  GetNodeProfileUseCase,
  ListNodeProfilesByCategoryUseCase,
  ListNodeProfilesUseCase,
  RegisterNodeProfileUseCase,
  UpdateNodeProfileUseCase,
} from "@server/application/ai-node-profile-registry/use-cases/ai-node-profile-registry.use-cases";

/** Application facade for AI Node Profile Registry scenario. */
export class AiNodeProfileRegistryApplicationService {
  constructor(
    private readonly registerNodeProfileUseCase: RegisterNodeProfileUseCase,
    private readonly getNodeProfileUseCase: GetNodeProfileUseCase,
    private readonly listNodeProfilesUseCase: ListNodeProfilesUseCase,
    private readonly updateNodeProfileUseCase: UpdateNodeProfileUseCase,
    private readonly deleteNodeProfileUseCase: DeleteNodeProfileUseCase,
    private readonly findNodeProfileByNameUseCase: FindNodeProfileByNameUseCase,
    private readonly listNodeProfilesByCategoryUseCase: ListNodeProfilesByCategoryUseCase,
    private readonly getNodeProfileRegistryStatisticsUseCase: GetNodeProfileRegistryStatisticsUseCase,
  ) {}

  registerNodeProfile(input: RegisterNodeProfileInput) {
    return this.registerNodeProfileUseCase.execute(input);
  }

  getNodeProfile(nodeProfileId: string) {
    return this.getNodeProfileUseCase.execute(nodeProfileId);
  }

  listNodeProfiles() {
    return this.listNodeProfilesUseCase.execute();
  }

  updateNodeProfile(input: UpdateNodeProfileInput) {
    return this.updateNodeProfileUseCase.execute(input);
  }

  deleteNodeProfile(nodeProfileId: string) {
    return this.deleteNodeProfileUseCase.execute(nodeProfileId);
  }

  findNodeProfileByName(name: string) {
    return this.findNodeProfileByNameUseCase.execute(name);
  }

  listNodeProfilesByCategory(category: string) {
    return this.listNodeProfilesByCategoryUseCase.execute(category);
  }

  getNodeProfileRegistryStatistics() {
    return this.getNodeProfileRegistryStatisticsUseCase.execute();
  }
}
