import type { IRiskProfileCatalog } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-catalog.contract";
import type { IRiskProfileRepository } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-repository.contract";
import type { IRiskProfileSerializer } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-serializer.contract";
import type { IRiskProfileStatisticsProvider } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-statistics-provider.contract";
import type { IRiskProfileValidator } from "@server/application/ai-risk-profile-registry/contracts/risk-profile-validator.contract";
import {
  AiRiskProfileRegistryApplicationService,
  AiRiskProfileRegistryService,
  DeleteRiskProfileUseCase,
  FindRiskProfileByNameUseCase,
  GetRiskProfileRegistryStatisticsUseCase,
  GetRiskProfileUseCase,
  ListRiskProfilesByCategoryUseCase,
  ListRiskProfilesUseCase,
  RegisterRiskProfileUseCase,
  UpdateRiskProfileUseCase,
} from "@server/application/ai-risk-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { RiskProfileRepository } from "@server/infrastructure/ai-risk-profile-registry/risk-profile.repository";
import { DefaultRiskProfileCatalog } from "@server/infrastructure/ai-risk-profile-registry/default-risk-profile.catalog";
import { DefaultRiskProfileStatisticsProvider } from "@server/infrastructure/ai-risk-profile-registry/default-risk-profile-statistics.provider";
import { DefaultRiskProfileValidator } from "@server/infrastructure/ai-risk-profile-registry/default-risk-profile.validator";
import { JsonRiskProfileSerializer } from "@server/infrastructure/ai-risk-profile-registry/json-risk-profile.serializer";

/** Registers AI Risk Profile Registry services and use cases. */
export function registerAiRiskProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiRiskProfileRegistryRiskProfileRepository,
    () => new RiskProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskProfileRegistryRiskProfileCatalog,
    () => new DefaultRiskProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskProfileRegistryRiskProfileValidator,
    () => new DefaultRiskProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskProfileRegistryRiskProfileSerializer,
    () => new JsonRiskProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiRiskProfileRegistryRiskProfileStatisticsProvider,
    () => new DefaultRiskProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryService,
    (provider) =>
      new AiRiskProfileRegistryService(
        provider.resolve<IRiskProfileRepository>(
          InfrastructureTokens.AiRiskProfileRegistryRiskProfileRepository,
        ),
        provider.resolve<IRiskProfileCatalog>(
          InfrastructureTokens.AiRiskProfileRegistryRiskProfileCatalog,
        ),
        provider.resolve<IRiskProfileValidator>(
          InfrastructureTokens.AiRiskProfileRegistryRiskProfileValidator,
        ),
        provider.resolve<IRiskProfileSerializer>(
          InfrastructureTokens.AiRiskProfileRegistryRiskProfileSerializer,
        ),
        provider.resolve<IRiskProfileStatisticsProvider>(
          InfrastructureTokens.AiRiskProfileRegistryRiskProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryRegisterRiskProfileUseCase,
    (provider) =>
      new RegisterRiskProfileUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryGetRiskProfileUseCase,
    (provider) =>
      new GetRiskProfileUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryListRiskProfilesUseCase,
    (provider) =>
      new ListRiskProfilesUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryUpdateRiskProfileUseCase,
    (provider) =>
      new UpdateRiskProfileUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryDeleteRiskProfileUseCase,
    (provider) =>
      new DeleteRiskProfileUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryFindRiskProfileByNameUseCase,
    (provider) =>
      new FindRiskProfileByNameUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryListRiskProfilesByCategoryUseCase,
    (provider) =>
      new ListRiskProfilesByCategoryUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryGetRiskProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetRiskProfileRegistryStatisticsUseCase(
        provider.resolve<AiRiskProfileRegistryService>(
          InfrastructureTokens.AiRiskProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiRiskProfileRegistryApplicationService,
    (provider) =>
      new AiRiskProfileRegistryApplicationService(
        provider.resolve<RegisterRiskProfileUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryRegisterRiskProfileUseCase,
        ),
        provider.resolve<GetRiskProfileUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryGetRiskProfileUseCase,
        ),
        provider.resolve<ListRiskProfilesUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryListRiskProfilesUseCase,
        ),
        provider.resolve<UpdateRiskProfileUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryUpdateRiskProfileUseCase,
        ),
        provider.resolve<DeleteRiskProfileUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryDeleteRiskProfileUseCase,
        ),
        provider.resolve<FindRiskProfileByNameUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryFindRiskProfileByNameUseCase,
        ),
        provider.resolve<ListRiskProfilesByCategoryUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryListRiskProfilesByCategoryUseCase,
        ),
        provider.resolve<GetRiskProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiRiskProfileRegistryGetRiskProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
