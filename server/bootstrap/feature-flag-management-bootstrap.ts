import type { IFeatureFlagAuditProvider } from "@server/application/feature-flag-management/contracts/feature-flag-audit-provider.contract";
import type { IFeatureFlagEvaluator } from "@server/application/feature-flag-management/contracts/feature-flag-evaluator.contract";
import type { IFeatureFlagProvider } from "@server/application/feature-flag-management/contracts/feature-flag-provider.contract";
import type { IFeatureFlagRepository } from "@server/application/feature-flag-management/contracts/feature-flag-repository.contract";
import type { IFeatureFlagValidator } from "@server/application/feature-flag-management/contracts/feature-flag-validator.contract";
import {
  DeleteFeatureFlagUseCase,
  DisableFeatureFlagUseCase,
  EnableFeatureFlagUseCase,
  FeatureFlagManagementApplicationService,
  FeatureFlagManagementService,
  GetFeatureFlagStatusUseCase,
  GetFeatureFlagUseCase,
  ListFeatureFlagsUseCase,
  RegisterFeatureFlagUseCase,
  UpdateFeatureFlagUseCase,
} from "@server/application/feature-flag-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultFeatureFlagEvaluator } from "@server/infrastructure/feature-flag-management/default-feature-flag.evaluator";
import { DefaultFeatureFlagProvider } from "@server/infrastructure/feature-flag-management/default-feature-flag.provider";
import { DefaultFeatureFlagValidator } from "@server/infrastructure/feature-flag-management/default-feature-flag.validator";
import { FeatureFlagRepository } from "@server/infrastructure/feature-flag-management/feature-flag.repository";
import { NoopFeatureFlagAuditProvider } from "@server/infrastructure/feature-flag-management/noop-feature-flag-audit.provider";

/** Registers feature flag management services and use cases. */
export function registerFeatureFlagManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.FeatureFlagManagementFeatureFlagRepository, () =>
    new FeatureFlagRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.FeatureFlagManagementFeatureFlagEvaluator, () =>
    new DefaultFeatureFlagEvaluator(),
  );

  registry.registerSingleton(InfrastructureTokens.FeatureFlagManagementFeatureFlagValidator, () =>
    new DefaultFeatureFlagValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.FeatureFlagManagementFeatureFlagProvider,
    (provider) =>
      new DefaultFeatureFlagProvider(
        provider.resolve<IFeatureFlagRepository>(
          InfrastructureTokens.FeatureFlagManagementFeatureFlagRepository,
        ),
      ),
  );

  registry.registerSingleton(InfrastructureTokens.FeatureFlagManagementFeatureFlagAuditProvider, () =>
    new NoopFeatureFlagAuditProvider(),
  );

  registry.registerTransient(InfrastructureTokens.FeatureFlagManagementService, (provider) =>
    new FeatureFlagManagementService(
      provider.resolve<IFeatureFlagRepository>(
        InfrastructureTokens.FeatureFlagManagementFeatureFlagRepository,
      ),
      provider.resolve<IFeatureFlagEvaluator>(
        InfrastructureTokens.FeatureFlagManagementFeatureFlagEvaluator,
      ),
      provider.resolve<IFeatureFlagValidator>(
        InfrastructureTokens.FeatureFlagManagementFeatureFlagValidator,
      ),
      provider.resolve<IFeatureFlagProvider>(
        InfrastructureTokens.FeatureFlagManagementFeatureFlagProvider,
      ),
      provider.resolve<IFeatureFlagAuditProvider>(
        InfrastructureTokens.FeatureFlagManagementFeatureFlagAuditProvider,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementRegisterFeatureFlagUseCase,
    (provider) =>
      new RegisterFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementGetFeatureFlagUseCase,
    (provider) =>
      new GetFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementEnableFeatureFlagUseCase,
    (provider) =>
      new EnableFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementDisableFeatureFlagUseCase,
    (provider) =>
      new DisableFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementUpdateFeatureFlagUseCase,
    (provider) =>
      new UpdateFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementDeleteFeatureFlagUseCase,
    (provider) =>
      new DeleteFeatureFlagUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementListFeatureFlagsUseCase,
    (provider) =>
      new ListFeatureFlagsUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementGetFeatureFlagStatusUseCase,
    (provider) =>
      new GetFeatureFlagStatusUseCase(
        provider.resolve<FeatureFlagManagementService>(
          InfrastructureTokens.FeatureFlagManagementService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.FeatureFlagManagementApplicationService,
    (provider) =>
      new FeatureFlagManagementApplicationService(
        provider.resolve<RegisterFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementRegisterFeatureFlagUseCase,
        ),
        provider.resolve<GetFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementGetFeatureFlagUseCase,
        ),
        provider.resolve<EnableFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementEnableFeatureFlagUseCase,
        ),
        provider.resolve<DisableFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementDisableFeatureFlagUseCase,
        ),
        provider.resolve<UpdateFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementUpdateFeatureFlagUseCase,
        ),
        provider.resolve<DeleteFeatureFlagUseCase>(
          InfrastructureTokens.FeatureFlagManagementDeleteFeatureFlagUseCase,
        ),
        provider.resolve<ListFeatureFlagsUseCase>(
          InfrastructureTokens.FeatureFlagManagementListFeatureFlagsUseCase,
        ),
        provider.resolve<GetFeatureFlagStatusUseCase>(
          InfrastructureTokens.FeatureFlagManagementGetFeatureFlagStatusUseCase,
        ),
      ),
  );
}
