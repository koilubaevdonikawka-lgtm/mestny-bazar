import type { IPolicySetCatalog } from "@server/application/ai-policy-set-registry/contracts/policy-set-catalog.contract";
import type { IPolicySetRepository } from "@server/application/ai-policy-set-registry/contracts/policy-set-repository.contract";
import type { IPolicySetSerializer } from "@server/application/ai-policy-set-registry/contracts/policy-set-serializer.contract";
import type { IPolicySetStatisticsProvider } from "@server/application/ai-policy-set-registry/contracts/policy-set-statistics-provider.contract";
import type { IPolicySetValidator } from "@server/application/ai-policy-set-registry/contracts/policy-set-validator.contract";
import {
  AiPolicySetRegistryApplicationService,
  AiPolicySetRegistryService,
  DeletePolicySetUseCase,
  FindPolicySetByNameUseCase,
  GetPolicySetRegistryStatisticsUseCase,
  GetPolicySetUseCase,
  ListPolicySetsByCategoryUseCase,
  ListPolicySetsUseCase,
  RegisterPolicySetUseCase,
  UpdatePolicySetUseCase,
} from "@server/application/ai-policy-set-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { PolicySetRepository } from "@server/infrastructure/ai-policy-set-registry/policy-set.repository";
import { DefaultPolicySetCatalog } from "@server/infrastructure/ai-policy-set-registry/default-policy-set.catalog";
import { DefaultPolicySetStatisticsProvider } from "@server/infrastructure/ai-policy-set-registry/default-policy-set-statistics.provider";
import { DefaultPolicySetValidator } from "@server/infrastructure/ai-policy-set-registry/default-policy-set.validator";
import { JsonPolicySetSerializer } from "@server/infrastructure/ai-policy-set-registry/json-policy-set.serializer";

/** Registers AI Policy Set Registry services and use cases. */
export function registerAiPolicySetRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPolicySetRegistryPolicySetRepository,
    () => new PolicySetRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicySetRegistryPolicySetCatalog,
    () => new DefaultPolicySetCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicySetRegistryPolicySetValidator,
    () => new DefaultPolicySetValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicySetRegistryPolicySetSerializer,
    () => new JsonPolicySetSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicySetRegistryPolicySetStatisticsProvider,
    () => new DefaultPolicySetStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryService,
    (provider) =>
      new AiPolicySetRegistryService(
        provider.resolve<IPolicySetRepository>(
          InfrastructureTokens.AiPolicySetRegistryPolicySetRepository,
        ),
        provider.resolve<IPolicySetCatalog>(
          InfrastructureTokens.AiPolicySetRegistryPolicySetCatalog,
        ),
        provider.resolve<IPolicySetValidator>(
          InfrastructureTokens.AiPolicySetRegistryPolicySetValidator,
        ),
        provider.resolve<IPolicySetSerializer>(
          InfrastructureTokens.AiPolicySetRegistryPolicySetSerializer,
        ),
        provider.resolve<IPolicySetStatisticsProvider>(
          InfrastructureTokens.AiPolicySetRegistryPolicySetStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryRegisterPolicySetUseCase,
    (provider) =>
      new RegisterPolicySetUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryGetPolicySetUseCase,
    (provider) =>
      new GetPolicySetUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryListPolicySetsUseCase,
    (provider) =>
      new ListPolicySetsUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryUpdatePolicySetUseCase,
    (provider) =>
      new UpdatePolicySetUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryDeletePolicySetUseCase,
    (provider) =>
      new DeletePolicySetUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryFindPolicySetByNameUseCase,
    (provider) =>
      new FindPolicySetByNameUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryListPolicySetsByCategoryUseCase,
    (provider) =>
      new ListPolicySetsByCategoryUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryGetPolicySetRegistryStatisticsUseCase,
    (provider) =>
      new GetPolicySetRegistryStatisticsUseCase(
        provider.resolve<AiPolicySetRegistryService>(
          InfrastructureTokens.AiPolicySetRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicySetRegistryApplicationService,
    (provider) =>
      new AiPolicySetRegistryApplicationService(
        provider.resolve<RegisterPolicySetUseCase>(
          InfrastructureTokens.AiPolicySetRegistryRegisterPolicySetUseCase,
        ),
        provider.resolve<GetPolicySetUseCase>(
          InfrastructureTokens.AiPolicySetRegistryGetPolicySetUseCase,
        ),
        provider.resolve<ListPolicySetsUseCase>(
          InfrastructureTokens.AiPolicySetRegistryListPolicySetsUseCase,
        ),
        provider.resolve<UpdatePolicySetUseCase>(
          InfrastructureTokens.AiPolicySetRegistryUpdatePolicySetUseCase,
        ),
        provider.resolve<DeletePolicySetUseCase>(
          InfrastructureTokens.AiPolicySetRegistryDeletePolicySetUseCase,
        ),
        provider.resolve<FindPolicySetByNameUseCase>(
          InfrastructureTokens.AiPolicySetRegistryFindPolicySetByNameUseCase,
        ),
        provider.resolve<ListPolicySetsByCategoryUseCase>(
          InfrastructureTokens.AiPolicySetRegistryListPolicySetsByCategoryUseCase,
        ),
        provider.resolve<GetPolicySetRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPolicySetRegistryGetPolicySetRegistryStatisticsUseCase,
        ),
      ),
  );
}
