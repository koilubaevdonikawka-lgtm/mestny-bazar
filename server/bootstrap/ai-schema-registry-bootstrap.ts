import type { ISchemaCatalog } from "@server/application/ai-schema-registry/contracts/schema-catalog.contract";
import type { ISchemaRepository } from "@server/application/ai-schema-registry/contracts/schema-repository.contract";
import type { ISchemaSerializer } from "@server/application/ai-schema-registry/contracts/schema-serializer.contract";
import type { ISchemaStatisticsProvider } from "@server/application/ai-schema-registry/contracts/schema-statistics-provider.contract";
import type { ISchemaValidator } from "@server/application/ai-schema-registry/contracts/schema-validator.contract";
import {
  AiSchemaRegistryApplicationService,
  AiSchemaRegistryService,
  DeleteSchemaUseCase,
  FindSchemaByNameUseCase,
  GetSchemaRegistryStatisticsUseCase,
  GetSchemaUseCase,
  ListSchemasByCategoryUseCase,
  ListSchemasUseCase,
  RegisterSchemaUseCase,
  UpdateSchemaUseCase,
} from "@server/application/ai-schema-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { SchemaRepository } from "@server/infrastructure/ai-schema-registry/schema.repository";
import { DefaultSchemaCatalog } from "@server/infrastructure/ai-schema-registry/default-schema.catalog";
import { DefaultSchemaStatisticsProvider } from "@server/infrastructure/ai-schema-registry/default-schema-statistics.provider";
import { DefaultSchemaValidator } from "@server/infrastructure/ai-schema-registry/default-schema.validator";
import { JsonSchemaSerializer } from "@server/infrastructure/ai-schema-registry/json-schema.serializer";

/** Registers AI Schema Registry services and use cases. */
export function registerAiSchemaRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSchemaRegistrySchemaRepository,
    () => new SchemaRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSchemaRegistrySchemaCatalog,
    () => new DefaultSchemaCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSchemaRegistrySchemaValidator,
    () => new DefaultSchemaValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSchemaRegistrySchemaSerializer,
    () => new JsonSchemaSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSchemaRegistrySchemaStatisticsProvider,
    () => new DefaultSchemaStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryService,
    (provider) =>
      new AiSchemaRegistryService(
        provider.resolve<ISchemaRepository>(
          InfrastructureTokens.AiSchemaRegistrySchemaRepository,
        ),
        provider.resolve<ISchemaCatalog>(
          InfrastructureTokens.AiSchemaRegistrySchemaCatalog,
        ),
        provider.resolve<ISchemaValidator>(
          InfrastructureTokens.AiSchemaRegistrySchemaValidator,
        ),
        provider.resolve<ISchemaSerializer>(
          InfrastructureTokens.AiSchemaRegistrySchemaSerializer,
        ),
        provider.resolve<ISchemaStatisticsProvider>(
          InfrastructureTokens.AiSchemaRegistrySchemaStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryRegisterSchemaUseCase,
    (provider) =>
      new RegisterSchemaUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryGetSchemaUseCase,
    (provider) =>
      new GetSchemaUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryListSchemasUseCase,
    (provider) =>
      new ListSchemasUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryUpdateSchemaUseCase,
    (provider) =>
      new UpdateSchemaUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryDeleteSchemaUseCase,
    (provider) =>
      new DeleteSchemaUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryFindSchemaByNameUseCase,
    (provider) =>
      new FindSchemaByNameUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryListSchemasByCategoryUseCase,
    (provider) =>
      new ListSchemasByCategoryUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryGetSchemaRegistryStatisticsUseCase,
    (provider) =>
      new GetSchemaRegistryStatisticsUseCase(
        provider.resolve<AiSchemaRegistryService>(
          InfrastructureTokens.AiSchemaRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSchemaRegistryApplicationService,
    (provider) =>
      new AiSchemaRegistryApplicationService(
        provider.resolve<RegisterSchemaUseCase>(
          InfrastructureTokens.AiSchemaRegistryRegisterSchemaUseCase,
        ),
        provider.resolve<GetSchemaUseCase>(
          InfrastructureTokens.AiSchemaRegistryGetSchemaUseCase,
        ),
        provider.resolve<ListSchemasUseCase>(
          InfrastructureTokens.AiSchemaRegistryListSchemasUseCase,
        ),
        provider.resolve<UpdateSchemaUseCase>(
          InfrastructureTokens.AiSchemaRegistryUpdateSchemaUseCase,
        ),
        provider.resolve<DeleteSchemaUseCase>(
          InfrastructureTokens.AiSchemaRegistryDeleteSchemaUseCase,
        ),
        provider.resolve<FindSchemaByNameUseCase>(
          InfrastructureTokens.AiSchemaRegistryFindSchemaByNameUseCase,
        ),
        provider.resolve<ListSchemasByCategoryUseCase>(
          InfrastructureTokens.AiSchemaRegistryListSchemasByCategoryUseCase,
        ),
        provider.resolve<GetSchemaRegistryStatisticsUseCase>(
          InfrastructureTokens.AiSchemaRegistryGetSchemaRegistryStatisticsUseCase,
        ),
      ),
  );
}
