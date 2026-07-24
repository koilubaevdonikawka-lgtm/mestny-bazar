import type { IResourceProfileCatalog } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-catalog.contract";
import type { IResourceProfileRepository } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-repository.contract";
import type { IResourceProfileSerializer } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-serializer.contract";
import type { IResourceProfileStatisticsProvider } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-statistics-provider.contract";
import type { IResourceProfileValidator } from "@server/application/ai-resource-profile-registry/contracts/resource-profile-validator.contract";
import {
  AiResourceProfileRegistryApplicationService,
  AiResourceProfileRegistryService,
  DeleteResourceProfileUseCase,
  FindResourceProfileByNameUseCase,
  GetResourceProfileRegistryStatisticsUseCase,
  GetResourceProfileUseCase,
  ListResourceProfilesByCategoryUseCase,
  ListResourceProfilesUseCase,
  RegisterResourceProfileUseCase,
  UpdateResourceProfileUseCase,
} from "@server/application/ai-resource-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ResourceProfileRepository } from "@server/infrastructure/ai-resource-profile-registry/resource-profile.repository";
import { DefaultResourceProfileCatalog } from "@server/infrastructure/ai-resource-profile-registry/default-resource-profile.catalog";
import { DefaultResourceProfileStatisticsProvider } from "@server/infrastructure/ai-resource-profile-registry/default-resource-profile-statistics.provider";
import { DefaultResourceProfileValidator } from "@server/infrastructure/ai-resource-profile-registry/default-resource-profile.validator";
import { JsonResourceProfileSerializer } from "@server/infrastructure/ai-resource-profile-registry/json-resource-profile.serializer";

/** Registers AI Resource Profile Registry services and use cases. */
export function registerAiResourceProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiResourceProfileRegistryResourceProfileRepository,
    () => new ResourceProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceProfileRegistryResourceProfileCatalog,
    () => new DefaultResourceProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceProfileRegistryResourceProfileValidator,
    () => new DefaultResourceProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceProfileRegistryResourceProfileSerializer,
    () => new JsonResourceProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiResourceProfileRegistryResourceProfileStatisticsProvider,
    () => new DefaultResourceProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryService,
    (provider) =>
      new AiResourceProfileRegistryService(
        provider.resolve<IResourceProfileRepository>(
          InfrastructureTokens.AiResourceProfileRegistryResourceProfileRepository,
        ),
        provider.resolve<IResourceProfileCatalog>(
          InfrastructureTokens.AiResourceProfileRegistryResourceProfileCatalog,
        ),
        provider.resolve<IResourceProfileValidator>(
          InfrastructureTokens.AiResourceProfileRegistryResourceProfileValidator,
        ),
        provider.resolve<IResourceProfileSerializer>(
          InfrastructureTokens.AiResourceProfileRegistryResourceProfileSerializer,
        ),
        provider.resolve<IResourceProfileStatisticsProvider>(
          InfrastructureTokens.AiResourceProfileRegistryResourceProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryRegisterResourceProfileUseCase,
    (provider) =>
      new RegisterResourceProfileUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryGetResourceProfileUseCase,
    (provider) =>
      new GetResourceProfileUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryListResourceProfilesUseCase,
    (provider) =>
      new ListResourceProfilesUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryUpdateResourceProfileUseCase,
    (provider) =>
      new UpdateResourceProfileUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryDeleteResourceProfileUseCase,
    (provider) =>
      new DeleteResourceProfileUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryFindResourceProfileByNameUseCase,
    (provider) =>
      new FindResourceProfileByNameUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryListResourceProfilesByCategoryUseCase,
    (provider) =>
      new ListResourceProfilesByCategoryUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryGetResourceProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetResourceProfileRegistryStatisticsUseCase(
        provider.resolve<AiResourceProfileRegistryService>(
          InfrastructureTokens.AiResourceProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiResourceProfileRegistryApplicationService,
    (provider) =>
      new AiResourceProfileRegistryApplicationService(
        provider.resolve<RegisterResourceProfileUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryRegisterResourceProfileUseCase,
        ),
        provider.resolve<GetResourceProfileUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryGetResourceProfileUseCase,
        ),
        provider.resolve<ListResourceProfilesUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryListResourceProfilesUseCase,
        ),
        provider.resolve<UpdateResourceProfileUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryUpdateResourceProfileUseCase,
        ),
        provider.resolve<DeleteResourceProfileUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryDeleteResourceProfileUseCase,
        ),
        provider.resolve<FindResourceProfileByNameUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryFindResourceProfileByNameUseCase,
        ),
        provider.resolve<ListResourceProfilesByCategoryUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryListResourceProfilesByCategoryUseCase,
        ),
        provider.resolve<GetResourceProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiResourceProfileRegistryGetResourceProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
