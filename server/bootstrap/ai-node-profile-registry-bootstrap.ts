import type { INodeProfileCatalog } from "@server/application/ai-node-profile-registry/contracts/node-profile-catalog.contract";
import type { INodeProfileRepository } from "@server/application/ai-node-profile-registry/contracts/node-profile-repository.contract";
import type { INodeProfileSerializer } from "@server/application/ai-node-profile-registry/contracts/node-profile-serializer.contract";
import type { INodeProfileStatisticsProvider } from "@server/application/ai-node-profile-registry/contracts/node-profile-statistics-provider.contract";
import type { INodeProfileValidator } from "@server/application/ai-node-profile-registry/contracts/node-profile-validator.contract";
import {
  AiNodeProfileRegistryApplicationService,
  AiNodeProfileRegistryService,
  DeleteNodeProfileUseCase,
  FindNodeProfileByNameUseCase,
  GetNodeProfileRegistryStatisticsUseCase,
  GetNodeProfileUseCase,
  ListNodeProfilesByCategoryUseCase,
  ListNodeProfilesUseCase,
  RegisterNodeProfileUseCase,
  UpdateNodeProfileUseCase,
} from "@server/application/ai-node-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { NodeProfileRepository } from "@server/infrastructure/ai-node-profile-registry/node-profile.repository";
import { DefaultNodeProfileCatalog } from "@server/infrastructure/ai-node-profile-registry/default-node-profile.catalog";
import { DefaultNodeProfileStatisticsProvider } from "@server/infrastructure/ai-node-profile-registry/default-node-profile-statistics.provider";
import { DefaultNodeProfileValidator } from "@server/infrastructure/ai-node-profile-registry/default-node-profile.validator";
import { JsonNodeProfileSerializer } from "@server/infrastructure/ai-node-profile-registry/json-node-profile.serializer";

/** Registers AI Node Profile Registry services and use cases. */
export function registerAiNodeProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiNodeProfileRegistryNodeProfileRepository,
    () => new NodeProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNodeProfileRegistryNodeProfileCatalog,
    () => new DefaultNodeProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNodeProfileRegistryNodeProfileValidator,
    () => new DefaultNodeProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNodeProfileRegistryNodeProfileSerializer,
    () => new JsonNodeProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiNodeProfileRegistryNodeProfileStatisticsProvider,
    () => new DefaultNodeProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryService,
    (provider) =>
      new AiNodeProfileRegistryService(
        provider.resolve<INodeProfileRepository>(
          InfrastructureTokens.AiNodeProfileRegistryNodeProfileRepository,
        ),
        provider.resolve<INodeProfileCatalog>(
          InfrastructureTokens.AiNodeProfileRegistryNodeProfileCatalog,
        ),
        provider.resolve<INodeProfileValidator>(
          InfrastructureTokens.AiNodeProfileRegistryNodeProfileValidator,
        ),
        provider.resolve<INodeProfileSerializer>(
          InfrastructureTokens.AiNodeProfileRegistryNodeProfileSerializer,
        ),
        provider.resolve<INodeProfileStatisticsProvider>(
          InfrastructureTokens.AiNodeProfileRegistryNodeProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryRegisterNodeProfileUseCase,
    (provider) =>
      new RegisterNodeProfileUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryGetNodeProfileUseCase,
    (provider) =>
      new GetNodeProfileUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryListNodeProfilesUseCase,
    (provider) =>
      new ListNodeProfilesUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryUpdateNodeProfileUseCase,
    (provider) =>
      new UpdateNodeProfileUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryDeleteNodeProfileUseCase,
    (provider) =>
      new DeleteNodeProfileUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryFindNodeProfileByNameUseCase,
    (provider) =>
      new FindNodeProfileByNameUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryListNodeProfilesByCategoryUseCase,
    (provider) =>
      new ListNodeProfilesByCategoryUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryGetNodeProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetNodeProfileRegistryStatisticsUseCase(
        provider.resolve<AiNodeProfileRegistryService>(
          InfrastructureTokens.AiNodeProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiNodeProfileRegistryApplicationService,
    (provider) =>
      new AiNodeProfileRegistryApplicationService(
        provider.resolve<RegisterNodeProfileUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryRegisterNodeProfileUseCase,
        ),
        provider.resolve<GetNodeProfileUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryGetNodeProfileUseCase,
        ),
        provider.resolve<ListNodeProfilesUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryListNodeProfilesUseCase,
        ),
        provider.resolve<UpdateNodeProfileUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryUpdateNodeProfileUseCase,
        ),
        provider.resolve<DeleteNodeProfileUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryDeleteNodeProfileUseCase,
        ),
        provider.resolve<FindNodeProfileByNameUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryFindNodeProfileByNameUseCase,
        ),
        provider.resolve<ListNodeProfilesByCategoryUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryListNodeProfilesByCategoryUseCase,
        ),
        provider.resolve<GetNodeProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiNodeProfileRegistryGetNodeProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
