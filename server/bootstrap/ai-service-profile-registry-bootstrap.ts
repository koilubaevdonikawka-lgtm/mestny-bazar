import type { IServiceProfileCatalog } from "@server/application/ai-service-profile-registry/contracts/service-profile-catalog.contract";
import type { IServiceProfileRepository } from "@server/application/ai-service-profile-registry/contracts/service-profile-repository.contract";
import type { IServiceProfileSerializer } from "@server/application/ai-service-profile-registry/contracts/service-profile-serializer.contract";
import type { IServiceProfileStatisticsProvider } from "@server/application/ai-service-profile-registry/contracts/service-profile-statistics-provider.contract";
import type { IServiceProfileValidator } from "@server/application/ai-service-profile-registry/contracts/service-profile-validator.contract";
import {
  AiServiceProfileRegistryApplicationService,
  AiServiceProfileRegistryService,
  DeleteServiceProfileUseCase,
  FindServiceProfileByNameUseCase,
  GetServiceProfileRegistryStatisticsUseCase,
  GetServiceProfileUseCase,
  ListServiceProfilesByCategoryUseCase,
  ListServiceProfilesUseCase,
  RegisterServiceProfileUseCase,
  UpdateServiceProfileUseCase,
} from "@server/application/ai-service-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ServiceProfileRepository } from "@server/infrastructure/ai-service-profile-registry/service-profile.repository";
import { DefaultServiceProfileCatalog } from "@server/infrastructure/ai-service-profile-registry/default-service-profile.catalog";
import { DefaultServiceProfileStatisticsProvider } from "@server/infrastructure/ai-service-profile-registry/default-service-profile-statistics.provider";
import { DefaultServiceProfileValidator } from "@server/infrastructure/ai-service-profile-registry/default-service-profile.validator";
import { JsonServiceProfileSerializer } from "@server/infrastructure/ai-service-profile-registry/json-service-profile.serializer";

/** Registers AI Service Profile Registry services and use cases. */
export function registerAiServiceProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiServiceProfileRegistryServiceProfileRepository,
    () => new ServiceProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiServiceProfileRegistryServiceProfileCatalog,
    () => new DefaultServiceProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiServiceProfileRegistryServiceProfileValidator,
    () => new DefaultServiceProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiServiceProfileRegistryServiceProfileSerializer,
    () => new JsonServiceProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiServiceProfileRegistryServiceProfileStatisticsProvider,
    () => new DefaultServiceProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryService,
    (provider) =>
      new AiServiceProfileRegistryService(
        provider.resolve<IServiceProfileRepository>(
          InfrastructureTokens.AiServiceProfileRegistryServiceProfileRepository,
        ),
        provider.resolve<IServiceProfileCatalog>(
          InfrastructureTokens.AiServiceProfileRegistryServiceProfileCatalog,
        ),
        provider.resolve<IServiceProfileValidator>(
          InfrastructureTokens.AiServiceProfileRegistryServiceProfileValidator,
        ),
        provider.resolve<IServiceProfileSerializer>(
          InfrastructureTokens.AiServiceProfileRegistryServiceProfileSerializer,
        ),
        provider.resolve<IServiceProfileStatisticsProvider>(
          InfrastructureTokens.AiServiceProfileRegistryServiceProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryRegisterServiceProfileUseCase,
    (provider) =>
      new RegisterServiceProfileUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryGetServiceProfileUseCase,
    (provider) =>
      new GetServiceProfileUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryListServiceProfilesUseCase,
    (provider) =>
      new ListServiceProfilesUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryUpdateServiceProfileUseCase,
    (provider) =>
      new UpdateServiceProfileUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryDeleteServiceProfileUseCase,
    (provider) =>
      new DeleteServiceProfileUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryFindServiceProfileByNameUseCase,
    (provider) =>
      new FindServiceProfileByNameUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryListServiceProfilesByCategoryUseCase,
    (provider) =>
      new ListServiceProfilesByCategoryUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryGetServiceProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetServiceProfileRegistryStatisticsUseCase(
        provider.resolve<AiServiceProfileRegistryService>(
          InfrastructureTokens.AiServiceProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiServiceProfileRegistryApplicationService,
    (provider) =>
      new AiServiceProfileRegistryApplicationService(
        provider.resolve<RegisterServiceProfileUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryRegisterServiceProfileUseCase,
        ),
        provider.resolve<GetServiceProfileUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryGetServiceProfileUseCase,
        ),
        provider.resolve<ListServiceProfilesUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryListServiceProfilesUseCase,
        ),
        provider.resolve<UpdateServiceProfileUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryUpdateServiceProfileUseCase,
        ),
        provider.resolve<DeleteServiceProfileUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryDeleteServiceProfileUseCase,
        ),
        provider.resolve<FindServiceProfileByNameUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryFindServiceProfileByNameUseCase,
        ),
        provider.resolve<ListServiceProfilesByCategoryUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryListServiceProfilesByCategoryUseCase,
        ),
        provider.resolve<GetServiceProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiServiceProfileRegistryGetServiceProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
