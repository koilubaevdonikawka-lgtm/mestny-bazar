import type { IKnowledgeGraphCatalog } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-catalog.contract";
import type { IKnowledgeGraphRepository } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-repository.contract";
import type { IKnowledgeGraphSerializer } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-serializer.contract";
import type { IKnowledgeGraphStatisticsProvider } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-statistics-provider.contract";
import type { IKnowledgeGraphValidator } from "@server/application/ai-knowledge-graph-registry/contracts/knowledge-graph-validator.contract";
import {
  AiKnowledgeGraphRegistryApplicationService,
  AiKnowledgeGraphRegistryService,
  DeleteKnowledgeGraphUseCase,
  FindKnowledgeGraphByNameUseCase,
  GetKnowledgeGraphRegistryStatisticsUseCase,
  GetKnowledgeGraphUseCase,
  ListKnowledgeGraphsByCategoryUseCase,
  ListKnowledgeGraphsUseCase,
  RegisterKnowledgeGraphUseCase,
  UpdateKnowledgeGraphUseCase,
} from "@server/application/ai-knowledge-graph-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { KnowledgeGraphRepository } from "@server/infrastructure/ai-knowledge-graph-registry/knowledge-graph.repository";
import { DefaultKnowledgeGraphCatalog } from "@server/infrastructure/ai-knowledge-graph-registry/default-knowledge-graph.catalog";
import { DefaultKnowledgeGraphStatisticsProvider } from "@server/infrastructure/ai-knowledge-graph-registry/default-knowledge-graph-statistics.provider";
import { DefaultKnowledgeGraphValidator } from "@server/infrastructure/ai-knowledge-graph-registry/default-knowledge-graph.validator";
import { JsonKnowledgeGraphSerializer } from "@server/infrastructure/ai-knowledge-graph-registry/json-knowledge-graph.serializer";

/** Registers AI Knowledge Graph Registry services and use cases. */
export function registerAiKnowledgeGraphRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphRepository,
    () => new KnowledgeGraphRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphCatalog,
    () => new DefaultKnowledgeGraphCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphValidator,
    () => new DefaultKnowledgeGraphValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphSerializer,
    () => new JsonKnowledgeGraphSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphStatisticsProvider,
    () => new DefaultKnowledgeGraphStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryService,
    (provider) =>
      new AiKnowledgeGraphRegistryService(
        provider.resolve<IKnowledgeGraphRepository>(
          InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphRepository,
        ),
        provider.resolve<IKnowledgeGraphCatalog>(
          InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphCatalog,
        ),
        provider.resolve<IKnowledgeGraphValidator>(
          InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphValidator,
        ),
        provider.resolve<IKnowledgeGraphSerializer>(
          InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphSerializer,
        ),
        provider.resolve<IKnowledgeGraphStatisticsProvider>(
          InfrastructureTokens.AiKnowledgeGraphRegistryKnowledgeGraphStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryRegisterKnowledgeGraphUseCase,
    (provider) =>
      new RegisterKnowledgeGraphUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryGetKnowledgeGraphUseCase,
    (provider) =>
      new GetKnowledgeGraphUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryListKnowledgeGraphsUseCase,
    (provider) =>
      new ListKnowledgeGraphsUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryUpdateKnowledgeGraphUseCase,
    (provider) =>
      new UpdateKnowledgeGraphUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryDeleteKnowledgeGraphUseCase,
    (provider) =>
      new DeleteKnowledgeGraphUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryFindKnowledgeGraphByNameUseCase,
    (provider) =>
      new FindKnowledgeGraphByNameUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryListKnowledgeGraphsByCategoryUseCase,
    (provider) =>
      new ListKnowledgeGraphsByCategoryUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryGetKnowledgeGraphRegistryStatisticsUseCase,
    (provider) =>
      new GetKnowledgeGraphRegistryStatisticsUseCase(
        provider.resolve<AiKnowledgeGraphRegistryService>(
          InfrastructureTokens.AiKnowledgeGraphRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiKnowledgeGraphRegistryApplicationService,
    (provider) =>
      new AiKnowledgeGraphRegistryApplicationService(
        provider.resolve<RegisterKnowledgeGraphUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryRegisterKnowledgeGraphUseCase,
        ),
        provider.resolve<GetKnowledgeGraphUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryGetKnowledgeGraphUseCase,
        ),
        provider.resolve<ListKnowledgeGraphsUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryListKnowledgeGraphsUseCase,
        ),
        provider.resolve<UpdateKnowledgeGraphUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryUpdateKnowledgeGraphUseCase,
        ),
        provider.resolve<DeleteKnowledgeGraphUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryDeleteKnowledgeGraphUseCase,
        ),
        provider.resolve<FindKnowledgeGraphByNameUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryFindKnowledgeGraphByNameUseCase,
        ),
        provider.resolve<ListKnowledgeGraphsByCategoryUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryListKnowledgeGraphsByCategoryUseCase,
        ),
        provider.resolve<GetKnowledgeGraphRegistryStatisticsUseCase>(
          InfrastructureTokens.AiKnowledgeGraphRegistryGetKnowledgeGraphRegistryStatisticsUseCase,
        ),
      ),
  );
}
