import type { IKnowledgeSourceCatalog } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-catalog.contract";
import type { IKnowledgeSourceRepository } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-repository.contract";
import type { IKnowledgeSourceSerializer } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-serializer.contract";
import type { IKnowledgeSourceStatisticsProvider } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-statistics-provider.contract";
import type { IKnowledgeSourceValidator } from "@server/application/ai-knowledge-source-registry/contracts/knowledge-source-validator.contract";
import {
  AiKnowledgeSourceRegistryApplicationService,
  AiKnowledgeSourceRegistryService,
  DeleteKnowledgeSourceUseCase,
  FindKnowledgeSourceByNameUseCase,
  GetKnowledgeSourceRegistryStatisticsUseCase,
  GetKnowledgeSourceUseCase,
  ListKnowledgeSourcesByCategoryUseCase,
  ListKnowledgeSourcesUseCase,
  RegisterKnowledgeSourceUseCase,
  UpdateKnowledgeSourceUseCase,
} from "@server/application/ai-knowledge-source-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { KnowledgeSourceRepository } from "@server/infrastructure/ai-knowledge-source-registry/knowledge-source.repository";
import { DefaultKnowledgeSourceCatalog } from "@server/infrastructure/ai-knowledge-source-registry/default-knowledge-source.catalog";
import { DefaultKnowledgeSourceStatisticsProvider } from "@server/infrastructure/ai-knowledge-source-registry/default-knowledge-source-statistics.provider";
import { DefaultKnowledgeSourceValidator } from "@server/infrastructure/ai-knowledge-source-registry/default-knowledge-source.validator";
import { JsonKnowledgeSourceSerializer } from "@server/infrastructure/ai-knowledge-source-registry/json-knowledge-source.serializer";

/** Registers AI Knowledge Source Registry services and use cases. */
export function registerAiKnowledgeSourceRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceRepository,
    () => new KnowledgeSourceRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceCatalog,
    () => new DefaultKnowledgeSourceCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceValidator,
    () => new DefaultKnowledgeSourceValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceSerializer,
    () => new JsonKnowledgeSourceSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceStatisticsProvider,
    () => new DefaultKnowledgeSourceStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryService,
    (provider) =>
      new AiKnowledgeSourceRegistryService(
        provider.resolve<IKnowledgeSourceRepository>(
          InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceRepository,
        ),
        provider.resolve<IKnowledgeSourceCatalog>(
          InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceCatalog,
        ),
        provider.resolve<IKnowledgeSourceValidator>(
          InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceValidator,
        ),
        provider.resolve<IKnowledgeSourceSerializer>(
          InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceSerializer,
        ),
        provider.resolve<IKnowledgeSourceStatisticsProvider>(
          InfrastructureTokens.AiKnowledgeSourceRegistryKnowledgeSourceStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryRegisterKnowledgeSourceUseCase,
    (provider) =>
      new RegisterKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryGetKnowledgeSourceUseCase,
    (provider) =>
      new GetKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryListKnowledgeSourcesUseCase,
    (provider) =>
      new ListKnowledgeSourcesUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryUpdateKnowledgeSourceUseCase,
    (provider) =>
      new UpdateKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryDeleteKnowledgeSourceUseCase,
    (provider) =>
      new DeleteKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryFindKnowledgeSourceByNameUseCase,
    (provider) =>
      new FindKnowledgeSourceByNameUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryListKnowledgeSourcesByCategoryUseCase,
    (provider) =>
      new ListKnowledgeSourcesByCategoryUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryGetKnowledgeSourceRegistryStatisticsUseCase,
    (provider) =>
      new GetKnowledgeSourceRegistryStatisticsUseCase(
        provider.resolve<AiKnowledgeSourceRegistryService>(
          InfrastructureTokens.AiKnowledgeSourceRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeSourceRegistryApplicationService,
    (provider) =>
      new AiKnowledgeSourceRegistryApplicationService(
        provider.resolve<RegisterKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryRegisterKnowledgeSourceUseCase,
        ),
        provider.resolve<GetKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryGetKnowledgeSourceUseCase,
        ),
        provider.resolve<ListKnowledgeSourcesUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryListKnowledgeSourcesUseCase,
        ),
        provider.resolve<UpdateKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryUpdateKnowledgeSourceUseCase,
        ),
        provider.resolve<DeleteKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryDeleteKnowledgeSourceUseCase,
        ),
        provider.resolve<FindKnowledgeSourceByNameUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryFindKnowledgeSourceByNameUseCase,
        ),
        provider.resolve<ListKnowledgeSourcesByCategoryUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryListKnowledgeSourcesByCategoryUseCase,
        ),
        provider.resolve<GetKnowledgeSourceRegistryStatisticsUseCase>(
          InfrastructureTokens.AiKnowledgeSourceRegistryGetKnowledgeSourceRegistryStatisticsUseCase,
        ),
      ),
  );
}
