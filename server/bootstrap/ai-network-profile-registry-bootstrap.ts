import type { INetworkProfileCatalog } from "@server/application/ai-network-profile-registry/contracts/network-profile-catalog.contract";
import type { INetworkProfileRepository } from "@server/application/ai-network-profile-registry/contracts/network-profile-repository.contract";
import type { INetworkProfileSerializer } from "@server/application/ai-network-profile-registry/contracts/network-profile-serializer.contract";
import type { INetworkProfileStatisticsProvider } from "@server/application/ai-network-profile-registry/contracts/network-profile-statistics-provider.contract";
import type { INetworkProfileValidator } from "@server/application/ai-network-profile-registry/contracts/network-profile-validator.contract";
import {
  AiNetworkProfileRegistryApplicationService,
  AiNetworkProfileRegistryService,
  DeleteNetworkProfileUseCase,
  FindNetworkProfileByNameUseCase,
  GetNetworkProfileRegistryStatisticsUseCase,
  GetNetworkProfileUseCase,
  ListNetworkProfilesByCategoryUseCase,
  ListNetworkProfilesUseCase,
  RegisterNetworkProfileUseCase,
  UpdateNetworkProfileUseCase,
} from "@server/application/ai-network-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { NetworkProfileRepository } from "@server/infrastructure/ai-network-profile-registry/network-profile.repository";
import { DefaultNetworkProfileCatalog } from "@server/infrastructure/ai-network-profile-registry/default-network-profile.catalog";
import { DefaultNetworkProfileStatisticsProvider } from "@server/infrastructure/ai-network-profile-registry/default-network-profile-statistics.provider";
import { DefaultNetworkProfileValidator } from "@server/infrastructure/ai-network-profile-registry/default-network-profile.validator";
import { JsonNetworkProfileSerializer } from "@server/infrastructure/ai-network-profile-registry/json-network-profile.serializer";

/** Registers AI Network Profile Registry services and use cases. */
export function registerAiNetworkProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileRepository,
    () => new NetworkProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileCatalog,
    () => new DefaultNetworkProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileValidator,
    () => new DefaultNetworkProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileSerializer,
    () => new JsonNetworkProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileStatisticsProvider,
    () => new DefaultNetworkProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryService,
    (provider) =>
      new AiNetworkProfileRegistryService(
        provider.resolve<INetworkProfileRepository>(
          InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileRepository,
        ),
        provider.resolve<INetworkProfileCatalog>(
          InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileCatalog,
        ),
        provider.resolve<INetworkProfileValidator>(
          InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileValidator,
        ),
        provider.resolve<INetworkProfileSerializer>(
          InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileSerializer,
        ),
        provider.resolve<INetworkProfileStatisticsProvider>(
          InfrastructureTokens.AiNetworkProfileRegistryNetworkProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryRegisterNetworkProfileUseCase,
    (provider) =>
      new RegisterNetworkProfileUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryGetNetworkProfileUseCase,
    (provider) =>
      new GetNetworkProfileUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryListNetworkProfilesUseCase,
    (provider) =>
      new ListNetworkProfilesUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryUpdateNetworkProfileUseCase,
    (provider) =>
      new UpdateNetworkProfileUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryDeleteNetworkProfileUseCase,
    (provider) =>
      new DeleteNetworkProfileUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryFindNetworkProfileByNameUseCase,
    (provider) =>
      new FindNetworkProfileByNameUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryListNetworkProfilesByCategoryUseCase,
    (provider) =>
      new ListNetworkProfilesByCategoryUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryGetNetworkProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetNetworkProfileRegistryStatisticsUseCase(
        provider.resolve<AiNetworkProfileRegistryService>(
          InfrastructureTokens.AiNetworkProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNetworkProfileRegistryApplicationService,
    (provider) =>
      new AiNetworkProfileRegistryApplicationService(
        provider.resolve<RegisterNetworkProfileUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryRegisterNetworkProfileUseCase,
        ),
        provider.resolve<GetNetworkProfileUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryGetNetworkProfileUseCase,
        ),
        provider.resolve<ListNetworkProfilesUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryListNetworkProfilesUseCase,
        ),
        provider.resolve<UpdateNetworkProfileUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryUpdateNetworkProfileUseCase,
        ),
        provider.resolve<DeleteNetworkProfileUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryDeleteNetworkProfileUseCase,
        ),
        provider.resolve<FindNetworkProfileByNameUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryFindNetworkProfileByNameUseCase,
        ),
        provider.resolve<ListNetworkProfilesByCategoryUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryListNetworkProfilesByCategoryUseCase,
        ),
        provider.resolve<GetNetworkProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiNetworkProfileRegistryGetNetworkProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
