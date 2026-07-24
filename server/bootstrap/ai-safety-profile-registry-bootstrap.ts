import type { ISafetyProfileCatalog } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-catalog.contract";
import type { ISafetyProfileRepository } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-repository.contract";
import type { ISafetyProfileSerializer } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-serializer.contract";
import type { ISafetyProfileStatisticsProvider } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-statistics-provider.contract";
import type { ISafetyProfileValidator } from "@server/application/ai-safety-profile-registry/contracts/safety-profile-validator.contract";
import {
  AiSafetyProfileRegistryApplicationService,
  AiSafetyProfileRegistryService,
  DeleteSafetyProfileUseCase,
  FindSafetyProfileByNameUseCase,
  GetSafetyProfileRegistryStatisticsUseCase,
  GetSafetyProfileUseCase,
  ListSafetyProfilesByCategoryUseCase,
  ListSafetyProfilesUseCase,
  RegisterSafetyProfileUseCase,
  UpdateSafetyProfileUseCase,
} from "@server/application/ai-safety-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { SafetyProfileRepository } from "@server/infrastructure/ai-safety-profile-registry/safety-profile.repository";
import { DefaultSafetyProfileCatalog } from "@server/infrastructure/ai-safety-profile-registry/default-safety-profile.catalog";
import { DefaultSafetyProfileStatisticsProvider } from "@server/infrastructure/ai-safety-profile-registry/default-safety-profile-statistics.provider";
import { DefaultSafetyProfileValidator } from "@server/infrastructure/ai-safety-profile-registry/default-safety-profile.validator";
import { JsonSafetyProfileSerializer } from "@server/infrastructure/ai-safety-profile-registry/json-safety-profile.serializer";

/** Registers AI Safety Profile Registry services and use cases. */
export function registerAiSafetyProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileRepository,
    () => new SafetyProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileCatalog,
    () => new DefaultSafetyProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileValidator,
    () => new DefaultSafetyProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileSerializer,
    () => new JsonSafetyProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileStatisticsProvider,
    () => new DefaultSafetyProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryService,
    (provider) =>
      new AiSafetyProfileRegistryService(
        provider.resolve<ISafetyProfileRepository>(
          InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileRepository,
        ),
        provider.resolve<ISafetyProfileCatalog>(
          InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileCatalog,
        ),
        provider.resolve<ISafetyProfileValidator>(
          InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileValidator,
        ),
        provider.resolve<ISafetyProfileSerializer>(
          InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileSerializer,
        ),
        provider.resolve<ISafetyProfileStatisticsProvider>(
          InfrastructureTokens.AiSafetyProfileRegistrySafetyProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryRegisterSafetyProfileUseCase,
    (provider) =>
      new RegisterSafetyProfileUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryGetSafetyProfileUseCase,
    (provider) =>
      new GetSafetyProfileUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryListSafetyProfilesUseCase,
    (provider) =>
      new ListSafetyProfilesUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryUpdateSafetyProfileUseCase,
    (provider) =>
      new UpdateSafetyProfileUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryDeleteSafetyProfileUseCase,
    (provider) =>
      new DeleteSafetyProfileUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryFindSafetyProfileByNameUseCase,
    (provider) =>
      new FindSafetyProfileByNameUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryListSafetyProfilesByCategoryUseCase,
    (provider) =>
      new ListSafetyProfilesByCategoryUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryGetSafetyProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetSafetyProfileRegistryStatisticsUseCase(
        provider.resolve<AiSafetyProfileRegistryService>(
          InfrastructureTokens.AiSafetyProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSafetyProfileRegistryApplicationService,
    (provider) =>
      new AiSafetyProfileRegistryApplicationService(
        provider.resolve<RegisterSafetyProfileUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryRegisterSafetyProfileUseCase,
        ),
        provider.resolve<GetSafetyProfileUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryGetSafetyProfileUseCase,
        ),
        provider.resolve<ListSafetyProfilesUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryListSafetyProfilesUseCase,
        ),
        provider.resolve<UpdateSafetyProfileUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryUpdateSafetyProfileUseCase,
        ),
        provider.resolve<DeleteSafetyProfileUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryDeleteSafetyProfileUseCase,
        ),
        provider.resolve<FindSafetyProfileByNameUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryFindSafetyProfileByNameUseCase,
        ),
        provider.resolve<ListSafetyProfilesByCategoryUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryListSafetyProfilesByCategoryUseCase,
        ),
        provider.resolve<GetSafetyProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiSafetyProfileRegistryGetSafetyProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
