import type { IExperimentCatalog } from "@server/application/ai-experiment-registry/contracts/experiment-catalog.contract";
import type { IExperimentRepository } from "@server/application/ai-experiment-registry/contracts/experiment-repository.contract";
import type { IExperimentSerializer } from "@server/application/ai-experiment-registry/contracts/experiment-serializer.contract";
import type { IExperimentStatisticsProvider } from "@server/application/ai-experiment-registry/contracts/experiment-statistics-provider.contract";
import type { IExperimentValidator } from "@server/application/ai-experiment-registry/contracts/experiment-validator.contract";
import {
  AiExperimentRegistryApplicationService,
  AiExperimentRegistryService,
  DeleteExperimentUseCase,
  FindExperimentByNameUseCase,
  GetExperimentRegistryStatisticsUseCase,
  GetExperimentUseCase,
  ListExperimentsByCategoryUseCase,
  ListExperimentsUseCase,
  RegisterExperimentUseCase,
  UpdateExperimentUseCase,
} from "@server/application/ai-experiment-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ExperimentRepository } from "@server/infrastructure/ai-experiment-registry/experiment.repository";
import { DefaultExperimentCatalog } from "@server/infrastructure/ai-experiment-registry/default-experiment.catalog";
import { DefaultExperimentStatisticsProvider } from "@server/infrastructure/ai-experiment-registry/default-experiment-statistics.provider";
import { DefaultExperimentValidator } from "@server/infrastructure/ai-experiment-registry/default-experiment.validator";
import { JsonExperimentSerializer } from "@server/infrastructure/ai-experiment-registry/json-experiment.serializer";

/** Registers AI Experiment Registry services and use cases. */
export function registerAiExperimentRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiExperimentRegistryExperimentRepository,
    () => new ExperimentRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExperimentRegistryExperimentCatalog,
    () => new DefaultExperimentCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExperimentRegistryExperimentValidator,
    () => new DefaultExperimentValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExperimentRegistryExperimentSerializer,
    () => new JsonExperimentSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExperimentRegistryExperimentStatisticsProvider,
    () => new DefaultExperimentStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryService,
    (provider) =>
      new AiExperimentRegistryService(
        provider.resolve<IExperimentRepository>(
          InfrastructureTokens.AiExperimentRegistryExperimentRepository,
        ),
        provider.resolve<IExperimentCatalog>(
          InfrastructureTokens.AiExperimentRegistryExperimentCatalog,
        ),
        provider.resolve<IExperimentValidator>(
          InfrastructureTokens.AiExperimentRegistryExperimentValidator,
        ),
        provider.resolve<IExperimentSerializer>(
          InfrastructureTokens.AiExperimentRegistryExperimentSerializer,
        ),
        provider.resolve<IExperimentStatisticsProvider>(
          InfrastructureTokens.AiExperimentRegistryExperimentStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryRegisterExperimentUseCase,
    (provider) =>
      new RegisterExperimentUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryGetExperimentUseCase,
    (provider) =>
      new GetExperimentUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryListExperimentsUseCase,
    (provider) =>
      new ListExperimentsUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryUpdateExperimentUseCase,
    (provider) =>
      new UpdateExperimentUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryDeleteExperimentUseCase,
    (provider) =>
      new DeleteExperimentUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryFindExperimentByNameUseCase,
    (provider) =>
      new FindExperimentByNameUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryListExperimentsByCategoryUseCase,
    (provider) =>
      new ListExperimentsByCategoryUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryGetExperimentRegistryStatisticsUseCase,
    (provider) =>
      new GetExperimentRegistryStatisticsUseCase(
        provider.resolve<AiExperimentRegistryService>(
          InfrastructureTokens.AiExperimentRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExperimentRegistryApplicationService,
    (provider) =>
      new AiExperimentRegistryApplicationService(
        provider.resolve<RegisterExperimentUseCase>(
          InfrastructureTokens.AiExperimentRegistryRegisterExperimentUseCase,
        ),
        provider.resolve<GetExperimentUseCase>(
          InfrastructureTokens.AiExperimentRegistryGetExperimentUseCase,
        ),
        provider.resolve<ListExperimentsUseCase>(
          InfrastructureTokens.AiExperimentRegistryListExperimentsUseCase,
        ),
        provider.resolve<UpdateExperimentUseCase>(
          InfrastructureTokens.AiExperimentRegistryUpdateExperimentUseCase,
        ),
        provider.resolve<DeleteExperimentUseCase>(
          InfrastructureTokens.AiExperimentRegistryDeleteExperimentUseCase,
        ),
        provider.resolve<FindExperimentByNameUseCase>(
          InfrastructureTokens.AiExperimentRegistryFindExperimentByNameUseCase,
        ),
        provider.resolve<ListExperimentsByCategoryUseCase>(
          InfrastructureTokens.AiExperimentRegistryListExperimentsByCategoryUseCase,
        ),
        provider.resolve<GetExperimentRegistryStatisticsUseCase>(
          InfrastructureTokens.AiExperimentRegistryGetExperimentRegistryStatisticsUseCase,
        ),
      ),
  );
}
