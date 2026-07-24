import type { IReliabilityProfileCatalog } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-catalog.contract";
import type { IReliabilityProfileRepository } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-repository.contract";
import type { IReliabilityProfileSerializer } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-serializer.contract";
import type { IReliabilityProfileStatisticsProvider } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-statistics-provider.contract";
import type { IReliabilityProfileValidator } from "@server/application/ai-reliability-profile-registry/contracts/reliability-profile-validator.contract";
import {
  AiReliabilityProfileRegistryApplicationService,
  AiReliabilityProfileRegistryService,
  DeleteReliabilityProfileUseCase,
  FindReliabilityProfileByNameUseCase,
  GetReliabilityProfileRegistryStatisticsUseCase,
  GetReliabilityProfileUseCase,
  ListReliabilityProfilesByCategoryUseCase,
  ListReliabilityProfilesUseCase,
  RegisterReliabilityProfileUseCase,
  UpdateReliabilityProfileUseCase,
} from "@server/application/ai-reliability-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ReliabilityProfileRepository } from "@server/infrastructure/ai-reliability-profile-registry/reliability-profile.repository";
import { DefaultReliabilityProfileCatalog } from "@server/infrastructure/ai-reliability-profile-registry/default-reliability-profile.catalog";
import { DefaultReliabilityProfileStatisticsProvider } from "@server/infrastructure/ai-reliability-profile-registry/default-reliability-profile-statistics.provider";
import { DefaultReliabilityProfileValidator } from "@server/infrastructure/ai-reliability-profile-registry/default-reliability-profile.validator";
import { JsonReliabilityProfileSerializer } from "@server/infrastructure/ai-reliability-profile-registry/json-reliability-profile.serializer";

/** Registers AI Reliability Profile Registry services and use cases. */
export function registerAiReliabilityProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileRepository,
    () => new ReliabilityProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileCatalog,
    () => new DefaultReliabilityProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileValidator,
    () => new DefaultReliabilityProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileSerializer,
    () => new JsonReliabilityProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileStatisticsProvider,
    () => new DefaultReliabilityProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryService,
    (provider) =>
      new AiReliabilityProfileRegistryService(
        provider.resolve<IReliabilityProfileRepository>(
          InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileRepository,
        ),
        provider.resolve<IReliabilityProfileCatalog>(
          InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileCatalog,
        ),
        provider.resolve<IReliabilityProfileValidator>(
          InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileValidator,
        ),
        provider.resolve<IReliabilityProfileSerializer>(
          InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileSerializer,
        ),
        provider.resolve<IReliabilityProfileStatisticsProvider>(
          InfrastructureTokens.AiReliabilityProfileRegistryReliabilityProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryRegisterReliabilityProfileUseCase,
    (provider) =>
      new RegisterReliabilityProfileUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryGetReliabilityProfileUseCase,
    (provider) =>
      new GetReliabilityProfileUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryListReliabilityProfilesUseCase,
    (provider) =>
      new ListReliabilityProfilesUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryUpdateReliabilityProfileUseCase,
    (provider) =>
      new UpdateReliabilityProfileUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryDeleteReliabilityProfileUseCase,
    (provider) =>
      new DeleteReliabilityProfileUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryFindReliabilityProfileByNameUseCase,
    (provider) =>
      new FindReliabilityProfileByNameUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryListReliabilityProfilesByCategoryUseCase,
    (provider) =>
      new ListReliabilityProfilesByCategoryUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryGetReliabilityProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetReliabilityProfileRegistryStatisticsUseCase(
        provider.resolve<AiReliabilityProfileRegistryService>(
          InfrastructureTokens.AiReliabilityProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiReliabilityProfileRegistryApplicationService,
    (provider) =>
      new AiReliabilityProfileRegistryApplicationService(
        provider.resolve<RegisterReliabilityProfileUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryRegisterReliabilityProfileUseCase,
        ),
        provider.resolve<GetReliabilityProfileUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryGetReliabilityProfileUseCase,
        ),
        provider.resolve<ListReliabilityProfilesUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryListReliabilityProfilesUseCase,
        ),
        provider.resolve<UpdateReliabilityProfileUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryUpdateReliabilityProfileUseCase,
        ),
        provider.resolve<DeleteReliabilityProfileUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryDeleteReliabilityProfileUseCase,
        ),
        provider.resolve<FindReliabilityProfileByNameUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryFindReliabilityProfileByNameUseCase,
        ),
        provider.resolve<ListReliabilityProfilesByCategoryUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryListReliabilityProfilesByCategoryUseCase,
        ),
        provider.resolve<GetReliabilityProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiReliabilityProfileRegistryGetReliabilityProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
