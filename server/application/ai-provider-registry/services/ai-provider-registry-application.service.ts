import type {
  RegisterProviderInput,
  UpdateProviderInput,
} from "@server/application/ai-provider-registry/models/provider.model";
import {
  DeleteProviderUseCase,
  FindProviderByNameUseCase,
  GetProviderRegistryStatisticsUseCase,
  GetProviderUseCase,
  ListProvidersByTypeUseCase,
  ListProvidersUseCase,
  RegisterProviderUseCase,
  UpdateProviderUseCase,
} from "@server/application/ai-provider-registry/use-cases/ai-provider-registry.use-cases";

/** Application facade for AI Provider Registry scenario. */
export class AiProviderRegistryApplicationService {
  constructor(
    private readonly registerProviderUseCase: RegisterProviderUseCase,
    private readonly getProviderUseCase: GetProviderUseCase,
    private readonly listProvidersUseCase: ListProvidersUseCase,
    private readonly updateProviderUseCase: UpdateProviderUseCase,
    private readonly deleteProviderUseCase: DeleteProviderUseCase,
    private readonly findProviderByNameUseCase: FindProviderByNameUseCase,
    private readonly listProvidersByTypeUseCase: ListProvidersByTypeUseCase,
    private readonly getProviderRegistryStatisticsUseCase: GetProviderRegistryStatisticsUseCase,
  ) {}

  registerProvider(input: RegisterProviderInput) {
    return this.registerProviderUseCase.execute(input);
  }

  getProvider(providerId: string) {
    return this.getProviderUseCase.execute(providerId);
  }

  listProviders() {
    return this.listProvidersUseCase.execute();
  }

  updateProvider(input: UpdateProviderInput) {
    return this.updateProviderUseCase.execute(input);
  }

  deleteProvider(providerId: string) {
    return this.deleteProviderUseCase.execute(providerId);
  }

  findProviderByName(name: string) {
    return this.findProviderByNameUseCase.execute(name);
  }

  listProvidersByType(type: string) {
    return this.listProvidersByTypeUseCase.execute(type);
  }

  getProviderRegistryStatistics() {
    return this.getProviderRegistryStatisticsUseCase.execute();
  }
}
