import type {
  RegisterResourcePoolInput,
  UpdateResourcePoolInput,
} from "@server/application/ai-resource-pool-registry/models/resource-pool.model";
import {
  DeleteResourcePoolUseCase,
  FindResourcePoolByNameUseCase,
  GetResourcePoolRegistryStatisticsUseCase,
  GetResourcePoolUseCase,
  ListResourcePoolsByCategoryUseCase,
  ListResourcePoolsUseCase,
  RegisterResourcePoolUseCase,
  UpdateResourcePoolUseCase,
} from "@server/application/ai-resource-pool-registry/use-cases/ai-resource-pool-registry.use-cases";

/** Application facade for AI Resource Pool Registry scenario. */
export class AiResourcePoolRegistryApplicationService {
  constructor(
    private readonly registerResourcePoolUseCase: RegisterResourcePoolUseCase,
    private readonly getResourcePoolUseCase: GetResourcePoolUseCase,
    private readonly listResourcePoolsUseCase: ListResourcePoolsUseCase,
    private readonly updateResourcePoolUseCase: UpdateResourcePoolUseCase,
    private readonly deleteResourcePoolUseCase: DeleteResourcePoolUseCase,
    private readonly findResourcePoolByNameUseCase: FindResourcePoolByNameUseCase,
    private readonly listResourcePoolsByCategoryUseCase: ListResourcePoolsByCategoryUseCase,
    private readonly getResourcePoolRegistryStatisticsUseCase: GetResourcePoolRegistryStatisticsUseCase,
  ) {}

  registerResourcePool(input: RegisterResourcePoolInput) {
    return this.registerResourcePoolUseCase.execute(input);
  }

  getResourcePool(resourcePoolId: string) {
    return this.getResourcePoolUseCase.execute(resourcePoolId);
  }

  listResourcePools() {
    return this.listResourcePoolsUseCase.execute();
  }

  updateResourcePool(input: UpdateResourcePoolInput) {
    return this.updateResourcePoolUseCase.execute(input);
  }

  deleteResourcePool(resourcePoolId: string) {
    return this.deleteResourcePoolUseCase.execute(resourcePoolId);
  }

  findResourcePoolByName(name: string) {
    return this.findResourcePoolByNameUseCase.execute(name);
  }

  listResourcePoolsByCategory(category: string) {
    return this.listResourcePoolsByCategoryUseCase.execute(category);
  }

  getResourcePoolRegistryStatistics() {
    return this.getResourcePoolRegistryStatisticsUseCase.execute();
  }
}
