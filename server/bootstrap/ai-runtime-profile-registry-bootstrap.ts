import type { IRuntimeProfileCatalog } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-catalog.contract";
import type { IRuntimeProfileRepository } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-repository.contract";
import type { IRuntimeProfileSerializer } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-serializer.contract";
import type { IRuntimeProfileStatisticsProvider } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-statistics-provider.contract";
import type { IRuntimeProfileValidator } from "@server/application/ai-runtime-profile-registry/contracts/runtime-profile-validator.contract";
import {
  AiRuntimeProfileRegistryApplicationService,
  AiRuntimeProfileRegistryService,
  DeleteRuntimeProfileUseCase,
  FindRuntimeProfileByNameUseCase,
  GetRuntimeProfileRegistryStatisticsUseCase,
  GetRuntimeProfileUseCase,
  ListRuntimeProfilesByCategoryUseCase,
  ListRuntimeProfilesUseCase,
  RegisterRuntimeProfileUseCase,
  UpdateRuntimeProfileUseCase,
} from "@server/application/ai-runtime-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { RuntimeProfileRepository } from "@server/infrastructure/ai-runtime-profile-registry/runtime-profile.repository";
import { DefaultRuntimeProfileCatalog } from "@server/infrastructure/ai-runtime-profile-registry/default-runtime-profile.catalog";
import { DefaultRuntimeProfileStatisticsProvider } from "@server/infrastructure/ai-runtime-profile-registry/default-runtime-profile-statistics.provider";
import { DefaultRuntimeProfileValidator } from "@server/infrastructure/ai-runtime-profile-registry/default-runtime-profile.validator";
import { JsonRuntimeProfileSerializer } from "@server/infrastructure/ai-runtime-profile-registry/json-runtime-profile.serializer";

/** Registers AI Runtime Profile Registry services and use cases. */
export function registerAiRuntimeProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileRepository,
    () => new RuntimeProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileCatalog,
    () => new DefaultRuntimeProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileValidator,
    () => new DefaultRuntimeProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileSerializer,
    () => new JsonRuntimeProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileStatisticsProvider,
    () => new DefaultRuntimeProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryService,
    (provider) =>
      new AiRuntimeProfileRegistryService(
        provider.resolve<IRuntimeProfileRepository>(
          InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileRepository,
        ),
        provider.resolve<IRuntimeProfileCatalog>(
          InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileCatalog,
        ),
        provider.resolve<IRuntimeProfileValidator>(
          InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileValidator,
        ),
        provider.resolve<IRuntimeProfileSerializer>(
          InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileSerializer,
        ),
        provider.resolve<IRuntimeProfileStatisticsProvider>(
          InfrastructureTokens.AiRuntimeProfileRegistryRuntimeProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryRegisterRuntimeProfileUseCase,
    (provider) =>
      new RegisterRuntimeProfileUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryGetRuntimeProfileUseCase,
    (provider) =>
      new GetRuntimeProfileUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryListRuntimeProfilesUseCase,
    (provider) =>
      new ListRuntimeProfilesUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryUpdateRuntimeProfileUseCase,
    (provider) =>
      new UpdateRuntimeProfileUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryDeleteRuntimeProfileUseCase,
    (provider) =>
      new DeleteRuntimeProfileUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryFindRuntimeProfileByNameUseCase,
    (provider) =>
      new FindRuntimeProfileByNameUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryListRuntimeProfilesByCategoryUseCase,
    (provider) =>
      new ListRuntimeProfilesByCategoryUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryGetRuntimeProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetRuntimeProfileRegistryStatisticsUseCase(
        provider.resolve<AiRuntimeProfileRegistryService>(
          InfrastructureTokens.AiRuntimeProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRuntimeProfileRegistryApplicationService,
    (provider) =>
      new AiRuntimeProfileRegistryApplicationService(
        provider.resolve<RegisterRuntimeProfileUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryRegisterRuntimeProfileUseCase,
        ),
        provider.resolve<GetRuntimeProfileUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryGetRuntimeProfileUseCase,
        ),
        provider.resolve<ListRuntimeProfilesUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryListRuntimeProfilesUseCase,
        ),
        provider.resolve<UpdateRuntimeProfileUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryUpdateRuntimeProfileUseCase,
        ),
        provider.resolve<DeleteRuntimeProfileUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryDeleteRuntimeProfileUseCase,
        ),
        provider.resolve<FindRuntimeProfileByNameUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryFindRuntimeProfileByNameUseCase,
        ),
        provider.resolve<ListRuntimeProfilesByCategoryUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryListRuntimeProfilesByCategoryUseCase,
        ),
        provider.resolve<GetRuntimeProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiRuntimeProfileRegistryGetRuntimeProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
