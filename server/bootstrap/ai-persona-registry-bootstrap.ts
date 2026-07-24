import type { IPersonaCatalog } from "@server/application/ai-persona-registry/contracts/persona-catalog.contract";
import type { IPersonaRepository } from "@server/application/ai-persona-registry/contracts/persona-repository.contract";
import type { IPersonaSerializer } from "@server/application/ai-persona-registry/contracts/persona-serializer.contract";
import type { IPersonaStatisticsProvider } from "@server/application/ai-persona-registry/contracts/persona-statistics-provider.contract";
import type { IPersonaValidator } from "@server/application/ai-persona-registry/contracts/persona-validator.contract";
import {
  AiPersonaRegistryApplicationService,
  AiPersonaRegistryService,
  DeletePersonaUseCase,
  FindPersonaByNameUseCase,
  GetPersonaRegistryStatisticsUseCase,
  GetPersonaUseCase,
  ListPersonasByTypeUseCase,
  ListPersonasUseCase,
  RegisterPersonaUseCase,
  UpdatePersonaUseCase,
} from "@server/application/ai-persona-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { PersonaRepository } from "@server/infrastructure/ai-persona-registry/persona.repository";
import { DefaultPersonaCatalog } from "@server/infrastructure/ai-persona-registry/default-persona.catalog";
import { DefaultPersonaStatisticsProvider } from "@server/infrastructure/ai-persona-registry/default-persona-statistics.provider";
import { DefaultPersonaValidator } from "@server/infrastructure/ai-persona-registry/default-persona.validator";
import { JsonPersonaSerializer } from "@server/infrastructure/ai-persona-registry/json-persona.serializer";

/** Registers AI Persona Registry services and use cases. */
export function registerAiPersonaRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPersonaRegistryPersonaRepository,
    () => new PersonaRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPersonaRegistryPersonaCatalog,
    () => new DefaultPersonaCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPersonaRegistryPersonaValidator,
    () => new DefaultPersonaValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPersonaRegistryPersonaSerializer,
    () => new JsonPersonaSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPersonaRegistryPersonaStatisticsProvider,
    () => new DefaultPersonaStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryService,
    (provider) =>
      new AiPersonaRegistryService(
        provider.resolve<IPersonaRepository>(
          InfrastructureTokens.AiPersonaRegistryPersonaRepository,
        ),
        provider.resolve<IPersonaCatalog>(
          InfrastructureTokens.AiPersonaRegistryPersonaCatalog,
        ),
        provider.resolve<IPersonaValidator>(
          InfrastructureTokens.AiPersonaRegistryPersonaValidator,
        ),
        provider.resolve<IPersonaSerializer>(
          InfrastructureTokens.AiPersonaRegistryPersonaSerializer,
        ),
        provider.resolve<IPersonaStatisticsProvider>(
          InfrastructureTokens.AiPersonaRegistryPersonaStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryRegisterPersonaUseCase,
    (provider) =>
      new RegisterPersonaUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryGetPersonaUseCase,
    (provider) =>
      new GetPersonaUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryListPersonasUseCase,
    (provider) =>
      new ListPersonasUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryUpdatePersonaUseCase,
    (provider) =>
      new UpdatePersonaUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryDeletePersonaUseCase,
    (provider) =>
      new DeletePersonaUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryFindPersonaByNameUseCase,
    (provider) =>
      new FindPersonaByNameUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryListPersonasByTypeUseCase,
    (provider) =>
      new ListPersonasByTypeUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryGetPersonaRegistryStatisticsUseCase,
    (provider) =>
      new GetPersonaRegistryStatisticsUseCase(
        provider.resolve<AiPersonaRegistryService>(
          InfrastructureTokens.AiPersonaRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPersonaRegistryApplicationService,
    (provider) =>
      new AiPersonaRegistryApplicationService(
        provider.resolve<RegisterPersonaUseCase>(
          InfrastructureTokens.AiPersonaRegistryRegisterPersonaUseCase,
        ),
        provider.resolve<GetPersonaUseCase>(
          InfrastructureTokens.AiPersonaRegistryGetPersonaUseCase,
        ),
        provider.resolve<ListPersonasUseCase>(
          InfrastructureTokens.AiPersonaRegistryListPersonasUseCase,
        ),
        provider.resolve<UpdatePersonaUseCase>(
          InfrastructureTokens.AiPersonaRegistryUpdatePersonaUseCase,
        ),
        provider.resolve<DeletePersonaUseCase>(
          InfrastructureTokens.AiPersonaRegistryDeletePersonaUseCase,
        ),
        provider.resolve<FindPersonaByNameUseCase>(
          InfrastructureTokens.AiPersonaRegistryFindPersonaByNameUseCase,
        ),
        provider.resolve<ListPersonasByTypeUseCase>(
          InfrastructureTokens.AiPersonaRegistryListPersonasByTypeUseCase,
        ),
        provider.resolve<GetPersonaRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPersonaRegistryGetPersonaRegistryStatisticsUseCase,
        ),
      ),
  );
}
