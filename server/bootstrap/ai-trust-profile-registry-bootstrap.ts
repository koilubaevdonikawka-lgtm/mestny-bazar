import type { ITrustProfileCatalog } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-catalog.contract";
import type { ITrustProfileRepository } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-repository.contract";
import type { ITrustProfileSerializer } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-serializer.contract";
import type { ITrustProfileStatisticsProvider } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-statistics-provider.contract";
import type { ITrustProfileValidator } from "@server/application/ai-trust-profile-registry/contracts/trust-profile-validator.contract";
import {
  AiTrustProfileRegistryApplicationService,
  AiTrustProfileRegistryService,
  DeleteTrustProfileUseCase,
  FindTrustProfileByNameUseCase,
  GetTrustProfileRegistryStatisticsUseCase,
  GetTrustProfileUseCase,
  ListTrustProfilesByCategoryUseCase,
  ListTrustProfilesUseCase,
  RegisterTrustProfileUseCase,
  UpdateTrustProfileUseCase,
} from "@server/application/ai-trust-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { TrustProfileRepository } from "@server/infrastructure/ai-trust-profile-registry/trust-profile.repository";
import { DefaultTrustProfileCatalog } from "@server/infrastructure/ai-trust-profile-registry/default-trust-profile.catalog";
import { DefaultTrustProfileStatisticsProvider } from "@server/infrastructure/ai-trust-profile-registry/default-trust-profile-statistics.provider";
import { DefaultTrustProfileValidator } from "@server/infrastructure/ai-trust-profile-registry/default-trust-profile.validator";
import { JsonTrustProfileSerializer } from "@server/infrastructure/ai-trust-profile-registry/json-trust-profile.serializer";

/** Registers AI Trust Profile Registry services and use cases. */
export function registerAiTrustProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiTrustProfileRegistryTrustProfileRepository,
    () => new TrustProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTrustProfileRegistryTrustProfileCatalog,
    () => new DefaultTrustProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTrustProfileRegistryTrustProfileValidator,
    () => new DefaultTrustProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTrustProfileRegistryTrustProfileSerializer,
    () => new JsonTrustProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiTrustProfileRegistryTrustProfileStatisticsProvider,
    () => new DefaultTrustProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryService,
    (provider) =>
      new AiTrustProfileRegistryService(
        provider.resolve<ITrustProfileRepository>(
          InfrastructureTokens.AiTrustProfileRegistryTrustProfileRepository,
        ),
        provider.resolve<ITrustProfileCatalog>(
          InfrastructureTokens.AiTrustProfileRegistryTrustProfileCatalog,
        ),
        provider.resolve<ITrustProfileValidator>(
          InfrastructureTokens.AiTrustProfileRegistryTrustProfileValidator,
        ),
        provider.resolve<ITrustProfileSerializer>(
          InfrastructureTokens.AiTrustProfileRegistryTrustProfileSerializer,
        ),
        provider.resolve<ITrustProfileStatisticsProvider>(
          InfrastructureTokens.AiTrustProfileRegistryTrustProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryRegisterTrustProfileUseCase,
    (provider) =>
      new RegisterTrustProfileUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryGetTrustProfileUseCase,
    (provider) =>
      new GetTrustProfileUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryListTrustProfilesUseCase,
    (provider) =>
      new ListTrustProfilesUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryUpdateTrustProfileUseCase,
    (provider) =>
      new UpdateTrustProfileUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryDeleteTrustProfileUseCase,
    (provider) =>
      new DeleteTrustProfileUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryFindTrustProfileByNameUseCase,
    (provider) =>
      new FindTrustProfileByNameUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryListTrustProfilesByCategoryUseCase,
    (provider) =>
      new ListTrustProfilesByCategoryUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryGetTrustProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetTrustProfileRegistryStatisticsUseCase(
        provider.resolve<AiTrustProfileRegistryService>(
          InfrastructureTokens.AiTrustProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiTrustProfileRegistryApplicationService,
    (provider) =>
      new AiTrustProfileRegistryApplicationService(
        provider.resolve<RegisterTrustProfileUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryRegisterTrustProfileUseCase,
        ),
        provider.resolve<GetTrustProfileUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryGetTrustProfileUseCase,
        ),
        provider.resolve<ListTrustProfilesUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryListTrustProfilesUseCase,
        ),
        provider.resolve<UpdateTrustProfileUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryUpdateTrustProfileUseCase,
        ),
        provider.resolve<DeleteTrustProfileUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryDeleteTrustProfileUseCase,
        ),
        provider.resolve<FindTrustProfileByNameUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryFindTrustProfileByNameUseCase,
        ),
        provider.resolve<ListTrustProfilesByCategoryUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryListTrustProfilesByCategoryUseCase,
        ),
        provider.resolve<GetTrustProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiTrustProfileRegistryGetTrustProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
