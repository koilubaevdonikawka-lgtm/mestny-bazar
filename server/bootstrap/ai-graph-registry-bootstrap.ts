import type { IGraphCatalog } from "@server/application/ai-graph-registry/contracts/graph-catalog.contract";
import type { IGraphRepository } from "@server/application/ai-graph-registry/contracts/graph-repository.contract";
import type { IGraphSerializer } from "@server/application/ai-graph-registry/contracts/graph-serializer.contract";
import type { IGraphStatisticsProvider } from "@server/application/ai-graph-registry/contracts/graph-statistics-provider.contract";
import type { IGraphValidator } from "@server/application/ai-graph-registry/contracts/graph-validator.contract";
import {
  AiGraphRegistryApplicationService,
  AiGraphRegistryService,
  DeleteGraphUseCase,
  FindGraphByNameUseCase,
  GetGraphRegistryStatisticsUseCase,
  GetGraphUseCase,
  ListGraphsByCategoryUseCase,
  ListGraphsUseCase,
  RegisterGraphUseCase,
  UpdateGraphUseCase,
} from "@server/application/ai-graph-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { GraphRepository } from "@server/infrastructure/ai-graph-registry/graph.repository";
import { DefaultGraphCatalog } from "@server/infrastructure/ai-graph-registry/default-graph.catalog";
import { DefaultGraphStatisticsProvider } from "@server/infrastructure/ai-graph-registry/default-graph-statistics.provider";
import { DefaultGraphValidator } from "@server/infrastructure/ai-graph-registry/default-graph.validator";
import { JsonGraphSerializer } from "@server/infrastructure/ai-graph-registry/json-graph.serializer";

/** Registers AI Graph Registry services and use cases. */
export function registerAiGraphRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiGraphRegistryGraphRepository,
    () => new GraphRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGraphRegistryGraphCatalog,
    () => new DefaultGraphCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGraphRegistryGraphValidator,
    () => new DefaultGraphValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGraphRegistryGraphSerializer,
    () => new JsonGraphSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGraphRegistryGraphStatisticsProvider,
    () => new DefaultGraphStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryService,
    (provider) =>
      new AiGraphRegistryService(
        provider.resolve<IGraphRepository>(
          InfrastructureTokens.AiGraphRegistryGraphRepository,
        ),
        provider.resolve<IGraphCatalog>(
          InfrastructureTokens.AiGraphRegistryGraphCatalog,
        ),
        provider.resolve<IGraphValidator>(
          InfrastructureTokens.AiGraphRegistryGraphValidator,
        ),
        provider.resolve<IGraphSerializer>(
          InfrastructureTokens.AiGraphRegistryGraphSerializer,
        ),
        provider.resolve<IGraphStatisticsProvider>(
          InfrastructureTokens.AiGraphRegistryGraphStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryRegisterGraphUseCase,
    (provider) =>
      new RegisterGraphUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryGetGraphUseCase,
    (provider) =>
      new GetGraphUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryListGraphsUseCase,
    (provider) =>
      new ListGraphsUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryUpdateGraphUseCase,
    (provider) =>
      new UpdateGraphUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryDeleteGraphUseCase,
    (provider) =>
      new DeleteGraphUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryFindGraphByNameUseCase,
    (provider) =>
      new FindGraphByNameUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryListGraphsByCategoryUseCase,
    (provider) =>
      new ListGraphsByCategoryUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryGetGraphRegistryStatisticsUseCase,
    (provider) =>
      new GetGraphRegistryStatisticsUseCase(
        provider.resolve<AiGraphRegistryService>(
          InfrastructureTokens.AiGraphRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGraphRegistryApplicationService,
    (provider) =>
      new AiGraphRegistryApplicationService(
        provider.resolve<RegisterGraphUseCase>(
          InfrastructureTokens.AiGraphRegistryRegisterGraphUseCase,
        ),
        provider.resolve<GetGraphUseCase>(
          InfrastructureTokens.AiGraphRegistryGetGraphUseCase,
        ),
        provider.resolve<ListGraphsUseCase>(
          InfrastructureTokens.AiGraphRegistryListGraphsUseCase,
        ),
        provider.resolve<UpdateGraphUseCase>(
          InfrastructureTokens.AiGraphRegistryUpdateGraphUseCase,
        ),
        provider.resolve<DeleteGraphUseCase>(
          InfrastructureTokens.AiGraphRegistryDeleteGraphUseCase,
        ),
        provider.resolve<FindGraphByNameUseCase>(
          InfrastructureTokens.AiGraphRegistryFindGraphByNameUseCase,
        ),
        provider.resolve<ListGraphsByCategoryUseCase>(
          InfrastructureTokens.AiGraphRegistryListGraphsByCategoryUseCase,
        ),
        provider.resolve<GetGraphRegistryStatisticsUseCase>(
          InfrastructureTokens.AiGraphRegistryGetGraphRegistryStatisticsUseCase,
        ),
      ),
  );
}
