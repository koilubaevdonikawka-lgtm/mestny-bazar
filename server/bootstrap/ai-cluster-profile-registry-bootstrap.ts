import type { IClusterProfileCatalog } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-catalog.contract";
import type { IClusterProfileRepository } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-repository.contract";
import type { IClusterProfileSerializer } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-serializer.contract";
import type { IClusterProfileStatisticsProvider } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-statistics-provider.contract";
import type { IClusterProfileValidator } from "@server/application/ai-cluster-profile-registry/contracts/cluster-profile-validator.contract";
import {
  AiClusterProfileRegistryApplicationService,
  AiClusterProfileRegistryService,
  DeleteClusterProfileUseCase,
  FindClusterProfileByNameUseCase,
  GetClusterProfileRegistryStatisticsUseCase,
  GetClusterProfileUseCase,
  ListClusterProfilesByCategoryUseCase,
  ListClusterProfilesUseCase,
  RegisterClusterProfileUseCase,
  UpdateClusterProfileUseCase,
} from "@server/application/ai-cluster-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ClusterProfileRepository } from "@server/infrastructure/ai-cluster-profile-registry/cluster-profile.repository";
import { DefaultClusterProfileCatalog } from "@server/infrastructure/ai-cluster-profile-registry/default-cluster-profile.catalog";
import { DefaultClusterProfileStatisticsProvider } from "@server/infrastructure/ai-cluster-profile-registry/default-cluster-profile-statistics.provider";
import { DefaultClusterProfileValidator } from "@server/infrastructure/ai-cluster-profile-registry/default-cluster-profile.validator";
import { JsonClusterProfileSerializer } from "@server/infrastructure/ai-cluster-profile-registry/json-cluster-profile.serializer";

/** Registers AI Cluster Profile Registry services and use cases. */
export function registerAiClusterProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiClusterProfileRegistryClusterProfileRepository,
    () => new ClusterProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiClusterProfileRegistryClusterProfileCatalog,
    () => new DefaultClusterProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiClusterProfileRegistryClusterProfileValidator,
    () => new DefaultClusterProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiClusterProfileRegistryClusterProfileSerializer,
    () => new JsonClusterProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiClusterProfileRegistryClusterProfileStatisticsProvider,
    () => new DefaultClusterProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryService,
    (provider) =>
      new AiClusterProfileRegistryService(
        provider.resolve<IClusterProfileRepository>(
          InfrastructureTokens.AiClusterProfileRegistryClusterProfileRepository,
        ),
        provider.resolve<IClusterProfileCatalog>(
          InfrastructureTokens.AiClusterProfileRegistryClusterProfileCatalog,
        ),
        provider.resolve<IClusterProfileValidator>(
          InfrastructureTokens.AiClusterProfileRegistryClusterProfileValidator,
        ),
        provider.resolve<IClusterProfileSerializer>(
          InfrastructureTokens.AiClusterProfileRegistryClusterProfileSerializer,
        ),
        provider.resolve<IClusterProfileStatisticsProvider>(
          InfrastructureTokens.AiClusterProfileRegistryClusterProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryRegisterClusterProfileUseCase,
    (provider) =>
      new RegisterClusterProfileUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryGetClusterProfileUseCase,
    (provider) =>
      new GetClusterProfileUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryListClusterProfilesUseCase,
    (provider) =>
      new ListClusterProfilesUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryUpdateClusterProfileUseCase,
    (provider) =>
      new UpdateClusterProfileUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryDeleteClusterProfileUseCase,
    (provider) =>
      new DeleteClusterProfileUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryFindClusterProfileByNameUseCase,
    (provider) =>
      new FindClusterProfileByNameUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryListClusterProfilesByCategoryUseCase,
    (provider) =>
      new ListClusterProfilesByCategoryUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryGetClusterProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetClusterProfileRegistryStatisticsUseCase(
        provider.resolve<AiClusterProfileRegistryService>(
          InfrastructureTokens.AiClusterProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiClusterProfileRegistryApplicationService,
    (provider) =>
      new AiClusterProfileRegistryApplicationService(
        provider.resolve<RegisterClusterProfileUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryRegisterClusterProfileUseCase,
        ),
        provider.resolve<GetClusterProfileUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryGetClusterProfileUseCase,
        ),
        provider.resolve<ListClusterProfilesUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryListClusterProfilesUseCase,
        ),
        provider.resolve<UpdateClusterProfileUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryUpdateClusterProfileUseCase,
        ),
        provider.resolve<DeleteClusterProfileUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryDeleteClusterProfileUseCase,
        ),
        provider.resolve<FindClusterProfileByNameUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryFindClusterProfileByNameUseCase,
        ),
        provider.resolve<ListClusterProfilesByCategoryUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryListClusterProfilesByCategoryUseCase,
        ),
        provider.resolve<GetClusterProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiClusterProfileRegistryGetClusterProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
