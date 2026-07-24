import type { IRelationCatalog } from "@server/application/ai-relation-registry/contracts/relation-catalog.contract";
import type { IRelationRepository } from "@server/application/ai-relation-registry/contracts/relation-repository.contract";
import type { IRelationSerializer } from "@server/application/ai-relation-registry/contracts/relation-serializer.contract";
import type { IRelationStatisticsProvider } from "@server/application/ai-relation-registry/contracts/relation-statistics-provider.contract";
import type { IRelationValidator } from "@server/application/ai-relation-registry/contracts/relation-validator.contract";
import {
  AiRelationRegistryApplicationService,
  AiRelationRegistryService,
  DeleteRelationUseCase,
  FindRelationByNameUseCase,
  GetRelationRegistryStatisticsUseCase,
  GetRelationUseCase,
  ListRelationsByCategoryUseCase,
  ListRelationsUseCase,
  RegisterRelationUseCase,
  UpdateRelationUseCase,
} from "@server/application/ai-relation-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { RelationRepository } from "@server/infrastructure/ai-relation-registry/relation.repository";
import { DefaultRelationCatalog } from "@server/infrastructure/ai-relation-registry/default-relation.catalog";
import { DefaultRelationStatisticsProvider } from "@server/infrastructure/ai-relation-registry/default-relation-statistics.provider";
import { DefaultRelationValidator } from "@server/infrastructure/ai-relation-registry/default-relation.validator";
import { JsonRelationSerializer } from "@server/infrastructure/ai-relation-registry/json-relation.serializer";

/** Registers AI Relation Registry services and use cases. */
export function registerAiRelationRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiRelationRegistryRelationRepository,
    () => new RelationRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRelationRegistryRelationCatalog,
    () => new DefaultRelationCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRelationRegistryRelationValidator,
    () => new DefaultRelationValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRelationRegistryRelationSerializer,
    () => new JsonRelationSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRelationRegistryRelationStatisticsProvider,
    () => new DefaultRelationStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryService,
    (provider) =>
      new AiRelationRegistryService(
        provider.resolve<IRelationRepository>(
          InfrastructureTokens.AiRelationRegistryRelationRepository,
        ),
        provider.resolve<IRelationCatalog>(
          InfrastructureTokens.AiRelationRegistryRelationCatalog,
        ),
        provider.resolve<IRelationValidator>(
          InfrastructureTokens.AiRelationRegistryRelationValidator,
        ),
        provider.resolve<IRelationSerializer>(
          InfrastructureTokens.AiRelationRegistryRelationSerializer,
        ),
        provider.resolve<IRelationStatisticsProvider>(
          InfrastructureTokens.AiRelationRegistryRelationStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryRegisterRelationUseCase,
    (provider) =>
      new RegisterRelationUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryGetRelationUseCase,
    (provider) =>
      new GetRelationUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryListRelationsUseCase,
    (provider) =>
      new ListRelationsUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryUpdateRelationUseCase,
    (provider) =>
      new UpdateRelationUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryDeleteRelationUseCase,
    (provider) =>
      new DeleteRelationUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryFindRelationByNameUseCase,
    (provider) =>
      new FindRelationByNameUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryListRelationsByCategoryUseCase,
    (provider) =>
      new ListRelationsByCategoryUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryGetRelationRegistryStatisticsUseCase,
    (provider) =>
      new GetRelationRegistryStatisticsUseCase(
        provider.resolve<AiRelationRegistryService>(
          InfrastructureTokens.AiRelationRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRelationRegistryApplicationService,
    (provider) =>
      new AiRelationRegistryApplicationService(
        provider.resolve<RegisterRelationUseCase>(
          InfrastructureTokens.AiRelationRegistryRegisterRelationUseCase,
        ),
        provider.resolve<GetRelationUseCase>(
          InfrastructureTokens.AiRelationRegistryGetRelationUseCase,
        ),
        provider.resolve<ListRelationsUseCase>(
          InfrastructureTokens.AiRelationRegistryListRelationsUseCase,
        ),
        provider.resolve<UpdateRelationUseCase>(
          InfrastructureTokens.AiRelationRegistryUpdateRelationUseCase,
        ),
        provider.resolve<DeleteRelationUseCase>(
          InfrastructureTokens.AiRelationRegistryDeleteRelationUseCase,
        ),
        provider.resolve<FindRelationByNameUseCase>(
          InfrastructureTokens.AiRelationRegistryFindRelationByNameUseCase,
        ),
        provider.resolve<ListRelationsByCategoryUseCase>(
          InfrastructureTokens.AiRelationRegistryListRelationsByCategoryUseCase,
        ),
        provider.resolve<GetRelationRegistryStatisticsUseCase>(
          InfrastructureTokens.AiRelationRegistryGetRelationRegistryStatisticsUseCase,
        ),
      ),
  );
}
