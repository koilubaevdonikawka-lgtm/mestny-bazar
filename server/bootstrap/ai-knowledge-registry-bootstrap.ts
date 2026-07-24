import type { IKnowledgeCatalog } from "@server/application/ai-knowledge-registry/contracts/knowledge-catalog.contract";
import type { IKnowledgeSourceRepository } from "@server/application/ai-knowledge-registry/contracts/knowledge-source-repository.contract";
import type { IKnowledgeSerializer } from "@server/application/ai-knowledge-registry/contracts/knowledge-serializer.contract";
import type { IKnowledgeStatisticsProvider } from "@server/application/ai-knowledge-registry/contracts/knowledge-statistics-provider.contract";
import type { IKnowledgeValidator } from "@server/application/ai-knowledge-registry/contracts/knowledge-validator.contract";
import {
  AiKnowledgeRegistryApplicationService,
  AiKnowledgeRegistryService,
  DeleteKnowledgeSourceUseCase,
  FindKnowledgeSourceByNameUseCase,
  GetKnowledgeRegistryStatisticsUseCase,
  GetKnowledgeSourceUseCase,
  ListKnowledgeSourcesByCategoryUseCase,
  ListKnowledgeSourcesUseCase,
  RegisterKnowledgeSourceUseCase,
  UpdateKnowledgeSourceUseCase,
} from "@server/application/ai-knowledge-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultKnowledgeCatalog } from "@server/infrastructure/ai-knowledge-registry/default-knowledge.catalog";
import { DefaultKnowledgeStatisticsProvider } from "@server/infrastructure/ai-knowledge-registry/default-knowledge-statistics.provider";
import { DefaultKnowledgeValidator } from "@server/infrastructure/ai-knowledge-registry/default-knowledge.validator";
import { JsonKnowledgeSerializer } from "@server/infrastructure/ai-knowledge-registry/json-knowledge.serializer";
import { KnowledgeSourceRepository } from "@server/infrastructure/ai-knowledge-registry/knowledge-source.repository";

/** Registers AI Knowledge Registry services and use cases. */
export function registerAiKnowledgeRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeRegistrySourceRepository,
    () => new KnowledgeSourceRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeRegistryKnowledgeCatalog,
    () => new DefaultKnowledgeCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeRegistryKnowledgeValidator,
    () => new DefaultKnowledgeValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeRegistryKnowledgeSerializer,
    () => new JsonKnowledgeSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeRegistryKnowledgeStatisticsProvider,
    () => new DefaultKnowledgeStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryService,
    (provider) =>
      new AiKnowledgeRegistryService(
        provider.resolve<IKnowledgeSourceRepository>(
          InfrastructureTokens.AiKnowledgeRegistrySourceRepository,
        ),
        provider.resolve<IKnowledgeCatalog>(
          InfrastructureTokens.AiKnowledgeRegistryKnowledgeCatalog,
        ),
        provider.resolve<IKnowledgeValidator>(
          InfrastructureTokens.AiKnowledgeRegistryKnowledgeValidator,
        ),
        provider.resolve<IKnowledgeSerializer>(
          InfrastructureTokens.AiKnowledgeRegistryKnowledgeSerializer,
        ),
        provider.resolve<IKnowledgeStatisticsProvider>(
          InfrastructureTokens.AiKnowledgeRegistryKnowledgeStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryRegisterKnowledgeSourceUseCase,
    (provider) =>
      new RegisterKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryGetKnowledgeSourceUseCase,
    (provider) =>
      new GetKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryListKnowledgeSourcesUseCase,
    (provider) =>
      new ListKnowledgeSourcesUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryUpdateKnowledgeSourceUseCase,
    (provider) =>
      new UpdateKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryDeleteKnowledgeSourceUseCase,
    (provider) =>
      new DeleteKnowledgeSourceUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryFindKnowledgeSourceByNameUseCase,
    (provider) =>
      new FindKnowledgeSourceByNameUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryListKnowledgeSourcesByCategoryUseCase,
    (provider) =>
      new ListKnowledgeSourcesByCategoryUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryGetKnowledgeRegistryStatisticsUseCase,
    (provider) =>
      new GetKnowledgeRegistryStatisticsUseCase(
        provider.resolve<AiKnowledgeRegistryService>(InfrastructureTokens.AiKnowledgeRegistryService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeRegistryApplicationService,
    (provider) =>
      new AiKnowledgeRegistryApplicationService(
        provider.resolve<RegisterKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryRegisterKnowledgeSourceUseCase,
        ),
        provider.resolve<GetKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryGetKnowledgeSourceUseCase,
        ),
        provider.resolve<ListKnowledgeSourcesUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryListKnowledgeSourcesUseCase,
        ),
        provider.resolve<UpdateKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryUpdateKnowledgeSourceUseCase,
        ),
        provider.resolve<DeleteKnowledgeSourceUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryDeleteKnowledgeSourceUseCase,
        ),
        provider.resolve<FindKnowledgeSourceByNameUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryFindKnowledgeSourceByNameUseCase,
        ),
        provider.resolve<ListKnowledgeSourcesByCategoryUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryListKnowledgeSourcesByCategoryUseCase,
        ),
        provider.resolve<GetKnowledgeRegistryStatisticsUseCase>(
          InfrastructureTokens.AiKnowledgeRegistryGetKnowledgeRegistryStatisticsUseCase,
        ),
      ),
  );
}
