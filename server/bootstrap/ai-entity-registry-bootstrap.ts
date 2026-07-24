import type { IEntityCatalog } from "@server/application/ai-entity-registry/contracts/entity-catalog.contract";
import type { IEntityRepository } from "@server/application/ai-entity-registry/contracts/entity-repository.contract";
import type { IEntitySerializer } from "@server/application/ai-entity-registry/contracts/entity-serializer.contract";
import type { IEntityStatisticsProvider } from "@server/application/ai-entity-registry/contracts/entity-statistics-provider.contract";
import type { IEntityValidator } from "@server/application/ai-entity-registry/contracts/entity-validator.contract";
import {
  AiEntityRegistryApplicationService,
  AiEntityRegistryService,
  DeleteEntityUseCase,
  FindEntityByNameUseCase,
  GetEntityRegistryStatisticsUseCase,
  GetEntityUseCase,
  ListEntitiesByCategoryUseCase,
  ListEntitiesUseCase,
  RegisterEntityUseCase,
  UpdateEntityUseCase,
} from "@server/application/ai-entity-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { EntityRepository } from "@server/infrastructure/ai-entity-registry/entity.repository";
import { DefaultEntityCatalog } from "@server/infrastructure/ai-entity-registry/default-entity.catalog";
import { DefaultEntityStatisticsProvider } from "@server/infrastructure/ai-entity-registry/default-entity-statistics.provider";
import { DefaultEntityValidator } from "@server/infrastructure/ai-entity-registry/default-entity.validator";
import { JsonEntitySerializer } from "@server/infrastructure/ai-entity-registry/json-entity.serializer";

/** Registers AI Entity Registry services and use cases. */
export function registerAiEntityRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiEntityRegistryEntityRepository,
    () => new EntityRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEntityRegistryEntityCatalog,
    () => new DefaultEntityCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEntityRegistryEntityValidator,
    () => new DefaultEntityValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEntityRegistryEntitySerializer,
    () => new JsonEntitySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEntityRegistryEntityStatisticsProvider,
    () => new DefaultEntityStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryService,
    (provider) =>
      new AiEntityRegistryService(
        provider.resolve<IEntityRepository>(
          InfrastructureTokens.AiEntityRegistryEntityRepository,
        ),
        provider.resolve<IEntityCatalog>(
          InfrastructureTokens.AiEntityRegistryEntityCatalog,
        ),
        provider.resolve<IEntityValidator>(
          InfrastructureTokens.AiEntityRegistryEntityValidator,
        ),
        provider.resolve<IEntitySerializer>(
          InfrastructureTokens.AiEntityRegistryEntitySerializer,
        ),
        provider.resolve<IEntityStatisticsProvider>(
          InfrastructureTokens.AiEntityRegistryEntityStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryRegisterEntityUseCase,
    (provider) =>
      new RegisterEntityUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryGetEntityUseCase,
    (provider) =>
      new GetEntityUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryListEntitiesUseCase,
    (provider) =>
      new ListEntitiesUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryUpdateEntityUseCase,
    (provider) =>
      new UpdateEntityUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryDeleteEntityUseCase,
    (provider) =>
      new DeleteEntityUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryFindEntityByNameUseCase,
    (provider) =>
      new FindEntityByNameUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryListEntitiesByCategoryUseCase,
    (provider) =>
      new ListEntitiesByCategoryUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryGetEntityRegistryStatisticsUseCase,
    (provider) =>
      new GetEntityRegistryStatisticsUseCase(
        provider.resolve<AiEntityRegistryService>(
          InfrastructureTokens.AiEntityRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEntityRegistryApplicationService,
    (provider) =>
      new AiEntityRegistryApplicationService(
        provider.resolve<RegisterEntityUseCase>(
          InfrastructureTokens.AiEntityRegistryRegisterEntityUseCase,
        ),
        provider.resolve<GetEntityUseCase>(
          InfrastructureTokens.AiEntityRegistryGetEntityUseCase,
        ),
        provider.resolve<ListEntitiesUseCase>(
          InfrastructureTokens.AiEntityRegistryListEntitiesUseCase,
        ),
        provider.resolve<UpdateEntityUseCase>(
          InfrastructureTokens.AiEntityRegistryUpdateEntityUseCase,
        ),
        provider.resolve<DeleteEntityUseCase>(
          InfrastructureTokens.AiEntityRegistryDeleteEntityUseCase,
        ),
        provider.resolve<FindEntityByNameUseCase>(
          InfrastructureTokens.AiEntityRegistryFindEntityByNameUseCase,
        ),
        provider.resolve<ListEntitiesByCategoryUseCase>(
          InfrastructureTokens.AiEntityRegistryListEntitiesByCategoryUseCase,
        ),
        provider.resolve<GetEntityRegistryStatisticsUseCase>(
          InfrastructureTokens.AiEntityRegistryGetEntityRegistryStatisticsUseCase,
        ),
      ),
  );
}
