import type { IComputeProfileCatalog } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-catalog.contract";
import type { IComputeProfileRepository } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-repository.contract";
import type { IComputeProfileSerializer } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-serializer.contract";
import type { IComputeProfileStatisticsProvider } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-statistics-provider.contract";
import type { IComputeProfileValidator } from "@server/application/ai-compute-profile-registry/contracts/compute-profile-validator.contract";
import {
  AiComputeProfileRegistryApplicationService,
  AiComputeProfileRegistryService,
  DeleteComputeProfileUseCase,
  FindComputeProfileByNameUseCase,
  GetComputeProfileRegistryStatisticsUseCase,
  GetComputeProfileUseCase,
  ListComputeProfilesByCategoryUseCase,
  ListComputeProfilesUseCase,
  RegisterComputeProfileUseCase,
  UpdateComputeProfileUseCase,
} from "@server/application/ai-compute-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ComputeProfileRepository } from "@server/infrastructure/ai-compute-profile-registry/compute-profile.repository";
import { DefaultComputeProfileCatalog } from "@server/infrastructure/ai-compute-profile-registry/default-compute-profile.catalog";
import { DefaultComputeProfileStatisticsProvider } from "@server/infrastructure/ai-compute-profile-registry/default-compute-profile-statistics.provider";
import { DefaultComputeProfileValidator } from "@server/infrastructure/ai-compute-profile-registry/default-compute-profile.validator";
import { JsonComputeProfileSerializer } from "@server/infrastructure/ai-compute-profile-registry/json-compute-profile.serializer";

/** Registers AI Compute Profile Registry services and use cases. */
export function registerAiComputeProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiComputeProfileRegistryComputeProfileRepository,
    () => new ComputeProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComputeProfileRegistryComputeProfileCatalog,
    () => new DefaultComputeProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComputeProfileRegistryComputeProfileValidator,
    () => new DefaultComputeProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComputeProfileRegistryComputeProfileSerializer,
    () => new JsonComputeProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComputeProfileRegistryComputeProfileStatisticsProvider,
    () => new DefaultComputeProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryService,
    (provider) =>
      new AiComputeProfileRegistryService(
        provider.resolve<IComputeProfileRepository>(
          InfrastructureTokens.AiComputeProfileRegistryComputeProfileRepository,
        ),
        provider.resolve<IComputeProfileCatalog>(
          InfrastructureTokens.AiComputeProfileRegistryComputeProfileCatalog,
        ),
        provider.resolve<IComputeProfileValidator>(
          InfrastructureTokens.AiComputeProfileRegistryComputeProfileValidator,
        ),
        provider.resolve<IComputeProfileSerializer>(
          InfrastructureTokens.AiComputeProfileRegistryComputeProfileSerializer,
        ),
        provider.resolve<IComputeProfileStatisticsProvider>(
          InfrastructureTokens.AiComputeProfileRegistryComputeProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryRegisterComputeProfileUseCase,
    (provider) =>
      new RegisterComputeProfileUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryGetComputeProfileUseCase,
    (provider) =>
      new GetComputeProfileUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryListComputeProfilesUseCase,
    (provider) =>
      new ListComputeProfilesUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryUpdateComputeProfileUseCase,
    (provider) =>
      new UpdateComputeProfileUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryDeleteComputeProfileUseCase,
    (provider) =>
      new DeleteComputeProfileUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryFindComputeProfileByNameUseCase,
    (provider) =>
      new FindComputeProfileByNameUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryListComputeProfilesByCategoryUseCase,
    (provider) =>
      new ListComputeProfilesByCategoryUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryGetComputeProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetComputeProfileRegistryStatisticsUseCase(
        provider.resolve<AiComputeProfileRegistryService>(
          InfrastructureTokens.AiComputeProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComputeProfileRegistryApplicationService,
    (provider) =>
      new AiComputeProfileRegistryApplicationService(
        provider.resolve<RegisterComputeProfileUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryRegisterComputeProfileUseCase,
        ),
        provider.resolve<GetComputeProfileUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryGetComputeProfileUseCase,
        ),
        provider.resolve<ListComputeProfilesUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryListComputeProfilesUseCase,
        ),
        provider.resolve<UpdateComputeProfileUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryUpdateComputeProfileUseCase,
        ),
        provider.resolve<DeleteComputeProfileUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryDeleteComputeProfileUseCase,
        ),
        provider.resolve<FindComputeProfileByNameUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryFindComputeProfileByNameUseCase,
        ),
        provider.resolve<ListComputeProfilesByCategoryUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryListComputeProfilesByCategoryUseCase,
        ),
        provider.resolve<GetComputeProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiComputeProfileRegistryGetComputeProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
