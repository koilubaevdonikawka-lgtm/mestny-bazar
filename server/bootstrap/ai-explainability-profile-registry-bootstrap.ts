import type { IExplainabilityProfileCatalog } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-catalog.contract";
import type { IExplainabilityProfileRepository } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-repository.contract";
import type { IExplainabilityProfileSerializer } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-serializer.contract";
import type { IExplainabilityProfileStatisticsProvider } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-statistics-provider.contract";
import type { IExplainabilityProfileValidator } from "@server/application/ai-explainability-profile-registry/contracts/explainability-profile-validator.contract";
import {
  AiExplainabilityProfileRegistryApplicationService,
  AiExplainabilityProfileRegistryService,
  DeleteExplainabilityProfileUseCase,
  FindExplainabilityProfileByNameUseCase,
  GetExplainabilityProfileRegistryStatisticsUseCase,
  GetExplainabilityProfileUseCase,
  ListExplainabilityProfilesByCategoryUseCase,
  ListExplainabilityProfilesUseCase,
  RegisterExplainabilityProfileUseCase,
  UpdateExplainabilityProfileUseCase,
} from "@server/application/ai-explainability-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ExplainabilityProfileRepository } from "@server/infrastructure/ai-explainability-profile-registry/explainability-profile.repository";
import { DefaultExplainabilityProfileCatalog } from "@server/infrastructure/ai-explainability-profile-registry/default-explainability-profile.catalog";
import { DefaultExplainabilityProfileStatisticsProvider } from "@server/infrastructure/ai-explainability-profile-registry/default-explainability-profile-statistics.provider";
import { DefaultExplainabilityProfileValidator } from "@server/infrastructure/ai-explainability-profile-registry/default-explainability-profile.validator";
import { JsonExplainabilityProfileSerializer } from "@server/infrastructure/ai-explainability-profile-registry/json-explainability-profile.serializer";

/** Registers AI Explainability Profile Registry services and use cases. */
export function registerAiExplainabilityProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileRepository,
    () => new ExplainabilityProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileCatalog,
    () => new DefaultExplainabilityProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileValidator,
    () => new DefaultExplainabilityProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileSerializer,
    () => new JsonExplainabilityProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileStatisticsProvider,
    () => new DefaultExplainabilityProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryService,
    (provider) =>
      new AiExplainabilityProfileRegistryService(
        provider.resolve<IExplainabilityProfileRepository>(
          InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileRepository,
        ),
        provider.resolve<IExplainabilityProfileCatalog>(
          InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileCatalog,
        ),
        provider.resolve<IExplainabilityProfileValidator>(
          InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileValidator,
        ),
        provider.resolve<IExplainabilityProfileSerializer>(
          InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileSerializer,
        ),
        provider.resolve<IExplainabilityProfileStatisticsProvider>(
          InfrastructureTokens.AiExplainabilityProfileRegistryExplainabilityProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryRegisterExplainabilityProfileUseCase,
    (provider) =>
      new RegisterExplainabilityProfileUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryGetExplainabilityProfileUseCase,
    (provider) =>
      new GetExplainabilityProfileUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryListExplainabilityProfilesUseCase,
    (provider) =>
      new ListExplainabilityProfilesUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryUpdateExplainabilityProfileUseCase,
    (provider) =>
      new UpdateExplainabilityProfileUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryDeleteExplainabilityProfileUseCase,
    (provider) =>
      new DeleteExplainabilityProfileUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryFindExplainabilityProfileByNameUseCase,
    (provider) =>
      new FindExplainabilityProfileByNameUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryListExplainabilityProfilesByCategoryUseCase,
    (provider) =>
      new ListExplainabilityProfilesByCategoryUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryGetExplainabilityProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetExplainabilityProfileRegistryStatisticsUseCase(
        provider.resolve<AiExplainabilityProfileRegistryService>(
          InfrastructureTokens.AiExplainabilityProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiExplainabilityProfileRegistryApplicationService,
    (provider) =>
      new AiExplainabilityProfileRegistryApplicationService(
        provider.resolve<RegisterExplainabilityProfileUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryRegisterExplainabilityProfileUseCase,
        ),
        provider.resolve<GetExplainabilityProfileUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryGetExplainabilityProfileUseCase,
        ),
        provider.resolve<ListExplainabilityProfilesUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryListExplainabilityProfilesUseCase,
        ),
        provider.resolve<UpdateExplainabilityProfileUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryUpdateExplainabilityProfileUseCase,
        ),
        provider.resolve<DeleteExplainabilityProfileUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryDeleteExplainabilityProfileUseCase,
        ),
        provider.resolve<FindExplainabilityProfileByNameUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryFindExplainabilityProfileByNameUseCase,
        ),
        provider.resolve<ListExplainabilityProfilesByCategoryUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryListExplainabilityProfilesByCategoryUseCase,
        ),
        provider.resolve<GetExplainabilityProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiExplainabilityProfileRegistryGetExplainabilityProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
