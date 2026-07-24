import type { IGovernanceProfileCatalog } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-catalog.contract";
import type { IGovernanceProfileRepository } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-repository.contract";
import type { IGovernanceProfileSerializer } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-serializer.contract";
import type { IGovernanceProfileStatisticsProvider } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-statistics-provider.contract";
import type { IGovernanceProfileValidator } from "@server/application/ai-governance-profile-registry/contracts/governance-profile-validator.contract";
import {
  AiGovernanceProfileRegistryApplicationService,
  AiGovernanceProfileRegistryService,
  DeleteGovernanceProfileUseCase,
  FindGovernanceProfileByNameUseCase,
  GetGovernanceProfileRegistryStatisticsUseCase,
  GetGovernanceProfileUseCase,
  ListGovernanceProfilesByCategoryUseCase,
  ListGovernanceProfilesUseCase,
  RegisterGovernanceProfileUseCase,
  UpdateGovernanceProfileUseCase,
} from "@server/application/ai-governance-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { GovernanceProfileRepository } from "@server/infrastructure/ai-governance-profile-registry/governance-profile.repository";
import { DefaultGovernanceProfileCatalog } from "@server/infrastructure/ai-governance-profile-registry/default-governance-profile.catalog";
import { DefaultGovernanceProfileStatisticsProvider } from "@server/infrastructure/ai-governance-profile-registry/default-governance-profile-statistics.provider";
import { DefaultGovernanceProfileValidator } from "@server/infrastructure/ai-governance-profile-registry/default-governance-profile.validator";
import { JsonGovernanceProfileSerializer } from "@server/infrastructure/ai-governance-profile-registry/json-governance-profile.serializer";

/** Registers AI Governance Profile Registry services and use cases. */
export function registerAiGovernanceProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileRepository,
    () => new GovernanceProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileCatalog,
    () => new DefaultGovernanceProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileValidator,
    () => new DefaultGovernanceProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileSerializer,
    () => new JsonGovernanceProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileStatisticsProvider,
    () => new DefaultGovernanceProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryService,
    (provider) =>
      new AiGovernanceProfileRegistryService(
        provider.resolve<IGovernanceProfileRepository>(
          InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileRepository,
        ),
        provider.resolve<IGovernanceProfileCatalog>(
          InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileCatalog,
        ),
        provider.resolve<IGovernanceProfileValidator>(
          InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileValidator,
        ),
        provider.resolve<IGovernanceProfileSerializer>(
          InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileSerializer,
        ),
        provider.resolve<IGovernanceProfileStatisticsProvider>(
          InfrastructureTokens.AiGovernanceProfileRegistryGovernanceProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryRegisterGovernanceProfileUseCase,
    (provider) =>
      new RegisterGovernanceProfileUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryGetGovernanceProfileUseCase,
    (provider) =>
      new GetGovernanceProfileUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryListGovernanceProfilesUseCase,
    (provider) =>
      new ListGovernanceProfilesUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryUpdateGovernanceProfileUseCase,
    (provider) =>
      new UpdateGovernanceProfileUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryDeleteGovernanceProfileUseCase,
    (provider) =>
      new DeleteGovernanceProfileUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryFindGovernanceProfileByNameUseCase,
    (provider) =>
      new FindGovernanceProfileByNameUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryListGovernanceProfilesByCategoryUseCase,
    (provider) =>
      new ListGovernanceProfilesByCategoryUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryGetGovernanceProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetGovernanceProfileRegistryStatisticsUseCase(
        provider.resolve<AiGovernanceProfileRegistryService>(
          InfrastructureTokens.AiGovernanceProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernanceProfileRegistryApplicationService,
    (provider) =>
      new AiGovernanceProfileRegistryApplicationService(
        provider.resolve<RegisterGovernanceProfileUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryRegisterGovernanceProfileUseCase,
        ),
        provider.resolve<GetGovernanceProfileUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryGetGovernanceProfileUseCase,
        ),
        provider.resolve<ListGovernanceProfilesUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryListGovernanceProfilesUseCase,
        ),
        provider.resolve<UpdateGovernanceProfileUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryUpdateGovernanceProfileUseCase,
        ),
        provider.resolve<DeleteGovernanceProfileUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryDeleteGovernanceProfileUseCase,
        ),
        provider.resolve<FindGovernanceProfileByNameUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryFindGovernanceProfileByNameUseCase,
        ),
        provider.resolve<ListGovernanceProfilesByCategoryUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryListGovernanceProfilesByCategoryUseCase,
        ),
        provider.resolve<GetGovernanceProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiGovernanceProfileRegistryGetGovernanceProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
