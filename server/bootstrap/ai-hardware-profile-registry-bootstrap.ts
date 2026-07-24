import type { IHardwareProfileCatalog } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-catalog.contract";
import type { IHardwareProfileRepository } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-repository.contract";
import type { IHardwareProfileSerializer } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-serializer.contract";
import type { IHardwareProfileStatisticsProvider } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-statistics-provider.contract";
import type { IHardwareProfileValidator } from "@server/application/ai-hardware-profile-registry/contracts/hardware-profile-validator.contract";
import {
  AiHardwareProfileRegistryApplicationService,
  AiHardwareProfileRegistryService,
  DeleteHardwareProfileUseCase,
  FindHardwareProfileByNameUseCase,
  GetHardwareProfileRegistryStatisticsUseCase,
  GetHardwareProfileUseCase,
  ListHardwareProfilesByCategoryUseCase,
  ListHardwareProfilesUseCase,
  RegisterHardwareProfileUseCase,
  UpdateHardwareProfileUseCase,
} from "@server/application/ai-hardware-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { HardwareProfileRepository } from "@server/infrastructure/ai-hardware-profile-registry/hardware-profile.repository";
import { DefaultHardwareProfileCatalog } from "@server/infrastructure/ai-hardware-profile-registry/default-hardware-profile.catalog";
import { DefaultHardwareProfileStatisticsProvider } from "@server/infrastructure/ai-hardware-profile-registry/default-hardware-profile-statistics.provider";
import { DefaultHardwareProfileValidator } from "@server/infrastructure/ai-hardware-profile-registry/default-hardware-profile.validator";
import { JsonHardwareProfileSerializer } from "@server/infrastructure/ai-hardware-profile-registry/json-hardware-profile.serializer";

/** Registers AI Hardware Profile Registry services and use cases. */
export function registerAiHardwareProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileRepository,
    () => new HardwareProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileCatalog,
    () => new DefaultHardwareProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileValidator,
    () => new DefaultHardwareProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileSerializer,
    () => new JsonHardwareProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileStatisticsProvider,
    () => new DefaultHardwareProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryService,
    (provider) =>
      new AiHardwareProfileRegistryService(
        provider.resolve<IHardwareProfileRepository>(
          InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileRepository,
        ),
        provider.resolve<IHardwareProfileCatalog>(
          InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileCatalog,
        ),
        provider.resolve<IHardwareProfileValidator>(
          InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileValidator,
        ),
        provider.resolve<IHardwareProfileSerializer>(
          InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileSerializer,
        ),
        provider.resolve<IHardwareProfileStatisticsProvider>(
          InfrastructureTokens.AiHardwareProfileRegistryHardwareProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryRegisterHardwareProfileUseCase,
    (provider) =>
      new RegisterHardwareProfileUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryGetHardwareProfileUseCase,
    (provider) =>
      new GetHardwareProfileUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryListHardwareProfilesUseCase,
    (provider) =>
      new ListHardwareProfilesUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryUpdateHardwareProfileUseCase,
    (provider) =>
      new UpdateHardwareProfileUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryDeleteHardwareProfileUseCase,
    (provider) =>
      new DeleteHardwareProfileUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryFindHardwareProfileByNameUseCase,
    (provider) =>
      new FindHardwareProfileByNameUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryListHardwareProfilesByCategoryUseCase,
    (provider) =>
      new ListHardwareProfilesByCategoryUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryGetHardwareProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetHardwareProfileRegistryStatisticsUseCase(
        provider.resolve<AiHardwareProfileRegistryService>(
          InfrastructureTokens.AiHardwareProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiHardwareProfileRegistryApplicationService,
    (provider) =>
      new AiHardwareProfileRegistryApplicationService(
        provider.resolve<RegisterHardwareProfileUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryRegisterHardwareProfileUseCase,
        ),
        provider.resolve<GetHardwareProfileUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryGetHardwareProfileUseCase,
        ),
        provider.resolve<ListHardwareProfilesUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryListHardwareProfilesUseCase,
        ),
        provider.resolve<UpdateHardwareProfileUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryUpdateHardwareProfileUseCase,
        ),
        provider.resolve<DeleteHardwareProfileUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryDeleteHardwareProfileUseCase,
        ),
        provider.resolve<FindHardwareProfileByNameUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryFindHardwareProfileByNameUseCase,
        ),
        provider.resolve<ListHardwareProfilesByCategoryUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryListHardwareProfilesByCategoryUseCase,
        ),
        provider.resolve<GetHardwareProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiHardwareProfileRegistryGetHardwareProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
