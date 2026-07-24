import type {
  DeleteProviderResult,
  FindProviderByNameResult,
  ListProvidersByTypeResult,
  ListProvidersResult,
  Provider,
  ProviderRegistryStatistics,
  RegisterProviderInput,
  UpdateProviderInput,
} from "@server/application/ai-provider-registry/models/provider.model";
import type { AiProviderRegistryService } from "@server/application/ai-provider-registry/services/ai-provider-registry.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterProviderUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(input: RegisterProviderInput): Promise<UseCaseResult<Provider>> {
    return this.providerRegistry.registerProvider(input).then(useCaseResult);
  }
}

export class GetProviderUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(providerId: string): Promise<UseCaseResult<Provider | null>> {
    return this.providerRegistry.getProvider(providerId).then(useCaseResult);
  }
}

export class ListProvidersUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(): Promise<UseCaseResult<ListProvidersResult>> {
    return this.providerRegistry.listProviders().then(useCaseResult);
  }
}

export class UpdateProviderUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(input: UpdateProviderInput): Promise<UseCaseResult<Provider>> {
    return this.providerRegistry.updateProvider(input).then(useCaseResult);
  }
}

export class DeleteProviderUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(providerId: string): Promise<UseCaseResult<DeleteProviderResult>> {
    return this.providerRegistry.deleteProvider(providerId).then(useCaseResult);
  }
}

export class FindProviderByNameUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(name: string): Promise<UseCaseResult<FindProviderByNameResult>> {
    return this.providerRegistry.findProviderByName(name).then(useCaseResult);
  }
}

export class ListProvidersByTypeUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(type: string): Promise<UseCaseResult<ListProvidersByTypeResult>> {
    return this.providerRegistry.listProvidersByType(type).then(useCaseResult);
  }
}

export class GetProviderRegistryStatisticsUseCase {
  constructor(private readonly providerRegistry: AiProviderRegistryService) {}

  execute(): Promise<UseCaseResult<ProviderRegistryStatistics>> {
    return this.providerRegistry.getProviderRegistryStatistics().then(useCaseResult);
  }
}
