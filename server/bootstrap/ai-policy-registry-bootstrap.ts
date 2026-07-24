import type { IPolicyCatalog } from "@server/application/ai-policy-registry/contracts/policy-catalog.contract";
import type { IPolicyRepository } from "@server/application/ai-policy-registry/contracts/policy-repository.contract";
import type { IPolicySerializer } from "@server/application/ai-policy-registry/contracts/policy-serializer.contract";
import type { IPolicyStatisticsProvider } from "@server/application/ai-policy-registry/contracts/policy-statistics-provider.contract";
import type { IPolicyValidator } from "@server/application/ai-policy-registry/contracts/policy-validator.contract";
import {
  AiPolicyRegistryApplicationService,
  AiPolicyRegistryService,
  DeletePolicyUseCase,
  FindPolicyByNameUseCase,
  GetPolicyRegistryStatisticsUseCase,
  GetPolicyUseCase,
  ListPoliciesByCategoryUseCase,
  ListPoliciesUseCase,
  RegisterPolicyUseCase,
  UpdatePolicyUseCase,
} from "@server/application/ai-policy-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { PolicyRepository } from "@server/infrastructure/ai-policy-registry/policy.repository";
import { DefaultPolicyCatalog } from "@server/infrastructure/ai-policy-registry/default-policy.catalog";
import { DefaultPolicyStatisticsProvider } from "@server/infrastructure/ai-policy-registry/default-policy-statistics.provider";
import { DefaultPolicyValidator } from "@server/infrastructure/ai-policy-registry/default-policy.validator";
import { JsonPolicySerializer } from "@server/infrastructure/ai-policy-registry/json-policy.serializer";

/** Registers AI Policy Registry services and use cases. */
export function registerAiPolicyRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPolicyRegistryPolicyRepository,
    () => new PolicyRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyRegistryPolicyCatalog,
    () => new DefaultPolicyCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyRegistryPolicyValidator,
    () => new DefaultPolicyValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyRegistryPolicySerializer,
    () => new JsonPolicySerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyRegistryPolicyStatisticsProvider,
    () => new DefaultPolicyStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryService,
    (provider) =>
      new AiPolicyRegistryService(
        provider.resolve<IPolicyRepository>(
          InfrastructureTokens.AiPolicyRegistryPolicyRepository,
        ),
        provider.resolve<IPolicyCatalog>(
          InfrastructureTokens.AiPolicyRegistryPolicyCatalog,
        ),
        provider.resolve<IPolicyValidator>(
          InfrastructureTokens.AiPolicyRegistryPolicyValidator,
        ),
        provider.resolve<IPolicySerializer>(
          InfrastructureTokens.AiPolicyRegistryPolicySerializer,
        ),
        provider.resolve<IPolicyStatisticsProvider>(
          InfrastructureTokens.AiPolicyRegistryPolicyStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryRegisterPolicyUseCase,
    (provider) =>
      new RegisterPolicyUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryGetPolicyUseCase,
    (provider) =>
      new GetPolicyUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryListPoliciesUseCase,
    (provider) =>
      new ListPoliciesUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryUpdatePolicyUseCase,
    (provider) =>
      new UpdatePolicyUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryDeletePolicyUseCase,
    (provider) =>
      new DeletePolicyUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryFindPolicyByNameUseCase,
    (provider) =>
      new FindPolicyByNameUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryListPoliciesByCategoryUseCase,
    (provider) =>
      new ListPoliciesByCategoryUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryGetPolicyRegistryStatisticsUseCase,
    (provider) =>
      new GetPolicyRegistryStatisticsUseCase(
        provider.resolve<AiPolicyRegistryService>(
          InfrastructureTokens.AiPolicyRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyRegistryApplicationService,
    (provider) =>
      new AiPolicyRegistryApplicationService(
        provider.resolve<RegisterPolicyUseCase>(
          InfrastructureTokens.AiPolicyRegistryRegisterPolicyUseCase,
        ),
        provider.resolve<GetPolicyUseCase>(
          InfrastructureTokens.AiPolicyRegistryGetPolicyUseCase,
        ),
        provider.resolve<ListPoliciesUseCase>(
          InfrastructureTokens.AiPolicyRegistryListPoliciesUseCase,
        ),
        provider.resolve<UpdatePolicyUseCase>(
          InfrastructureTokens.AiPolicyRegistryUpdatePolicyUseCase,
        ),
        provider.resolve<DeletePolicyUseCase>(
          InfrastructureTokens.AiPolicyRegistryDeletePolicyUseCase,
        ),
        provider.resolve<FindPolicyByNameUseCase>(
          InfrastructureTokens.AiPolicyRegistryFindPolicyByNameUseCase,
        ),
        provider.resolve<ListPoliciesByCategoryUseCase>(
          InfrastructureTokens.AiPolicyRegistryListPoliciesByCategoryUseCase,
        ),
        provider.resolve<GetPolicyRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPolicyRegistryGetPolicyRegistryStatisticsUseCase,
        ),
      ),
  );
}
