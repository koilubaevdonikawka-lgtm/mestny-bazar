import type { IAcceleratorProfileCatalog } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-catalog.contract";
import type { IAcceleratorProfileRepository } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-repository.contract";
import type { IAcceleratorProfileSerializer } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-serializer.contract";
import type { IAcceleratorProfileStatisticsProvider } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-statistics-provider.contract";
import type { IAcceleratorProfileValidator } from "@server/application/ai-accelerator-profile-registry/contracts/accelerator-profile-validator.contract";
import {
  AiAcceleratorProfileRegistryApplicationService,
  AiAcceleratorProfileRegistryService,
  DeleteAcceleratorProfileUseCase,
  FindAcceleratorProfileByNameUseCase,
  GetAcceleratorProfileRegistryStatisticsUseCase,
  GetAcceleratorProfileUseCase,
  ListAcceleratorProfilesByCategoryUseCase,
  ListAcceleratorProfilesUseCase,
  RegisterAcceleratorProfileUseCase,
  UpdateAcceleratorProfileUseCase,
} from "@server/application/ai-accelerator-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AcceleratorProfileRepository } from "@server/infrastructure/ai-accelerator-profile-registry/accelerator-profile.repository";
import { DefaultAcceleratorProfileCatalog } from "@server/infrastructure/ai-accelerator-profile-registry/default-accelerator-profile.catalog";
import { DefaultAcceleratorProfileStatisticsProvider } from "@server/infrastructure/ai-accelerator-profile-registry/default-accelerator-profile-statistics.provider";
import { DefaultAcceleratorProfileValidator } from "@server/infrastructure/ai-accelerator-profile-registry/default-accelerator-profile.validator";
import { JsonAcceleratorProfileSerializer } from "@server/infrastructure/ai-accelerator-profile-registry/json-accelerator-profile.serializer";

/** Registers AI Accelerator Profile Registry services and use cases. */
export function registerAiAcceleratorProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileRepository,
    () => new AcceleratorProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileCatalog,
    () => new DefaultAcceleratorProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileValidator,
    () => new DefaultAcceleratorProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileSerializer,
    () => new JsonAcceleratorProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileStatisticsProvider,
    () => new DefaultAcceleratorProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryService,
    (provider) =>
      new AiAcceleratorProfileRegistryService(
        provider.resolve<IAcceleratorProfileRepository>(
          InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileRepository,
        ),
        provider.resolve<IAcceleratorProfileCatalog>(
          InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileCatalog,
        ),
        provider.resolve<IAcceleratorProfileValidator>(
          InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileValidator,
        ),
        provider.resolve<IAcceleratorProfileSerializer>(
          InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileSerializer,
        ),
        provider.resolve<IAcceleratorProfileStatisticsProvider>(
          InfrastructureTokens.AiAcceleratorProfileRegistryAcceleratorProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryRegisterAcceleratorProfileUseCase,
    (provider) =>
      new RegisterAcceleratorProfileUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryGetAcceleratorProfileUseCase,
    (provider) =>
      new GetAcceleratorProfileUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryListAcceleratorProfilesUseCase,
    (provider) =>
      new ListAcceleratorProfilesUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryUpdateAcceleratorProfileUseCase,
    (provider) =>
      new UpdateAcceleratorProfileUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryDeleteAcceleratorProfileUseCase,
    (provider) =>
      new DeleteAcceleratorProfileUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryFindAcceleratorProfileByNameUseCase,
    (provider) =>
      new FindAcceleratorProfileByNameUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryListAcceleratorProfilesByCategoryUseCase,
    (provider) =>
      new ListAcceleratorProfilesByCategoryUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryGetAcceleratorProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetAcceleratorProfileRegistryStatisticsUseCase(
        provider.resolve<AiAcceleratorProfileRegistryService>(
          InfrastructureTokens.AiAcceleratorProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAcceleratorProfileRegistryApplicationService,
    (provider) =>
      new AiAcceleratorProfileRegistryApplicationService(
        provider.resolve<RegisterAcceleratorProfileUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryRegisterAcceleratorProfileUseCase,
        ),
        provider.resolve<GetAcceleratorProfileUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryGetAcceleratorProfileUseCase,
        ),
        provider.resolve<ListAcceleratorProfilesUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryListAcceleratorProfilesUseCase,
        ),
        provider.resolve<UpdateAcceleratorProfileUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryUpdateAcceleratorProfileUseCase,
        ),
        provider.resolve<DeleteAcceleratorProfileUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryDeleteAcceleratorProfileUseCase,
        ),
        provider.resolve<FindAcceleratorProfileByNameUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryFindAcceleratorProfileByNameUseCase,
        ),
        provider.resolve<ListAcceleratorProfilesByCategoryUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryListAcceleratorProfilesByCategoryUseCase,
        ),
        provider.resolve<GetAcceleratorProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiAcceleratorProfileRegistryGetAcceleratorProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
