import type { IProviderCatalog } from "@server/application/ai-provider-registry/contracts/provider-catalog.contract";
import type { IProviderRepository } from "@server/application/ai-provider-registry/contracts/provider-repository.contract";
import type { IProviderSerializer } from "@server/application/ai-provider-registry/contracts/provider-serializer.contract";
import type { IProviderStatisticsProvider } from "@server/application/ai-provider-registry/contracts/provider-statistics-provider.contract";
import type { IProviderValidator } from "@server/application/ai-provider-registry/contracts/provider-validator.contract";
import {
  AiProviderRegistryApplicationService,
  AiProviderRegistryService,
  DeleteProviderUseCase,
  FindProviderByNameUseCase,
  GetProviderRegistryStatisticsUseCase,
  GetProviderUseCase,
  ListProvidersByTypeUseCase,
  ListProvidersUseCase,
  RegisterProviderUseCase,
  UpdateProviderUseCase,
} from "@server/application/ai-provider-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultProviderCatalog } from "@server/infrastructure/ai-provider-registry/default-provider.catalog";
import { DefaultProviderStatisticsProvider } from "@server/infrastructure/ai-provider-registry/default-provider-statistics.provider";
import { DefaultProviderValidator } from "@server/infrastructure/ai-provider-registry/default-provider.validator";
import { JsonProviderSerializer } from "@server/infrastructure/ai-provider-registry/json-provider.serializer";
import { ProviderRepository } from "@server/infrastructure/ai-provider-registry/provider.repository";

/** Registers AI Provider Registry services and use cases. */
export function registerAiProviderRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiProviderRegistryProviderRepository,
    () => new ProviderRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProviderRegistryProviderCatalog,
    () => new DefaultProviderCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProviderRegistryProviderValidator,
    () => new DefaultProviderValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProviderRegistryProviderSerializer,
    () => new JsonProviderSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProviderRegistryProviderStatisticsProvider,
    () => new DefaultProviderStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryService,
    (provider) =>
      new AiProviderRegistryService(
        provider.resolve<IProviderRepository>(
          InfrastructureTokens.AiProviderRegistryProviderRepository,
        ),
        provider.resolve<IProviderCatalog>(
          InfrastructureTokens.AiProviderRegistryProviderCatalog,
        ),
        provider.resolve<IProviderValidator>(
          InfrastructureTokens.AiProviderRegistryProviderValidator,
        ),
        provider.resolve<IProviderSerializer>(
          InfrastructureTokens.AiProviderRegistryProviderSerializer,
        ),
        provider.resolve<IProviderStatisticsProvider>(
          InfrastructureTokens.AiProviderRegistryProviderStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryRegisterProviderUseCase,
    (provider) =>
      new RegisterProviderUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryGetProviderUseCase,
    (provider) =>
      new GetProviderUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryListProvidersUseCase,
    (provider) =>
      new ListProvidersUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryUpdateProviderUseCase,
    (provider) =>
      new UpdateProviderUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryDeleteProviderUseCase,
    (provider) =>
      new DeleteProviderUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryFindProviderByNameUseCase,
    (provider) =>
      new FindProviderByNameUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryListProvidersByTypeUseCase,
    (provider) =>
      new ListProvidersByTypeUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryGetProviderRegistryStatisticsUseCase,
    (provider) =>
      new GetProviderRegistryStatisticsUseCase(
        provider.resolve<AiProviderRegistryService>(InfrastructureTokens.AiProviderRegistryService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProviderRegistryApplicationService,
    (provider) =>
      new AiProviderRegistryApplicationService(
        provider.resolve<RegisterProviderUseCase>(
          InfrastructureTokens.AiProviderRegistryRegisterProviderUseCase,
        ),
        provider.resolve<GetProviderUseCase>(
          InfrastructureTokens.AiProviderRegistryGetProviderUseCase,
        ),
        provider.resolve<ListProvidersUseCase>(
          InfrastructureTokens.AiProviderRegistryListProvidersUseCase,
        ),
        provider.resolve<UpdateProviderUseCase>(
          InfrastructureTokens.AiProviderRegistryUpdateProviderUseCase,
        ),
        provider.resolve<DeleteProviderUseCase>(
          InfrastructureTokens.AiProviderRegistryDeleteProviderUseCase,
        ),
        provider.resolve<FindProviderByNameUseCase>(
          InfrastructureTokens.AiProviderRegistryFindProviderByNameUseCase,
        ),
        provider.resolve<ListProvidersByTypeUseCase>(
          InfrastructureTokens.AiProviderRegistryListProvidersByTypeUseCase,
        ),
        provider.resolve<GetProviderRegistryStatisticsUseCase>(
          InfrastructureTokens.AiProviderRegistryGetProviderRegistryStatisticsUseCase,
        ),
      ),
  );
}
