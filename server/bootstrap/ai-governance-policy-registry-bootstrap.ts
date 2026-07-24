import type { IGovernancePolicyCatalog } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-catalog.contract";
import type { IGovernancePolicyRepository } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-repository.contract";
import type { IGovernancePolicySerializer } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-serializer.contract";
import type { IGovernancePolicyStatisticsProvider } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-statistics-provider.contract";
import type { IGovernancePolicyValidator } from "@server/application/ai-governance-policy-registry/contracts/governance-policy-validator.contract";
import {
  AiGovernancePolicyRegistryApplicationService,
  AiGovernancePolicyRegistryService,
  DeleteGovernancePolicyUseCase,
  FindGovernancePolicyByNameUseCase,
  GetGovernancePolicyRegistryStatisticsUseCase,
  GetGovernancePolicyUseCase,
  ListGovernancePoliciesByCategoryUseCase,
  ListGovernancePoliciesUseCase,
  RegisterGovernancePolicyUseCase,
  UpdateGovernancePolicyUseCase,
} from "@server/application/ai-governance-policy-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { GovernancePolicyRepository } from "@server/infrastructure/ai-governance-policy-registry/governance-policy.repository";
import { DefaultGovernancePolicyCatalog } from "@server/infrastructure/ai-governance-policy-registry/default-governance-policy.catalog";
import { DefaultGovernancePolicyStatisticsProvider } from "@server/infrastructure/ai-governance-policy-registry/default-governance-policy-statistics.provider";
import { DefaultGovernancePolicyValidator } from "@server/infrastructure/ai-governance-policy-registry/default-governance-policy.validator";
import { JsonGovernancePolicySerializer } from "@server/infrastructure/ai-governance-policy-registry/json-governance-policy.serializer";

/** Registers AI Governance Policy Registry services and use cases. */
export function registerAiGovernancePolicyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyRepository,
    () => new GovernancePolicyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyCatalog,
    () => new DefaultGovernancePolicyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyValidator,
    () => new DefaultGovernancePolicyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicySerializer,
    () => new JsonGovernancePolicySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyStatisticsProvider,
    () => new DefaultGovernancePolicyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryService,
    (provider) =>
      new AiGovernancePolicyRegistryService(
        provider.resolve<IGovernancePolicyRepository>(
          InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyRepository,
        ),
        provider.resolve<IGovernancePolicyCatalog>(
          InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyCatalog,
        ),
        provider.resolve<IGovernancePolicyValidator>(
          InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyValidator,
        ),
        provider.resolve<IGovernancePolicySerializer>(
          InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicySerializer,
        ),
        provider.resolve<IGovernancePolicyStatisticsProvider>(
          InfrastructureTokens.AiGovernancePolicyRegistryGovernancePolicyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryRegisterGovernancePolicyUseCase,
    (provider) =>
      new RegisterGovernancePolicyUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryGetGovernancePolicyUseCase,
    (provider) =>
      new GetGovernancePolicyUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryListGovernancePoliciesUseCase,
    (provider) =>
      new ListGovernancePoliciesUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryUpdateGovernancePolicyUseCase,
    (provider) =>
      new UpdateGovernancePolicyUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryDeleteGovernancePolicyUseCase,
    (provider) =>
      new DeleteGovernancePolicyUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryFindGovernancePolicyByNameUseCase,
    (provider) =>
      new FindGovernancePolicyByNameUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryListGovernancePoliciesByCategoryUseCase,
    (provider) =>
      new ListGovernancePoliciesByCategoryUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryGetGovernancePolicyRegistryStatisticsUseCase,
    (provider) =>
      new GetGovernancePolicyRegistryStatisticsUseCase(
        provider.resolve<AiGovernancePolicyRegistryService>(
          InfrastructureTokens.AiGovernancePolicyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiGovernancePolicyRegistryApplicationService,
    (provider) =>
      new AiGovernancePolicyRegistryApplicationService(
        provider.resolve<RegisterGovernancePolicyUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryRegisterGovernancePolicyUseCase,
        ),
        provider.resolve<GetGovernancePolicyUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryGetGovernancePolicyUseCase,
        ),
        provider.resolve<ListGovernancePoliciesUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryListGovernancePoliciesUseCase,
        ),
        provider.resolve<UpdateGovernancePolicyUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryUpdateGovernancePolicyUseCase,
        ),
        provider.resolve<DeleteGovernancePolicyUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryDeleteGovernancePolicyUseCase,
        ),
        provider.resolve<FindGovernancePolicyByNameUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryFindGovernancePolicyByNameUseCase,
        ),
        provider.resolve<ListGovernancePoliciesByCategoryUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryListGovernancePoliciesByCategoryUseCase,
        ),
        provider.resolve<GetGovernancePolicyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiGovernancePolicyRegistryGetGovernancePolicyRegistryStatisticsUseCase,
        ),
      ),
  );
}
