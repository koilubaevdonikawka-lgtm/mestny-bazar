import type { IMemoryProfileCatalog } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-catalog.contract";
import type { IMemoryProfileRepository } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-repository.contract";
import type { IMemoryProfileSerializer } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-serializer.contract";
import type { IMemoryProfileStatisticsProvider } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-statistics-provider.contract";
import type { IMemoryProfileValidator } from "@server/application/ai-memory-profile-registry/contracts/memory-profile-validator.contract";
import {
  AiMemoryProfileRegistryApplicationService,
  AiMemoryProfileRegistryService,
  DeleteMemoryProfileUseCase,
  FindMemoryProfileByNameUseCase,
  GetMemoryProfileRegistryStatisticsUseCase,
  GetMemoryProfileUseCase,
  ListMemoryProfilesByCategoryUseCase,
  ListMemoryProfilesUseCase,
  RegisterMemoryProfileUseCase,
  UpdateMemoryProfileUseCase,
} from "@server/application/ai-memory-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { MemoryProfileRepository } from "@server/infrastructure/ai-memory-profile-registry/memory-profile.repository";
import { DefaultMemoryProfileCatalog } from "@server/infrastructure/ai-memory-profile-registry/default-memory-profile.catalog";
import { DefaultMemoryProfileStatisticsProvider } from "@server/infrastructure/ai-memory-profile-registry/default-memory-profile-statistics.provider";
import { DefaultMemoryProfileValidator } from "@server/infrastructure/ai-memory-profile-registry/default-memory-profile.validator";
import { JsonMemoryProfileSerializer } from "@server/infrastructure/ai-memory-profile-registry/json-memory-profile.serializer";

/** Registers AI Memory Profile Registry services and use cases. */
export function registerAiMemoryProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileRepository,
    () => new MemoryProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileCatalog,
    () => new DefaultMemoryProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileValidator,
    () => new DefaultMemoryProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileSerializer,
    () => new JsonMemoryProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileStatisticsProvider,
    () => new DefaultMemoryProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryService,
    (provider) =>
      new AiMemoryProfileRegistryService(
        provider.resolve<IMemoryProfileRepository>(
          InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileRepository,
        ),
        provider.resolve<IMemoryProfileCatalog>(
          InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileCatalog,
        ),
        provider.resolve<IMemoryProfileValidator>(
          InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileValidator,
        ),
        provider.resolve<IMemoryProfileSerializer>(
          InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileSerializer,
        ),
        provider.resolve<IMemoryProfileStatisticsProvider>(
          InfrastructureTokens.AiMemoryProfileRegistryMemoryProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryRegisterMemoryProfileUseCase,
    (provider) =>
      new RegisterMemoryProfileUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryGetMemoryProfileUseCase,
    (provider) =>
      new GetMemoryProfileUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryListMemoryProfilesUseCase,
    (provider) =>
      new ListMemoryProfilesUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryUpdateMemoryProfileUseCase,
    (provider) =>
      new UpdateMemoryProfileUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryDeleteMemoryProfileUseCase,
    (provider) =>
      new DeleteMemoryProfileUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryFindMemoryProfileByNameUseCase,
    (provider) =>
      new FindMemoryProfileByNameUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryListMemoryProfilesByCategoryUseCase,
    (provider) =>
      new ListMemoryProfilesByCategoryUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryGetMemoryProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetMemoryProfileRegistryStatisticsUseCase(
        provider.resolve<AiMemoryProfileRegistryService>(
          InfrastructureTokens.AiMemoryProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiMemoryProfileRegistryApplicationService,
    (provider) =>
      new AiMemoryProfileRegistryApplicationService(
        provider.resolve<RegisterMemoryProfileUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryRegisterMemoryProfileUseCase,
        ),
        provider.resolve<GetMemoryProfileUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryGetMemoryProfileUseCase,
        ),
        provider.resolve<ListMemoryProfilesUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryListMemoryProfilesUseCase,
        ),
        provider.resolve<UpdateMemoryProfileUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryUpdateMemoryProfileUseCase,
        ),
        provider.resolve<DeleteMemoryProfileUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryDeleteMemoryProfileUseCase,
        ),
        provider.resolve<FindMemoryProfileByNameUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryFindMemoryProfileByNameUseCase,
        ),
        provider.resolve<ListMemoryProfilesByCategoryUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryListMemoryProfilesByCategoryUseCase,
        ),
        provider.resolve<GetMemoryProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiMemoryProfileRegistryGetMemoryProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
