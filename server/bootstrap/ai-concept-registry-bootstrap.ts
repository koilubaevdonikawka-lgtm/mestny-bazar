import type { IConceptCatalog } from "@server/application/ai-concept-registry/contracts/concept-catalog.contract";
import type { IConceptRepository } from "@server/application/ai-concept-registry/contracts/concept-repository.contract";
import type { IConceptSerializer } from "@server/application/ai-concept-registry/contracts/concept-serializer.contract";
import type { IConceptStatisticsProvider } from "@server/application/ai-concept-registry/contracts/concept-statistics-provider.contract";
import type { IConceptValidator } from "@server/application/ai-concept-registry/contracts/concept-validator.contract";
import {
  AiConceptRegistryApplicationService,
  AiConceptRegistryService,
  DeleteConceptUseCase,
  FindConceptByNameUseCase,
  GetConceptRegistryStatisticsUseCase,
  GetConceptUseCase,
  ListConceptsByCategoryUseCase,
  ListConceptsUseCase,
  RegisterConceptUseCase,
  UpdateConceptUseCase,
} from "@server/application/ai-concept-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ConceptRepository } from "@server/infrastructure/ai-concept-registry/concept.repository";
import { DefaultConceptCatalog } from "@server/infrastructure/ai-concept-registry/default-concept.catalog";
import { DefaultConceptStatisticsProvider } from "@server/infrastructure/ai-concept-registry/default-concept-statistics.provider";
import { DefaultConceptValidator } from "@server/infrastructure/ai-concept-registry/default-concept.validator";
import { JsonConceptSerializer } from "@server/infrastructure/ai-concept-registry/json-concept.serializer";

/** Registers AI Concept Registry services and use cases. */
export function registerAiConceptRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiConceptRegistryConceptRepository,
    () => new ConceptRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConceptRegistryConceptCatalog,
    () => new DefaultConceptCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConceptRegistryConceptValidator,
    () => new DefaultConceptValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConceptRegistryConceptSerializer,
    () => new JsonConceptSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiConceptRegistryConceptStatisticsProvider,
    () => new DefaultConceptStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryService,
    (provider) =>
      new AiConceptRegistryService(
        provider.resolve<IConceptRepository>(
          InfrastructureTokens.AiConceptRegistryConceptRepository,
        ),
        provider.resolve<IConceptCatalog>(
          InfrastructureTokens.AiConceptRegistryConceptCatalog,
        ),
        provider.resolve<IConceptValidator>(
          InfrastructureTokens.AiConceptRegistryConceptValidator,
        ),
        provider.resolve<IConceptSerializer>(
          InfrastructureTokens.AiConceptRegistryConceptSerializer,
        ),
        provider.resolve<IConceptStatisticsProvider>(
          InfrastructureTokens.AiConceptRegistryConceptStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryRegisterConceptUseCase,
    (provider) =>
      new RegisterConceptUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryGetConceptUseCase,
    (provider) =>
      new GetConceptUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryListConceptsUseCase,
    (provider) =>
      new ListConceptsUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryUpdateConceptUseCase,
    (provider) =>
      new UpdateConceptUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryDeleteConceptUseCase,
    (provider) =>
      new DeleteConceptUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryFindConceptByNameUseCase,
    (provider) =>
      new FindConceptByNameUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryListConceptsByCategoryUseCase,
    (provider) =>
      new ListConceptsByCategoryUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryGetConceptRegistryStatisticsUseCase,
    (provider) =>
      new GetConceptRegistryStatisticsUseCase(
        provider.resolve<AiConceptRegistryService>(
          InfrastructureTokens.AiConceptRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiConceptRegistryApplicationService,
    (provider) =>
      new AiConceptRegistryApplicationService(
        provider.resolve<RegisterConceptUseCase>(
          InfrastructureTokens.AiConceptRegistryRegisterConceptUseCase,
        ),
        provider.resolve<GetConceptUseCase>(
          InfrastructureTokens.AiConceptRegistryGetConceptUseCase,
        ),
        provider.resolve<ListConceptsUseCase>(
          InfrastructureTokens.AiConceptRegistryListConceptsUseCase,
        ),
        provider.resolve<UpdateConceptUseCase>(
          InfrastructureTokens.AiConceptRegistryUpdateConceptUseCase,
        ),
        provider.resolve<DeleteConceptUseCase>(
          InfrastructureTokens.AiConceptRegistryDeleteConceptUseCase,
        ),
        provider.resolve<FindConceptByNameUseCase>(
          InfrastructureTokens.AiConceptRegistryFindConceptByNameUseCase,
        ),
        provider.resolve<ListConceptsByCategoryUseCase>(
          InfrastructureTokens.AiConceptRegistryListConceptsByCategoryUseCase,
        ),
        provider.resolve<GetConceptRegistryStatisticsUseCase>(
          InfrastructureTokens.AiConceptRegistryGetConceptRegistryStatisticsUseCase,
        ),
      ),
  );
}
