import type { IPrivacyProfileCatalog } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-catalog.contract";
import type { IPrivacyProfileRepository } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-repository.contract";
import type { IPrivacyProfileSerializer } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-serializer.contract";
import type { IPrivacyProfileStatisticsProvider } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-statistics-provider.contract";
import type { IPrivacyProfileValidator } from "@server/application/ai-privacy-profile-registry/contracts/privacy-profile-validator.contract";
import {
  AiPrivacyProfileRegistryApplicationService,
  AiPrivacyProfileRegistryService,
  DeletePrivacyProfileUseCase,
  FindPrivacyProfileByNameUseCase,
  GetPrivacyProfileRegistryStatisticsUseCase,
  GetPrivacyProfileUseCase,
  ListPrivacyProfilesByCategoryUseCase,
  ListPrivacyProfilesUseCase,
  RegisterPrivacyProfileUseCase,
  UpdatePrivacyProfileUseCase,
} from "@server/application/ai-privacy-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { PrivacyProfileRepository } from "@server/infrastructure/ai-privacy-profile-registry/privacy-profile.repository";
import { DefaultPrivacyProfileCatalog } from "@server/infrastructure/ai-privacy-profile-registry/default-privacy-profile.catalog";
import { DefaultPrivacyProfileStatisticsProvider } from "@server/infrastructure/ai-privacy-profile-registry/default-privacy-profile-statistics.provider";
import { DefaultPrivacyProfileValidator } from "@server/infrastructure/ai-privacy-profile-registry/default-privacy-profile.validator";
import { JsonPrivacyProfileSerializer } from "@server/infrastructure/ai-privacy-profile-registry/json-privacy-profile.serializer";

/** Registers AI Privacy Profile Registry services and use cases. */
export function registerAiPrivacyProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileRepository,
    () => new PrivacyProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileCatalog,
    () => new DefaultPrivacyProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileValidator,
    () => new DefaultPrivacyProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileSerializer,
    () => new JsonPrivacyProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileStatisticsProvider,
    () => new DefaultPrivacyProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryService,
    (provider) =>
      new AiPrivacyProfileRegistryService(
        provider.resolve<IPrivacyProfileRepository>(
          InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileRepository,
        ),
        provider.resolve<IPrivacyProfileCatalog>(
          InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileCatalog,
        ),
        provider.resolve<IPrivacyProfileValidator>(
          InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileValidator,
        ),
        provider.resolve<IPrivacyProfileSerializer>(
          InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileSerializer,
        ),
        provider.resolve<IPrivacyProfileStatisticsProvider>(
          InfrastructureTokens.AiPrivacyProfileRegistryPrivacyProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryRegisterPrivacyProfileUseCase,
    (provider) =>
      new RegisterPrivacyProfileUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryGetPrivacyProfileUseCase,
    (provider) =>
      new GetPrivacyProfileUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryListPrivacyProfilesUseCase,
    (provider) =>
      new ListPrivacyProfilesUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryUpdatePrivacyProfileUseCase,
    (provider) =>
      new UpdatePrivacyProfileUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryDeletePrivacyProfileUseCase,
    (provider) =>
      new DeletePrivacyProfileUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryFindPrivacyProfileByNameUseCase,
    (provider) =>
      new FindPrivacyProfileByNameUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryListPrivacyProfilesByCategoryUseCase,
    (provider) =>
      new ListPrivacyProfilesByCategoryUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryGetPrivacyProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetPrivacyProfileRegistryStatisticsUseCase(
        provider.resolve<AiPrivacyProfileRegistryService>(
          InfrastructureTokens.AiPrivacyProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPrivacyProfileRegistryApplicationService,
    (provider) =>
      new AiPrivacyProfileRegistryApplicationService(
        provider.resolve<RegisterPrivacyProfileUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryRegisterPrivacyProfileUseCase,
        ),
        provider.resolve<GetPrivacyProfileUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryGetPrivacyProfileUseCase,
        ),
        provider.resolve<ListPrivacyProfilesUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryListPrivacyProfilesUseCase,
        ),
        provider.resolve<UpdatePrivacyProfileUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryUpdatePrivacyProfileUseCase,
        ),
        provider.resolve<DeletePrivacyProfileUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryDeletePrivacyProfileUseCase,
        ),
        provider.resolve<FindPrivacyProfileByNameUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryFindPrivacyProfileByNameUseCase,
        ),
        provider.resolve<ListPrivacyProfilesByCategoryUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryListPrivacyProfilesByCategoryUseCase,
        ),
        provider.resolve<GetPrivacyProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPrivacyProfileRegistryGetPrivacyProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
