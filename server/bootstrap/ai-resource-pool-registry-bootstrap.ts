import type { IResourcePoolCatalog } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-catalog.contract";
import type { IResourcePoolRepository } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-repository.contract";
import type { IResourcePoolSerializer } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-serializer.contract";
import type { IResourcePoolStatisticsProvider } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-statistics-provider.contract";
import type { IResourcePoolValidator } from "@server/application/ai-resource-pool-registry/contracts/resource-pool-validator.contract";
import {
  AiResourcePoolRegistryApplicationService,
  AiResourcePoolRegistryService,
  DeleteResourcePoolUseCase,
  FindResourcePoolByNameUseCase,
  GetResourcePoolRegistryStatisticsUseCase,
  GetResourcePoolUseCase,
  ListResourcePoolsByCategoryUseCase,
  ListResourcePoolsUseCase,
  RegisterResourcePoolUseCase,
  UpdateResourcePoolUseCase,
} from "@server/application/ai-resource-pool-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ResourcePoolRepository } from "@server/infrastructure/ai-resource-pool-registry/resource-pool.repository";
import { DefaultResourcePoolCatalog } from "@server/infrastructure/ai-resource-pool-registry/default-resource-pool.catalog";
import { DefaultResourcePoolStatisticsProvider } from "@server/infrastructure/ai-resource-pool-registry/default-resource-pool-statistics.provider";
import { DefaultResourcePoolValidator } from "@server/infrastructure/ai-resource-pool-registry/default-resource-pool.validator";
import { JsonResourcePoolSerializer } from "@server/infrastructure/ai-resource-pool-registry/json-resource-pool.serializer";

/** Registers AI Resource Pool Registry services and use cases. */
export function registerAiResourcePoolRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiResourcePoolRegistryResourcePoolRepository,
    () => new ResourcePoolRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourcePoolRegistryResourcePoolCatalog,
    () => new DefaultResourcePoolCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourcePoolRegistryResourcePoolValidator,
    () => new DefaultResourcePoolValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourcePoolRegistryResourcePoolSerializer,
    () => new JsonResourcePoolSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourcePoolRegistryResourcePoolStatisticsProvider,
    () => new DefaultResourcePoolStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryService,
    (provider) =>
      new AiResourcePoolRegistryService(
        provider.resolve<IResourcePoolRepository>(
          InfrastructureTokens.AiResourcePoolRegistryResourcePoolRepository,
        ),
        provider.resolve<IResourcePoolCatalog>(
          InfrastructureTokens.AiResourcePoolRegistryResourcePoolCatalog,
        ),
        provider.resolve<IResourcePoolValidator>(
          InfrastructureTokens.AiResourcePoolRegistryResourcePoolValidator,
        ),
        provider.resolve<IResourcePoolSerializer>(
          InfrastructureTokens.AiResourcePoolRegistryResourcePoolSerializer,
        ),
        provider.resolve<IResourcePoolStatisticsProvider>(
          InfrastructureTokens.AiResourcePoolRegistryResourcePoolStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryRegisterResourcePoolUseCase,
    (provider) =>
      new RegisterResourcePoolUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryGetResourcePoolUseCase,
    (provider) =>
      new GetResourcePoolUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryListResourcePoolsUseCase,
    (provider) =>
      new ListResourcePoolsUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryUpdateResourcePoolUseCase,
    (provider) =>
      new UpdateResourcePoolUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryDeleteResourcePoolUseCase,
    (provider) =>
      new DeleteResourcePoolUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryFindResourcePoolByNameUseCase,
    (provider) =>
      new FindResourcePoolByNameUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryListResourcePoolsByCategoryUseCase,
    (provider) =>
      new ListResourcePoolsByCategoryUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryGetResourcePoolRegistryStatisticsUseCase,
    (provider) =>
      new GetResourcePoolRegistryStatisticsUseCase(
        provider.resolve<AiResourcePoolRegistryService>(
          InfrastructureTokens.AiResourcePoolRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourcePoolRegistryApplicationService,
    (provider) =>
      new AiResourcePoolRegistryApplicationService(
        provider.resolve<RegisterResourcePoolUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryRegisterResourcePoolUseCase,
        ),
        provider.resolve<GetResourcePoolUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryGetResourcePoolUseCase,
        ),
        provider.resolve<ListResourcePoolsUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryListResourcePoolsUseCase,
        ),
        provider.resolve<UpdateResourcePoolUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryUpdateResourcePoolUseCase,
        ),
        provider.resolve<DeleteResourcePoolUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryDeleteResourcePoolUseCase,
        ),
        provider.resolve<FindResourcePoolByNameUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryFindResourcePoolByNameUseCase,
        ),
        provider.resolve<ListResourcePoolsByCategoryUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryListResourcePoolsByCategoryUseCase,
        ),
        provider.resolve<GetResourcePoolRegistryStatisticsUseCase>(
          InfrastructureTokens.AiResourcePoolRegistryGetResourcePoolRegistryStatisticsUseCase,
        ),
      ),
  );
}
