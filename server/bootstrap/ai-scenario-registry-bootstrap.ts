import type { IScenarioCatalog } from "@server/application/ai-scenario-registry/contracts/scenario-catalog.contract";
import type { IScenarioRepository } from "@server/application/ai-scenario-registry/contracts/scenario-repository.contract";
import type { IScenarioSerializer } from "@server/application/ai-scenario-registry/contracts/scenario-serializer.contract";
import type { IScenarioStatisticsProvider } from "@server/application/ai-scenario-registry/contracts/scenario-statistics-provider.contract";
import type { IScenarioValidator } from "@server/application/ai-scenario-registry/contracts/scenario-validator.contract";
import {
  AiScenarioRegistryApplicationService,
  AiScenarioRegistryService,
  DeleteScenarioUseCase,
  FindScenarioByNameUseCase,
  GetScenarioRegistryStatisticsUseCase,
  GetScenarioUseCase,
  ListScenariosByCategoryUseCase,
  ListScenariosUseCase,
  RegisterScenarioUseCase,
  UpdateScenarioUseCase,
} from "@server/application/ai-scenario-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ScenarioRepository } from "@server/infrastructure/ai-scenario-registry/scenario.repository";
import { DefaultScenarioCatalog } from "@server/infrastructure/ai-scenario-registry/default-scenario.catalog";
import { DefaultScenarioStatisticsProvider } from "@server/infrastructure/ai-scenario-registry/default-scenario-statistics.provider";
import { DefaultScenarioValidator } from "@server/infrastructure/ai-scenario-registry/default-scenario.validator";
import { JsonScenarioSerializer } from "@server/infrastructure/ai-scenario-registry/json-scenario.serializer";

/** Registers AI Scenario Registry services and use cases. */
export function registerAiScenarioRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiScenarioRegistryScenarioRepository,
    () => new ScenarioRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiScenarioRegistryScenarioCatalog,
    () => new DefaultScenarioCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiScenarioRegistryScenarioValidator,
    () => new DefaultScenarioValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiScenarioRegistryScenarioSerializer,
    () => new JsonScenarioSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiScenarioRegistryScenarioStatisticsProvider,
    () => new DefaultScenarioStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryService,
    (provider) =>
      new AiScenarioRegistryService(
        provider.resolve<IScenarioRepository>(
          InfrastructureTokens.AiScenarioRegistryScenarioRepository,
        ),
        provider.resolve<IScenarioCatalog>(
          InfrastructureTokens.AiScenarioRegistryScenarioCatalog,
        ),
        provider.resolve<IScenarioValidator>(
          InfrastructureTokens.AiScenarioRegistryScenarioValidator,
        ),
        provider.resolve<IScenarioSerializer>(
          InfrastructureTokens.AiScenarioRegistryScenarioSerializer,
        ),
        provider.resolve<IScenarioStatisticsProvider>(
          InfrastructureTokens.AiScenarioRegistryScenarioStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryRegisterScenarioUseCase,
    (provider) =>
      new RegisterScenarioUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryGetScenarioUseCase,
    (provider) =>
      new GetScenarioUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryListScenariosUseCase,
    (provider) =>
      new ListScenariosUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryUpdateScenarioUseCase,
    (provider) =>
      new UpdateScenarioUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryDeleteScenarioUseCase,
    (provider) =>
      new DeleteScenarioUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryFindScenarioByNameUseCase,
    (provider) =>
      new FindScenarioByNameUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryListScenariosByCategoryUseCase,
    (provider) =>
      new ListScenariosByCategoryUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryGetScenarioRegistryStatisticsUseCase,
    (provider) =>
      new GetScenarioRegistryStatisticsUseCase(
        provider.resolve<AiScenarioRegistryService>(
          InfrastructureTokens.AiScenarioRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiScenarioRegistryApplicationService,
    (provider) =>
      new AiScenarioRegistryApplicationService(
        provider.resolve<RegisterScenarioUseCase>(
          InfrastructureTokens.AiScenarioRegistryRegisterScenarioUseCase,
        ),
        provider.resolve<GetScenarioUseCase>(
          InfrastructureTokens.AiScenarioRegistryGetScenarioUseCase,
        ),
        provider.resolve<ListScenariosUseCase>(
          InfrastructureTokens.AiScenarioRegistryListScenariosUseCase,
        ),
        provider.resolve<UpdateScenarioUseCase>(
          InfrastructureTokens.AiScenarioRegistryUpdateScenarioUseCase,
        ),
        provider.resolve<DeleteScenarioUseCase>(
          InfrastructureTokens.AiScenarioRegistryDeleteScenarioUseCase,
        ),
        provider.resolve<FindScenarioByNameUseCase>(
          InfrastructureTokens.AiScenarioRegistryFindScenarioByNameUseCase,
        ),
        provider.resolve<ListScenariosByCategoryUseCase>(
          InfrastructureTokens.AiScenarioRegistryListScenariosByCategoryUseCase,
        ),
        provider.resolve<GetScenarioRegistryStatisticsUseCase>(
          InfrastructureTokens.AiScenarioRegistryGetScenarioRegistryStatisticsUseCase,
        ),
      ),
  );
}
