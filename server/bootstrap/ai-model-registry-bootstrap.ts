import type { IModelCatalog } from "@server/application/ai-model-registry/contracts/model-catalog.contract";
import type { IModelRepository } from "@server/application/ai-model-registry/contracts/model-repository.contract";
import type { IModelSerializer } from "@server/application/ai-model-registry/contracts/model-serializer.contract";
import type { IModelStatisticsProvider } from "@server/application/ai-model-registry/contracts/model-statistics-provider.contract";
import type { IModelValidator } from "@server/application/ai-model-registry/contracts/model-validator.contract";
import {
  AiModelRegistryApplicationService,
  AiModelRegistryService,
  DeleteModelUseCase,
  FindModelByNameUseCase,
  GetModelRegistryStatisticsUseCase,
  GetModelUseCase,
  ListModelsByProviderUseCase,
  ListModelsUseCase,
  RegisterModelUseCase,
  UpdateModelUseCase,
} from "@server/application/ai-model-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultModelCatalog } from "@server/infrastructure/ai-model-registry/default-model.catalog";
import { DefaultModelStatisticsProvider } from "@server/infrastructure/ai-model-registry/default-model-statistics.provider";
import { DefaultModelValidator } from "@server/infrastructure/ai-model-registry/default-model.validator";
import { JsonModelSerializer } from "@server/infrastructure/ai-model-registry/json-model.serializer";
import { ModelRepository } from "@server/infrastructure/ai-model-registry/model.repository";

/** Registers AI Model Registry services and use cases. */
export function registerAiModelRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiModelRegistryModelRepository,
    () => new ModelRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiModelRegistryModelCatalog,
    () => new DefaultModelCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiModelRegistryModelValidator,
    () => new DefaultModelValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiModelRegistryModelSerializer,
    () => new JsonModelSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiModelRegistryModelStatisticsProvider,
    () => new DefaultModelStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryService,
    (provider) =>
      new AiModelRegistryService(
        provider.resolve<IModelRepository>(
          InfrastructureTokens.AiModelRegistryModelRepository,
        ),
        provider.resolve<IModelCatalog>(
          InfrastructureTokens.AiModelRegistryModelCatalog,
        ),
        provider.resolve<IModelValidator>(
          InfrastructureTokens.AiModelRegistryModelValidator,
        ),
        provider.resolve<IModelSerializer>(
          InfrastructureTokens.AiModelRegistryModelSerializer,
        ),
        provider.resolve<IModelStatisticsProvider>(
          InfrastructureTokens.AiModelRegistryModelStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryRegisterModelUseCase,
    (provider) =>
      new RegisterModelUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryGetModelUseCase,
    (provider) =>
      new GetModelUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryListModelsUseCase,
    (provider) =>
      new ListModelsUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryUpdateModelUseCase,
    (provider) =>
      new UpdateModelUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryDeleteModelUseCase,
    (provider) =>
      new DeleteModelUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryFindModelByNameUseCase,
    (provider) =>
      new FindModelByNameUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryListModelsByProviderUseCase,
    (provider) =>
      new ListModelsByProviderUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryGetModelRegistryStatisticsUseCase,
    (provider) =>
      new GetModelRegistryStatisticsUseCase(
        provider.resolve<AiModelRegistryService>(InfrastructureTokens.AiModelRegistryService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiModelRegistryApplicationService,
    (provider) =>
      new AiModelRegistryApplicationService(
        provider.resolve<RegisterModelUseCase>(
          InfrastructureTokens.AiModelRegistryRegisterModelUseCase,
        ),
        provider.resolve<GetModelUseCase>(
          InfrastructureTokens.AiModelRegistryGetModelUseCase,
        ),
        provider.resolve<ListModelsUseCase>(
          InfrastructureTokens.AiModelRegistryListModelsUseCase,
        ),
        provider.resolve<UpdateModelUseCase>(
          InfrastructureTokens.AiModelRegistryUpdateModelUseCase,
        ),
        provider.resolve<DeleteModelUseCase>(
          InfrastructureTokens.AiModelRegistryDeleteModelUseCase,
        ),
        provider.resolve<FindModelByNameUseCase>(
          InfrastructureTokens.AiModelRegistryFindModelByNameUseCase,
        ),
        provider.resolve<ListModelsByProviderUseCase>(
          InfrastructureTokens.AiModelRegistryListModelsByProviderUseCase,
        ),
        provider.resolve<GetModelRegistryStatisticsUseCase>(
          InfrastructureTokens.AiModelRegistryGetModelRegistryStatisticsUseCase,
        ),
      ),
  );
}
