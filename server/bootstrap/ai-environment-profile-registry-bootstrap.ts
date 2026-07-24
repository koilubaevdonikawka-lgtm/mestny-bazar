import type { IEnvironmentProfileCatalog } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-catalog.contract";
import type { IEnvironmentProfileRepository } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-repository.contract";
import type { IEnvironmentProfileSerializer } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-serializer.contract";
import type { IEnvironmentProfileStatisticsProvider } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-statistics-provider.contract";
import type { IEnvironmentProfileValidator } from "@server/application/ai-environment-profile-registry/contracts/environment-profile-validator.contract";
import {
  AiEnvironmentProfileRegistryApplicationService,
  AiEnvironmentProfileRegistryService,
  DeleteEnvironmentProfileUseCase,
  FindEnvironmentProfileByNameUseCase,
  GetEnvironmentProfileRegistryStatisticsUseCase,
  GetEnvironmentProfileUseCase,
  ListEnvironmentProfilesByCategoryUseCase,
  ListEnvironmentProfilesUseCase,
  RegisterEnvironmentProfileUseCase,
  UpdateEnvironmentProfileUseCase,
} from "@server/application/ai-environment-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { EnvironmentProfileRepository } from "@server/infrastructure/ai-environment-profile-registry/environment-profile.repository";
import { DefaultEnvironmentProfileCatalog } from "@server/infrastructure/ai-environment-profile-registry/default-environment-profile.catalog";
import { DefaultEnvironmentProfileStatisticsProvider } from "@server/infrastructure/ai-environment-profile-registry/default-environment-profile-statistics.provider";
import { DefaultEnvironmentProfileValidator } from "@server/infrastructure/ai-environment-profile-registry/default-environment-profile.validator";
import { JsonEnvironmentProfileSerializer } from "@server/infrastructure/ai-environment-profile-registry/json-environment-profile.serializer";

/** Registers AI Environment Profile Registry services and use cases. */
export function registerAiEnvironmentProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileRepository,
    () => new EnvironmentProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileCatalog,
    () => new DefaultEnvironmentProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileValidator,
    () => new DefaultEnvironmentProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileSerializer,
    () => new JsonEnvironmentProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileStatisticsProvider,
    () => new DefaultEnvironmentProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryService,
    (provider) =>
      new AiEnvironmentProfileRegistryService(
        provider.resolve<IEnvironmentProfileRepository>(
          InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileRepository,
        ),
        provider.resolve<IEnvironmentProfileCatalog>(
          InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileCatalog,
        ),
        provider.resolve<IEnvironmentProfileValidator>(
          InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileValidator,
        ),
        provider.resolve<IEnvironmentProfileSerializer>(
          InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileSerializer,
        ),
        provider.resolve<IEnvironmentProfileStatisticsProvider>(
          InfrastructureTokens.AiEnvironmentProfileRegistryEnvironmentProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryRegisterEnvironmentProfileUseCase,
    (provider) =>
      new RegisterEnvironmentProfileUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryGetEnvironmentProfileUseCase,
    (provider) =>
      new GetEnvironmentProfileUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryListEnvironmentProfilesUseCase,
    (provider) =>
      new ListEnvironmentProfilesUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryUpdateEnvironmentProfileUseCase,
    (provider) =>
      new UpdateEnvironmentProfileUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryDeleteEnvironmentProfileUseCase,
    (provider) =>
      new DeleteEnvironmentProfileUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryFindEnvironmentProfileByNameUseCase,
    (provider) =>
      new FindEnvironmentProfileByNameUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryListEnvironmentProfilesByCategoryUseCase,
    (provider) =>
      new ListEnvironmentProfilesByCategoryUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryGetEnvironmentProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetEnvironmentProfileRegistryStatisticsUseCase(
        provider.resolve<AiEnvironmentProfileRegistryService>(
          InfrastructureTokens.AiEnvironmentProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEnvironmentProfileRegistryApplicationService,
    (provider) =>
      new AiEnvironmentProfileRegistryApplicationService(
        provider.resolve<RegisterEnvironmentProfileUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryRegisterEnvironmentProfileUseCase,
        ),
        provider.resolve<GetEnvironmentProfileUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryGetEnvironmentProfileUseCase,
        ),
        provider.resolve<ListEnvironmentProfilesUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryListEnvironmentProfilesUseCase,
        ),
        provider.resolve<UpdateEnvironmentProfileUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryUpdateEnvironmentProfileUseCase,
        ),
        provider.resolve<DeleteEnvironmentProfileUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryDeleteEnvironmentProfileUseCase,
        ),
        provider.resolve<FindEnvironmentProfileByNameUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryFindEnvironmentProfileByNameUseCase,
        ),
        provider.resolve<ListEnvironmentProfilesByCategoryUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryListEnvironmentProfilesByCategoryUseCase,
        ),
        provider.resolve<GetEnvironmentProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiEnvironmentProfileRegistryGetEnvironmentProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
