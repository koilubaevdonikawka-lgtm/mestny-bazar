import type {
  RegisterResourceInput,
  UpdateResourceInput,
} from "@server/application/ai-resource-registry/models/resource.model";
import {
  DeleteResourceUseCase,
  FindResourceByNameUseCase,
  GetResourceRegistryStatisticsUseCase,
  GetResourceUseCase,
  ListResourcesByTypeUseCase,
  ListResourcesUseCase,
  RegisterResourceUseCase,
  UpdateResourceUseCase,
} from "@server/application/ai-resource-registry/use-cases/ai-resource-registry.use-cases";

/** Application facade for AI Resource Registry scenario. */
export class AiResourceRegistryApplicationService {
  constructor(
    private readonly registerResourceUseCase: RegisterResourceUseCase,
    private readonly getResourceUseCase: GetResourceUseCase,
    private readonly listResourcesUseCase: ListResourcesUseCase,
    private readonly updateResourceUseCase: UpdateResourceUseCase,
    private readonly deleteResourceUseCase: DeleteResourceUseCase,
    private readonly findResourceByNameUseCase: FindResourceByNameUseCase,
    private readonly listResourcesByTypeUseCase: ListResourcesByTypeUseCase,
    private readonly getResourceRegistryStatisticsUseCase: GetResourceRegistryStatisticsUseCase,
  ) {}

  registerResource(input: RegisterResourceInput) {
    return this.registerResourceUseCase.execute(input);
  }

  getResource(resourceId: string) {
    return this.getResourceUseCase.execute(resourceId);
  }

  listResources() {
    return this.listResourcesUseCase.execute();
  }

  updateResource(input: UpdateResourceInput) {
    return this.updateResourceUseCase.execute(input);
  }

  deleteResource(resourceId: string) {
    return this.deleteResourceUseCase.execute(resourceId);
  }

  findResourceByName(name: string) {
    return this.findResourceByNameUseCase.execute(name);
  }

  listResourcesByType(type: string) {
    return this.listResourcesByTypeUseCase.execute(type);
  }

  getResourceRegistryStatistics() {
    return this.getResourceRegistryStatisticsUseCase.execute();
  }
}
