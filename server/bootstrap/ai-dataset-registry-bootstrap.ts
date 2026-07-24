import type { IDatasetCatalog } from "@server/application/ai-dataset-registry/contracts/dataset-catalog.contract";
import type { IDatasetRepository } from "@server/application/ai-dataset-registry/contracts/dataset-repository.contract";
import type { IDatasetSerializer } from "@server/application/ai-dataset-registry/contracts/dataset-serializer.contract";
import type { IDatasetStatisticsProvider } from "@server/application/ai-dataset-registry/contracts/dataset-statistics-provider.contract";
import type { IDatasetValidator } from "@server/application/ai-dataset-registry/contracts/dataset-validator.contract";
import {
  AiDatasetRegistryApplicationService,
  AiDatasetRegistryService,
  DeleteDatasetUseCase,
  FindDatasetByNameUseCase,
  GetDatasetRegistryStatisticsUseCase,
  GetDatasetUseCase,
  ListDatasetsByCategoryUseCase,
  ListDatasetsUseCase,
  RegisterDatasetUseCase,
  UpdateDatasetUseCase,
} from "@server/application/ai-dataset-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DatasetRepository } from "@server/infrastructure/ai-dataset-registry/dataset.repository";
import { DefaultDatasetCatalog } from "@server/infrastructure/ai-dataset-registry/default-dataset.catalog";
import { DefaultDatasetStatisticsProvider } from "@server/infrastructure/ai-dataset-registry/default-dataset-statistics.provider";
import { DefaultDatasetValidator } from "@server/infrastructure/ai-dataset-registry/default-dataset.validator";
import { JsonDatasetSerializer } from "@server/infrastructure/ai-dataset-registry/json-dataset.serializer";

/** Registers AI Dataset Registry services and use cases. */
export function registerAiDatasetRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiDatasetRegistryDatasetRepository,
    () => new DatasetRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetRegistryDatasetCatalog,
    () => new DefaultDatasetCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetRegistryDatasetValidator,
    () => new DefaultDatasetValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetRegistryDatasetSerializer,
    () => new JsonDatasetSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiDatasetRegistryDatasetStatisticsProvider,
    () => new DefaultDatasetStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryService,
    (provider) =>
      new AiDatasetRegistryService(
        provider.resolve<IDatasetRepository>(
          InfrastructureTokens.AiDatasetRegistryDatasetRepository,
        ),
        provider.resolve<IDatasetCatalog>(
          InfrastructureTokens.AiDatasetRegistryDatasetCatalog,
        ),
        provider.resolve<IDatasetValidator>(
          InfrastructureTokens.AiDatasetRegistryDatasetValidator,
        ),
        provider.resolve<IDatasetSerializer>(
          InfrastructureTokens.AiDatasetRegistryDatasetSerializer,
        ),
        provider.resolve<IDatasetStatisticsProvider>(
          InfrastructureTokens.AiDatasetRegistryDatasetStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryRegisterDatasetUseCase,
    (provider) =>
      new RegisterDatasetUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryGetDatasetUseCase,
    (provider) =>
      new GetDatasetUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryListDatasetsUseCase,
    (provider) =>
      new ListDatasetsUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryUpdateDatasetUseCase,
    (provider) =>
      new UpdateDatasetUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryDeleteDatasetUseCase,
    (provider) =>
      new DeleteDatasetUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryFindDatasetByNameUseCase,
    (provider) =>
      new FindDatasetByNameUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryListDatasetsByCategoryUseCase,
    (provider) =>
      new ListDatasetsByCategoryUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryGetDatasetRegistryStatisticsUseCase,
    (provider) =>
      new GetDatasetRegistryStatisticsUseCase(
        provider.resolve<AiDatasetRegistryService>(
          InfrastructureTokens.AiDatasetRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiDatasetRegistryApplicationService,
    (provider) =>
      new AiDatasetRegistryApplicationService(
        provider.resolve<RegisterDatasetUseCase>(
          InfrastructureTokens.AiDatasetRegistryRegisterDatasetUseCase,
        ),
        provider.resolve<GetDatasetUseCase>(
          InfrastructureTokens.AiDatasetRegistryGetDatasetUseCase,
        ),
        provider.resolve<ListDatasetsUseCase>(
          InfrastructureTokens.AiDatasetRegistryListDatasetsUseCase,
        ),
        provider.resolve<UpdateDatasetUseCase>(
          InfrastructureTokens.AiDatasetRegistryUpdateDatasetUseCase,
        ),
        provider.resolve<DeleteDatasetUseCase>(
          InfrastructureTokens.AiDatasetRegistryDeleteDatasetUseCase,
        ),
        provider.resolve<FindDatasetByNameUseCase>(
          InfrastructureTokens.AiDatasetRegistryFindDatasetByNameUseCase,
        ),
        provider.resolve<ListDatasetsByCategoryUseCase>(
          InfrastructureTokens.AiDatasetRegistryListDatasetsByCategoryUseCase,
        ),
        provider.resolve<GetDatasetRegistryStatisticsUseCase>(
          InfrastructureTokens.AiDatasetRegistryGetDatasetRegistryStatisticsUseCase,
        ),
      ),
  );
}
