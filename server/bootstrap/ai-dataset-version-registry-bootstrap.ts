import type { IDatasetVersionCatalog } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-catalog.contract";
import type { IDatasetVersionRepository } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-repository.contract";
import type { IDatasetVersionSerializer } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-serializer.contract";
import type { IDatasetVersionStatisticsProvider } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-statistics-provider.contract";
import type { IDatasetVersionValidator } from "@server/application/ai-dataset-version-registry/contracts/dataset-version-validator.contract";
import {
  AiDatasetVersionRegistryApplicationService,
  AiDatasetVersionRegistryService,
  DeleteDatasetVersionUseCase,
  FindDatasetVersionByNameUseCase,
  GetDatasetVersionRegistryStatisticsUseCase,
  GetDatasetVersionUseCase,
  ListDatasetVersionsByCategoryUseCase,
  ListDatasetVersionsUseCase,
  RegisterDatasetVersionUseCase,
  UpdateDatasetVersionUseCase,
} from "@server/application/ai-dataset-version-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DatasetVersionRepository } from "@server/infrastructure/ai-dataset-version-registry/dataset-version.repository";
import { DefaultDatasetVersionCatalog } from "@server/infrastructure/ai-dataset-version-registry/default-dataset-version.catalog";
import { DefaultDatasetVersionStatisticsProvider } from "@server/infrastructure/ai-dataset-version-registry/default-dataset-version-statistics.provider";
import { DefaultDatasetVersionValidator } from "@server/infrastructure/ai-dataset-version-registry/default-dataset-version.validator";
import { JsonDatasetVersionSerializer } from "@server/infrastructure/ai-dataset-version-registry/json-dataset-version.serializer";

/** Registers AI Dataset Version Registry services and use cases. */
export function registerAiDatasetVersionRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionRepository,
    () => new DatasetVersionRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionCatalog,
    () => new DefaultDatasetVersionCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionValidator,
    () => new DefaultDatasetVersionValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionSerializer,
    () => new JsonDatasetVersionSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionStatisticsProvider,
    () => new DefaultDatasetVersionStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryService,
    (provider) =>
      new AiDatasetVersionRegistryService(
        provider.resolve<IDatasetVersionRepository>(
          InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionRepository,
        ),
        provider.resolve<IDatasetVersionCatalog>(
          InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionCatalog,
        ),
        provider.resolve<IDatasetVersionValidator>(
          InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionValidator,
        ),
        provider.resolve<IDatasetVersionSerializer>(
          InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionSerializer,
        ),
        provider.resolve<IDatasetVersionStatisticsProvider>(
          InfrastructureTokens.AiDatasetVersionRegistryDatasetVersionStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryRegisterDatasetVersionUseCase,
    (provider) =>
      new RegisterDatasetVersionUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryGetDatasetVersionUseCase,
    (provider) =>
      new GetDatasetVersionUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryListDatasetVersionsUseCase,
    (provider) =>
      new ListDatasetVersionsUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryUpdateDatasetVersionUseCase,
    (provider) =>
      new UpdateDatasetVersionUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryDeleteDatasetVersionUseCase,
    (provider) =>
      new DeleteDatasetVersionUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryFindDatasetVersionByNameUseCase,
    (provider) =>
      new FindDatasetVersionByNameUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryListDatasetVersionsByCategoryUseCase,
    (provider) =>
      new ListDatasetVersionsByCategoryUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryGetDatasetVersionRegistryStatisticsUseCase,
    (provider) =>
      new GetDatasetVersionRegistryStatisticsUseCase(
        provider.resolve<AiDatasetVersionRegistryService>(
          InfrastructureTokens.AiDatasetVersionRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetVersionRegistryApplicationService,
    (provider) =>
      new AiDatasetVersionRegistryApplicationService(
        provider.resolve<RegisterDatasetVersionUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryRegisterDatasetVersionUseCase,
        ),
        provider.resolve<GetDatasetVersionUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryGetDatasetVersionUseCase,
        ),
        provider.resolve<ListDatasetVersionsUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryListDatasetVersionsUseCase,
        ),
        provider.resolve<UpdateDatasetVersionUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryUpdateDatasetVersionUseCase,
        ),
        provider.resolve<DeleteDatasetVersionUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryDeleteDatasetVersionUseCase,
        ),
        provider.resolve<FindDatasetVersionByNameUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryFindDatasetVersionByNameUseCase,
        ),
        provider.resolve<ListDatasetVersionsByCategoryUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryListDatasetVersionsByCategoryUseCase,
        ),
        provider.resolve<GetDatasetVersionRegistryStatisticsUseCase>(
          InfrastructureTokens.AiDatasetVersionRegistryGetDatasetVersionRegistryStatisticsUseCase,
        ),
      ),
  );
}
