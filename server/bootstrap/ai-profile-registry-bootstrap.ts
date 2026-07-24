import type { IProfileCatalog } from "@server/application/ai-profile-registry/contracts/profile-catalog.contract";
import type { IProfileRepository } from "@server/application/ai-profile-registry/contracts/profile-repository.contract";
import type { IProfileSerializer } from "@server/application/ai-profile-registry/contracts/profile-serializer.contract";
import type { IProfileStatisticsProvider } from "@server/application/ai-profile-registry/contracts/profile-statistics-provider.contract";
import type { IProfileValidator } from "@server/application/ai-profile-registry/contracts/profile-validator.contract";
import {
  AiProfileRegistryApplicationService,
  AiProfileRegistryService,
  DeleteProfileUseCase,
  FindProfileByNameUseCase,
  GetProfileRegistryStatisticsUseCase,
  GetProfileUseCase,
  ListProfilesByTypeUseCase,
  ListProfilesUseCase,
  RegisterProfileUseCase,
  UpdateProfileUseCase,
} from "@server/application/ai-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ProfileRepository } from "@server/infrastructure/ai-profile-registry/profile.repository";
import { DefaultProfileCatalog } from "@server/infrastructure/ai-profile-registry/default-profile.catalog";
import { DefaultProfileStatisticsProvider } from "@server/infrastructure/ai-profile-registry/default-profile-statistics.provider";
import { DefaultProfileValidator } from "@server/infrastructure/ai-profile-registry/default-profile.validator";
import { JsonProfileSerializer } from "@server/infrastructure/ai-profile-registry/json-profile.serializer";

/** Registers AI Profile Registry services and use cases. */
export function registerAiProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiProfileRegistryProfileRepository,
    () => new ProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProfileRegistryProfileCatalog,
    () => new DefaultProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProfileRegistryProfileValidator,
    () => new DefaultProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProfileRegistryProfileSerializer,
    () => new JsonProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiProfileRegistryProfileStatisticsProvider,
    () => new DefaultProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryService,
    (provider) =>
      new AiProfileRegistryService(
        provider.resolve<IProfileRepository>(
          InfrastructureTokens.AiProfileRegistryProfileRepository,
        ),
        provider.resolve<IProfileCatalog>(
          InfrastructureTokens.AiProfileRegistryProfileCatalog,
        ),
        provider.resolve<IProfileValidator>(
          InfrastructureTokens.AiProfileRegistryProfileValidator,
        ),
        provider.resolve<IProfileSerializer>(
          InfrastructureTokens.AiProfileRegistryProfileSerializer,
        ),
        provider.resolve<IProfileStatisticsProvider>(
          InfrastructureTokens.AiProfileRegistryProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryRegisterProfileUseCase,
    (provider) =>
      new RegisterProfileUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryGetProfileUseCase,
    (provider) =>
      new GetProfileUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryListProfilesUseCase,
    (provider) =>
      new ListProfilesUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryUpdateProfileUseCase,
    (provider) =>
      new UpdateProfileUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryDeleteProfileUseCase,
    (provider) =>
      new DeleteProfileUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryFindProfileByNameUseCase,
    (provider) =>
      new FindProfileByNameUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryListProfilesByTypeUseCase,
    (provider) =>
      new ListProfilesByTypeUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryGetProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetProfileRegistryStatisticsUseCase(
        provider.resolve<AiProfileRegistryService>(
          InfrastructureTokens.AiProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiProfileRegistryApplicationService,
    (provider) =>
      new AiProfileRegistryApplicationService(
        provider.resolve<RegisterProfileUseCase>(
          InfrastructureTokens.AiProfileRegistryRegisterProfileUseCase,
        ),
        provider.resolve<GetProfileUseCase>(
          InfrastructureTokens.AiProfileRegistryGetProfileUseCase,
        ),
        provider.resolve<ListProfilesUseCase>(
          InfrastructureTokens.AiProfileRegistryListProfilesUseCase,
        ),
        provider.resolve<UpdateProfileUseCase>(
          InfrastructureTokens.AiProfileRegistryUpdateProfileUseCase,
        ),
        provider.resolve<DeleteProfileUseCase>(
          InfrastructureTokens.AiProfileRegistryDeleteProfileUseCase,
        ),
        provider.resolve<FindProfileByNameUseCase>(
          InfrastructureTokens.AiProfileRegistryFindProfileByNameUseCase,
        ),
        provider.resolve<ListProfilesByTypeUseCase>(
          InfrastructureTokens.AiProfileRegistryListProfilesByTypeUseCase,
        ),
        provider.resolve<GetProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiProfileRegistryGetProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
