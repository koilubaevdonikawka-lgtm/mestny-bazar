import type { IOntologyCatalog } from "@server/application/ai-ontology-registry/contracts/ontology-catalog.contract";
import type { IOntologyRepository } from "@server/application/ai-ontology-registry/contracts/ontology-repository.contract";
import type { IOntologySerializer } from "@server/application/ai-ontology-registry/contracts/ontology-serializer.contract";
import type { IOntologyStatisticsProvider } from "@server/application/ai-ontology-registry/contracts/ontology-statistics-provider.contract";
import type { IOntologyValidator } from "@server/application/ai-ontology-registry/contracts/ontology-validator.contract";
import {
  AiOntologyRegistryApplicationService,
  AiOntologyRegistryService,
  DeleteOntologyUseCase,
  FindOntologyByNameUseCase,
  GetOntologyRegistryStatisticsUseCase,
  GetOntologyUseCase,
  ListOntologiesByCategoryUseCase,
  ListOntologiesUseCase,
  RegisterOntologyUseCase,
  UpdateOntologyUseCase,
} from "@server/application/ai-ontology-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { OntologyRepository } from "@server/infrastructure/ai-ontology-registry/ontology.repository";
import { DefaultOntologyCatalog } from "@server/infrastructure/ai-ontology-registry/default-ontology.catalog";
import { DefaultOntologyStatisticsProvider } from "@server/infrastructure/ai-ontology-registry/default-ontology-statistics.provider";
import { DefaultOntologyValidator } from "@server/infrastructure/ai-ontology-registry/default-ontology.validator";
import { JsonOntologySerializer } from "@server/infrastructure/ai-ontology-registry/json-ontology.serializer";

/** Registers AI Ontology Registry services and use cases. */
export function registerAiOntologyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiOntologyRegistryOntologyRepository,
    () => new OntologyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiOntologyRegistryOntologyCatalog,
    () => new DefaultOntologyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiOntologyRegistryOntologyValidator,
    () => new DefaultOntologyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiOntologyRegistryOntologySerializer,
    () => new JsonOntologySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiOntologyRegistryOntologyStatisticsProvider,
    () => new DefaultOntologyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryService,
    (provider) =>
      new AiOntologyRegistryService(
        provider.resolve<IOntologyRepository>(
          InfrastructureTokens.AiOntologyRegistryOntologyRepository,
        ),
        provider.resolve<IOntologyCatalog>(
          InfrastructureTokens.AiOntologyRegistryOntologyCatalog,
        ),
        provider.resolve<IOntologyValidator>(
          InfrastructureTokens.AiOntologyRegistryOntologyValidator,
        ),
        provider.resolve<IOntologySerializer>(
          InfrastructureTokens.AiOntologyRegistryOntologySerializer,
        ),
        provider.resolve<IOntologyStatisticsProvider>(
          InfrastructureTokens.AiOntologyRegistryOntologyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryRegisterOntologyUseCase,
    (provider) =>
      new RegisterOntologyUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryGetOntologyUseCase,
    (provider) =>
      new GetOntologyUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryListOntologiesUseCase,
    (provider) =>
      new ListOntologiesUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryUpdateOntologyUseCase,
    (provider) =>
      new UpdateOntologyUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryDeleteOntologyUseCase,
    (provider) =>
      new DeleteOntologyUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryFindOntologyByNameUseCase,
    (provider) =>
      new FindOntologyByNameUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryListOntologiesByCategoryUseCase,
    (provider) =>
      new ListOntologiesByCategoryUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryGetOntologyRegistryStatisticsUseCase,
    (provider) =>
      new GetOntologyRegistryStatisticsUseCase(
        provider.resolve<AiOntologyRegistryService>(
          InfrastructureTokens.AiOntologyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiOntologyRegistryApplicationService,
    (provider) =>
      new AiOntologyRegistryApplicationService(
        provider.resolve<RegisterOntologyUseCase>(
          InfrastructureTokens.AiOntologyRegistryRegisterOntologyUseCase,
        ),
        provider.resolve<GetOntologyUseCase>(
          InfrastructureTokens.AiOntologyRegistryGetOntologyUseCase,
        ),
        provider.resolve<ListOntologiesUseCase>(
          InfrastructureTokens.AiOntologyRegistryListOntologiesUseCase,
        ),
        provider.resolve<UpdateOntologyUseCase>(
          InfrastructureTokens.AiOntologyRegistryUpdateOntologyUseCase,
        ),
        provider.resolve<DeleteOntologyUseCase>(
          InfrastructureTokens.AiOntologyRegistryDeleteOntologyUseCase,
        ),
        provider.resolve<FindOntologyByNameUseCase>(
          InfrastructureTokens.AiOntologyRegistryFindOntologyByNameUseCase,
        ),
        provider.resolve<ListOntologiesByCategoryUseCase>(
          InfrastructureTokens.AiOntologyRegistryListOntologiesByCategoryUseCase,
        ),
        provider.resolve<GetOntologyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiOntologyRegistryGetOntologyRegistryStatisticsUseCase,
        ),
      ),
  );
}
