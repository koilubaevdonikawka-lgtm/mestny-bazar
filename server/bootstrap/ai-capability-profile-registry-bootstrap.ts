import type { ICapabilityProfileCatalog } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-catalog.contract";
import type { ICapabilityProfileRepository } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-repository.contract";
import type { ICapabilityProfileSerializer } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-serializer.contract";
import type { ICapabilityProfileStatisticsProvider } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-statistics-provider.contract";
import type { ICapabilityProfileValidator } from "@server/application/ai-capability-profile-registry/contracts/capability-profile-validator.contract";
import {
  AiCapabilityProfileRegistryApplicationService,
  AiCapabilityProfileRegistryService,
  DeleteCapabilityProfileUseCase,
  FindCapabilityProfileByNameUseCase,
  GetCapabilityProfileRegistryStatisticsUseCase,
  GetCapabilityProfileUseCase,
  ListCapabilityProfilesByCategoryUseCase,
  ListCapabilityProfilesUseCase,
  RegisterCapabilityProfileUseCase,
  UpdateCapabilityProfileUseCase,
} from "@server/application/ai-capability-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { CapabilityProfileRepository } from "@server/infrastructure/ai-capability-profile-registry/capability-profile.repository";
import { DefaultCapabilityProfileCatalog } from "@server/infrastructure/ai-capability-profile-registry/default-capability-profile.catalog";
import { DefaultCapabilityProfileStatisticsProvider } from "@server/infrastructure/ai-capability-profile-registry/default-capability-profile-statistics.provider";
import { DefaultCapabilityProfileValidator } from "@server/infrastructure/ai-capability-profile-registry/default-capability-profile.validator";
import { JsonCapabilityProfileSerializer } from "@server/infrastructure/ai-capability-profile-registry/json-capability-profile.serializer";

/** Registers AI Capability Profile Registry services and use cases. */
export function registerAiCapabilityProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileRepository,
    () => new CapabilityProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileCatalog,
    () => new DefaultCapabilityProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileValidator,
    () => new DefaultCapabilityProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileSerializer,
    () => new JsonCapabilityProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileStatisticsProvider,
    () => new DefaultCapabilityProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryService,
    (provider) =>
      new AiCapabilityProfileRegistryService(
        provider.resolve<ICapabilityProfileRepository>(
          InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileRepository,
        ),
        provider.resolve<ICapabilityProfileCatalog>(
          InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileCatalog,
        ),
        provider.resolve<ICapabilityProfileValidator>(
          InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileValidator,
        ),
        provider.resolve<ICapabilityProfileSerializer>(
          InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileSerializer,
        ),
        provider.resolve<ICapabilityProfileStatisticsProvider>(
          InfrastructureTokens.AiCapabilityProfileRegistryCapabilityProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryRegisterCapabilityProfileUseCase,
    (provider) =>
      new RegisterCapabilityProfileUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryGetCapabilityProfileUseCase,
    (provider) =>
      new GetCapabilityProfileUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryListCapabilityProfilesUseCase,
    (provider) =>
      new ListCapabilityProfilesUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryUpdateCapabilityProfileUseCase,
    (provider) =>
      new UpdateCapabilityProfileUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryDeleteCapabilityProfileUseCase,
    (provider) =>
      new DeleteCapabilityProfileUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryFindCapabilityProfileByNameUseCase,
    (provider) =>
      new FindCapabilityProfileByNameUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryListCapabilityProfilesByCategoryUseCase,
    (provider) =>
      new ListCapabilityProfilesByCategoryUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryGetCapabilityProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetCapabilityProfileRegistryStatisticsUseCase(
        provider.resolve<AiCapabilityProfileRegistryService>(
          InfrastructureTokens.AiCapabilityProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiCapabilityProfileRegistryApplicationService,
    (provider) =>
      new AiCapabilityProfileRegistryApplicationService(
        provider.resolve<RegisterCapabilityProfileUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryRegisterCapabilityProfileUseCase,
        ),
        provider.resolve<GetCapabilityProfileUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryGetCapabilityProfileUseCase,
        ),
        provider.resolve<ListCapabilityProfilesUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryListCapabilityProfilesUseCase,
        ),
        provider.resolve<UpdateCapabilityProfileUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryUpdateCapabilityProfileUseCase,
        ),
        provider.resolve<DeleteCapabilityProfileUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryDeleteCapabilityProfileUseCase,
        ),
        provider.resolve<FindCapabilityProfileByNameUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryFindCapabilityProfileByNameUseCase,
        ),
        provider.resolve<ListCapabilityProfilesByCategoryUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryListCapabilityProfilesByCategoryUseCase,
        ),
        provider.resolve<GetCapabilityProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiCapabilityProfileRegistryGetCapabilityProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
