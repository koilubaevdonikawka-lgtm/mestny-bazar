import type { ICatalogMetadataCatalog } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-catalog.contract";
import type { ICatalogMetadataRepository } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-repository.contract";
import type { ICatalogMetadataSerializer } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-serializer.contract";
import type { ICatalogMetadataStatisticsProvider } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-statistics-provider.contract";
import type { ICatalogMetadataValidator } from "@server/application/ai-catalog-metadata/contracts/catalog-metadata-validator.contract";
import {
  AiCatalogMetadataApplicationService,
  AiCatalogMetadataService,
  DeleteCatalogMetadataUseCase,
  FindCatalogMetadataByNameUseCase,
  GetCatalogMetadataStatisticsUseCase,
  GetCatalogMetadataUseCase,
  ListCatalogMetadataByCategoryUseCase,
  ListCatalogMetadataUseCase,
  RegisterCatalogMetadataUseCase,
  UpdateCatalogMetadataUseCase,
} from "@server/application/ai-catalog-metadata";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CatalogMetadataRepository } from "@server/infrastructure/ai-catalog-metadata/catalog-metadata.repository";
import { DefaultCatalogMetadataCatalog } from "@server/infrastructure/ai-catalog-metadata/default-catalog-metadata.catalog";
import { DefaultCatalogMetadataStatisticsProvider } from "@server/infrastructure/ai-catalog-metadata/default-catalog-metadata-statistics.provider";
import { DefaultCatalogMetadataValidator } from "@server/infrastructure/ai-catalog-metadata/default-catalog-metadata.validator";
import { JsonCatalogMetadataSerializer } from "@server/infrastructure/ai-catalog-metadata/json-catalog-metadata.serializer";

/** Registers AI Catalog Metadata services and use cases. */
export function registerAiCatalogMetadataApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiCatalogMetadataMetadataRepository,
    () => new CatalogMetadataRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCatalogMetadataMetadataCatalog,
    () => new DefaultCatalogMetadataCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCatalogMetadataMetadataValidator,
    () => new DefaultCatalogMetadataValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCatalogMetadataMetadataSerializer,
    () => new JsonCatalogMetadataSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCatalogMetadataMetadataStatisticsProvider,
    () => new DefaultCatalogMetadataStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataService,
    (provider) =>
      new AiCatalogMetadataService(
        provider.resolve<ICatalogMetadataRepository>(
          InfrastructureTokens.AiCatalogMetadataMetadataRepository,
        ),
        provider.resolve<ICatalogMetadataCatalog>(
          InfrastructureTokens.AiCatalogMetadataMetadataCatalog,
        ),
        provider.resolve<ICatalogMetadataValidator>(
          InfrastructureTokens.AiCatalogMetadataMetadataValidator,
        ),
        provider.resolve<ICatalogMetadataSerializer>(
          InfrastructureTokens.AiCatalogMetadataMetadataSerializer,
        ),
        provider.resolve<ICatalogMetadataStatisticsProvider>(
          InfrastructureTokens.AiCatalogMetadataMetadataStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataRegisterCatalogMetadataUseCase,
    (provider) =>
      new RegisterCatalogMetadataUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataGetCatalogMetadataUseCase,
    (provider) =>
      new GetCatalogMetadataUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataListCatalogMetadataUseCase,
    (provider) =>
      new ListCatalogMetadataUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataUpdateCatalogMetadataUseCase,
    (provider) =>
      new UpdateCatalogMetadataUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataDeleteCatalogMetadataUseCase,
    (provider) =>
      new DeleteCatalogMetadataUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataFindCatalogMetadataByNameUseCase,
    (provider) =>
      new FindCatalogMetadataByNameUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataListCatalogMetadataByCategoryUseCase,
    (provider) =>
      new ListCatalogMetadataByCategoryUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataGetCatalogMetadataStatisticsUseCase,
    (provider) =>
      new GetCatalogMetadataStatisticsUseCase(
        provider.resolve<AiCatalogMetadataService>(InfrastructureTokens.AiCatalogMetadataService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCatalogMetadataApplicationService,
    (provider) =>
      new AiCatalogMetadataApplicationService(
        provider.resolve<RegisterCatalogMetadataUseCase>(
          InfrastructureTokens.AiCatalogMetadataRegisterCatalogMetadataUseCase,
        ),
        provider.resolve<GetCatalogMetadataUseCase>(
          InfrastructureTokens.AiCatalogMetadataGetCatalogMetadataUseCase,
        ),
        provider.resolve<ListCatalogMetadataUseCase>(
          InfrastructureTokens.AiCatalogMetadataListCatalogMetadataUseCase,
        ),
        provider.resolve<UpdateCatalogMetadataUseCase>(
          InfrastructureTokens.AiCatalogMetadataUpdateCatalogMetadataUseCase,
        ),
        provider.resolve<DeleteCatalogMetadataUseCase>(
          InfrastructureTokens.AiCatalogMetadataDeleteCatalogMetadataUseCase,
        ),
        provider.resolve<FindCatalogMetadataByNameUseCase>(
          InfrastructureTokens.AiCatalogMetadataFindCatalogMetadataByNameUseCase,
        ),
        provider.resolve<ListCatalogMetadataByCategoryUseCase>(
          InfrastructureTokens.AiCatalogMetadataListCatalogMetadataByCategoryUseCase,
        ),
        provider.resolve<GetCatalogMetadataStatisticsUseCase>(
          InfrastructureTokens.AiCatalogMetadataGetCatalogMetadataStatisticsUseCase,
        ),
      ),
  );
}
