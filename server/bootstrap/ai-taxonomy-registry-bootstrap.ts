import type { ITaxonomyCatalog } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-catalog.contract";
import type { ITaxonomyRepository } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-repository.contract";
import type { ITaxonomySerializer } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-serializer.contract";
import type { ITaxonomyStatisticsProvider } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-statistics-provider.contract";
import type { ITaxonomyValidator } from "@server/application/ai-taxonomy-registry/contracts/taxonomy-validator.contract";
import {
  AiTaxonomyRegistryApplicationService,
  AiTaxonomyRegistryService,
  DeleteTaxonomyUseCase,
  FindTaxonomyByNameUseCase,
  GetTaxonomyRegistryStatisticsUseCase,
  GetTaxonomyUseCase,
  ListTaxonomiesByCategoryUseCase,
  ListTaxonomiesUseCase,
  RegisterTaxonomyUseCase,
  UpdateTaxonomyUseCase,
} from "@server/application/ai-taxonomy-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { TaxonomyRepository } from "@server/infrastructure/ai-taxonomy-registry/taxonomy.repository";
import { DefaultTaxonomyCatalog } from "@server/infrastructure/ai-taxonomy-registry/default-taxonomy.catalog";
import { DefaultTaxonomyStatisticsProvider } from "@server/infrastructure/ai-taxonomy-registry/default-taxonomy-statistics.provider";
import { DefaultTaxonomyValidator } from "@server/infrastructure/ai-taxonomy-registry/default-taxonomy.validator";
import { JsonTaxonomySerializer } from "@server/infrastructure/ai-taxonomy-registry/json-taxonomy.serializer";

/** Registers AI Taxonomy Registry services and use cases. */
export function registerAiTaxonomyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiTaxonomyRegistryTaxonomyRepository,
    () => new TaxonomyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTaxonomyRegistryTaxonomyCatalog,
    () => new DefaultTaxonomyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTaxonomyRegistryTaxonomyValidator,
    () => new DefaultTaxonomyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTaxonomyRegistryTaxonomySerializer,
    () => new JsonTaxonomySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTaxonomyRegistryTaxonomyStatisticsProvider,
    () => new DefaultTaxonomyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryService,
    (provider) =>
      new AiTaxonomyRegistryService(
        provider.resolve<ITaxonomyRepository>(
          InfrastructureTokens.AiTaxonomyRegistryTaxonomyRepository,
        ),
        provider.resolve<ITaxonomyCatalog>(
          InfrastructureTokens.AiTaxonomyRegistryTaxonomyCatalog,
        ),
        provider.resolve<ITaxonomyValidator>(
          InfrastructureTokens.AiTaxonomyRegistryTaxonomyValidator,
        ),
        provider.resolve<ITaxonomySerializer>(
          InfrastructureTokens.AiTaxonomyRegistryTaxonomySerializer,
        ),
        provider.resolve<ITaxonomyStatisticsProvider>(
          InfrastructureTokens.AiTaxonomyRegistryTaxonomyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryRegisterTaxonomyUseCase,
    (provider) =>
      new RegisterTaxonomyUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryGetTaxonomyUseCase,
    (provider) =>
      new GetTaxonomyUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryListTaxonomiesUseCase,
    (provider) =>
      new ListTaxonomiesUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryUpdateTaxonomyUseCase,
    (provider) =>
      new UpdateTaxonomyUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryDeleteTaxonomyUseCase,
    (provider) =>
      new DeleteTaxonomyUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryFindTaxonomyByNameUseCase,
    (provider) =>
      new FindTaxonomyByNameUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryListTaxonomiesByCategoryUseCase,
    (provider) =>
      new ListTaxonomiesByCategoryUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryGetTaxonomyRegistryStatisticsUseCase,
    (provider) =>
      new GetTaxonomyRegistryStatisticsUseCase(
        provider.resolve<AiTaxonomyRegistryService>(
          InfrastructureTokens.AiTaxonomyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTaxonomyRegistryApplicationService,
    (provider) =>
      new AiTaxonomyRegistryApplicationService(
        provider.resolve<RegisterTaxonomyUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryRegisterTaxonomyUseCase,
        ),
        provider.resolve<GetTaxonomyUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryGetTaxonomyUseCase,
        ),
        provider.resolve<ListTaxonomiesUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryListTaxonomiesUseCase,
        ),
        provider.resolve<UpdateTaxonomyUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryUpdateTaxonomyUseCase,
        ),
        provider.resolve<DeleteTaxonomyUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryDeleteTaxonomyUseCase,
        ),
        provider.resolve<FindTaxonomyByNameUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryFindTaxonomyByNameUseCase,
        ),
        provider.resolve<ListTaxonomiesByCategoryUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryListTaxonomiesByCategoryUseCase,
        ),
        provider.resolve<GetTaxonomyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiTaxonomyRegistryGetTaxonomyRegistryStatisticsUseCase,
        ),
      ),
  );
}
