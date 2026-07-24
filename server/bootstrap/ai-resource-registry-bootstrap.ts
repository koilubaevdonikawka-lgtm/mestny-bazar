import type { IResourceCatalog } from "@server/application/ai-resource-registry/contracts/resource-catalog.contract";
import type { IResourceRepository } from "@server/application/ai-resource-registry/contracts/resource-repository.contract";
import type { IResourceSerializer } from "@server/application/ai-resource-registry/contracts/resource-serializer.contract";
import type { IResourceStatisticsProvider } from "@server/application/ai-resource-registry/contracts/resource-statistics-provider.contract";
import type { IResourceValidator } from "@server/application/ai-resource-registry/contracts/resource-validator.contract";
import {
  AiResourceRegistryApplicationService,
  AiResourceRegistryService,
  DeleteResourceUseCase,
  FindResourceByNameUseCase,
  GetResourceRegistryStatisticsUseCase,
  GetResourceUseCase,
  ListResourcesByTypeUseCase,
  ListResourcesUseCase,
  RegisterResourceUseCase,
  UpdateResourceUseCase,
} from "@server/application/ai-resource-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ResourceRepository } from "@server/infrastructure/ai-resource-registry/resource.repository";
import { DefaultResourceCatalog } from "@server/infrastructure/ai-resource-registry/default-resource.catalog";
import { DefaultResourceStatisticsProvider } from "@server/infrastructure/ai-resource-registry/default-resource-statistics.provider";
import { DefaultResourceValidator } from "@server/infrastructure/ai-resource-registry/default-resource.validator";
import { JsonResourceSerializer } from "@server/infrastructure/ai-resource-registry/json-resource.serializer";

/** Registers AI Resource Registry services and use cases. */
export function registerAiResourceRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiResourceRegistryResourceRepository,
    () => new ResourceRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceRegistryResourceCatalog,
    () => new DefaultResourceCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceRegistryResourceValidator,
    () => new DefaultResourceValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceRegistryResourceSerializer,
    () => new JsonResourceSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceRegistryResourceStatisticsProvider,
    () => new DefaultResourceStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryService,
    (provider) =>
      new AiResourceRegistryService(
        provider.resolve<IResourceRepository>(
          InfrastructureTokens.AiResourceRegistryResourceRepository,
        ),
        provider.resolve<IResourceCatalog>(
          InfrastructureTokens.AiResourceRegistryResourceCatalog,
        ),
        provider.resolve<IResourceValidator>(
          InfrastructureTokens.AiResourceRegistryResourceValidator,
        ),
        provider.resolve<IResourceSerializer>(
          InfrastructureTokens.AiResourceRegistryResourceSerializer,
        ),
        provider.resolve<IResourceStatisticsProvider>(
          InfrastructureTokens.AiResourceRegistryResourceStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryRegisterResourceUseCase,
    (provider) =>
      new RegisterResourceUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryGetResourceUseCase,
    (provider) =>
      new GetResourceUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryListResourcesUseCase,
    (provider) =>
      new ListResourcesUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryUpdateResourceUseCase,
    (provider) =>
      new UpdateResourceUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryDeleteResourceUseCase,
    (provider) =>
      new DeleteResourceUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryFindResourceByNameUseCase,
    (provider) =>
      new FindResourceByNameUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryListResourcesByTypeUseCase,
    (provider) =>
      new ListResourcesByTypeUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryGetResourceRegistryStatisticsUseCase,
    (provider) =>
      new GetResourceRegistryStatisticsUseCase(
        provider.resolve<AiResourceRegistryService>(
          InfrastructureTokens.AiResourceRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceRegistryApplicationService,
    (provider) =>
      new AiResourceRegistryApplicationService(
        provider.resolve<RegisterResourceUseCase>(
          InfrastructureTokens.AiResourceRegistryRegisterResourceUseCase,
        ),
        provider.resolve<GetResourceUseCase>(
          InfrastructureTokens.AiResourceRegistryGetResourceUseCase,
        ),
        provider.resolve<ListResourcesUseCase>(
          InfrastructureTokens.AiResourceRegistryListResourcesUseCase,
        ),
        provider.resolve<UpdateResourceUseCase>(
          InfrastructureTokens.AiResourceRegistryUpdateResourceUseCase,
        ),
        provider.resolve<DeleteResourceUseCase>(
          InfrastructureTokens.AiResourceRegistryDeleteResourceUseCase,
        ),
        provider.resolve<FindResourceByNameUseCase>(
          InfrastructureTokens.AiResourceRegistryFindResourceByNameUseCase,
        ),
        provider.resolve<ListResourcesByTypeUseCase>(
          InfrastructureTokens.AiResourceRegistryListResourcesByTypeUseCase,
        ),
        provider.resolve<GetResourceRegistryStatisticsUseCase>(
          InfrastructureTokens.AiResourceRegistryGetResourceRegistryStatisticsUseCase,
        ),
      ),
  );
}
