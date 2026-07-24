import type { IEthicsProfileCatalog } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-catalog.contract";
import type { IEthicsProfileRepository } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-repository.contract";
import type { IEthicsProfileSerializer } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-serializer.contract";
import type { IEthicsProfileStatisticsProvider } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-statistics-provider.contract";
import type { IEthicsProfileValidator } from "@server/application/ai-ethics-profile-registry/contracts/ethics-profile-validator.contract";
import {
  AiEthicsProfileRegistryApplicationService,
  AiEthicsProfileRegistryService,
  DeleteEthicsProfileUseCase,
  FindEthicsProfileByNameUseCase,
  GetEthicsProfileRegistryStatisticsUseCase,
  GetEthicsProfileUseCase,
  ListEthicsProfilesByCategoryUseCase,
  ListEthicsProfilesUseCase,
  RegisterEthicsProfileUseCase,
  UpdateEthicsProfileUseCase,
} from "@server/application/ai-ethics-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { EthicsProfileRepository } from "@server/infrastructure/ai-ethics-profile-registry/ethics-profile.repository";
import { DefaultEthicsProfileCatalog } from "@server/infrastructure/ai-ethics-profile-registry/default-ethics-profile.catalog";
import { DefaultEthicsProfileStatisticsProvider } from "@server/infrastructure/ai-ethics-profile-registry/default-ethics-profile-statistics.provider";
import { DefaultEthicsProfileValidator } from "@server/infrastructure/ai-ethics-profile-registry/default-ethics-profile.validator";
import { JsonEthicsProfileSerializer } from "@server/infrastructure/ai-ethics-profile-registry/json-ethics-profile.serializer";

/** Registers AI Ethics Profile Registry services and use cases. */
export function registerAiEthicsProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileRepository,
    () => new EthicsProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileCatalog,
    () => new DefaultEthicsProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileValidator,
    () => new DefaultEthicsProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileSerializer,
    () => new JsonEthicsProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileStatisticsProvider,
    () => new DefaultEthicsProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryService,
    (provider) =>
      new AiEthicsProfileRegistryService(
        provider.resolve<IEthicsProfileRepository>(
          InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileRepository,
        ),
        provider.resolve<IEthicsProfileCatalog>(
          InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileCatalog,
        ),
        provider.resolve<IEthicsProfileValidator>(
          InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileValidator,
        ),
        provider.resolve<IEthicsProfileSerializer>(
          InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileSerializer,
        ),
        provider.resolve<IEthicsProfileStatisticsProvider>(
          InfrastructureTokens.AiEthicsProfileRegistryEthicsProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryRegisterEthicsProfileUseCase,
    (provider) =>
      new RegisterEthicsProfileUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryGetEthicsProfileUseCase,
    (provider) =>
      new GetEthicsProfileUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryListEthicsProfilesUseCase,
    (provider) =>
      new ListEthicsProfilesUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryUpdateEthicsProfileUseCase,
    (provider) =>
      new UpdateEthicsProfileUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryDeleteEthicsProfileUseCase,
    (provider) =>
      new DeleteEthicsProfileUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryFindEthicsProfileByNameUseCase,
    (provider) =>
      new FindEthicsProfileByNameUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryListEthicsProfilesByCategoryUseCase,
    (provider) =>
      new ListEthicsProfilesByCategoryUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryGetEthicsProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetEthicsProfileRegistryStatisticsUseCase(
        provider.resolve<AiEthicsProfileRegistryService>(
          InfrastructureTokens.AiEthicsProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiEthicsProfileRegistryApplicationService,
    (provider) =>
      new AiEthicsProfileRegistryApplicationService(
        provider.resolve<RegisterEthicsProfileUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryRegisterEthicsProfileUseCase,
        ),
        provider.resolve<GetEthicsProfileUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryGetEthicsProfileUseCase,
        ),
        provider.resolve<ListEthicsProfilesUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryListEthicsProfilesUseCase,
        ),
        provider.resolve<UpdateEthicsProfileUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryUpdateEthicsProfileUseCase,
        ),
        provider.resolve<DeleteEthicsProfileUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryDeleteEthicsProfileUseCase,
        ),
        provider.resolve<FindEthicsProfileByNameUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryFindEthicsProfileByNameUseCase,
        ),
        provider.resolve<ListEthicsProfilesByCategoryUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryListEthicsProfilesByCategoryUseCase,
        ),
        provider.resolve<GetEthicsProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiEthicsProfileRegistryGetEthicsProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
