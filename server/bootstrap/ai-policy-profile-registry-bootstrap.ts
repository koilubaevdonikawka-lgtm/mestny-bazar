import type { IPolicyProfileCatalog } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-catalog.contract";
import type { IPolicyProfileRepository } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-repository.contract";
import type { IPolicyProfileSerializer } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-serializer.contract";
import type { IPolicyProfileStatisticsProvider } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-statistics-provider.contract";
import type { IPolicyProfileValidator } from "@server/application/ai-policy-profile-registry/contracts/policy-profile-validator.contract";
import {
  AiPolicyProfileRegistryApplicationService,
  AiPolicyProfileRegistryService,
  DeletePolicyProfileUseCase,
  FindPolicyProfileByNameUseCase,
  GetPolicyProfileRegistryStatisticsUseCase,
  GetPolicyProfileUseCase,
  ListPolicyProfilesByCategoryUseCase,
  ListPolicyProfilesUseCase,
  RegisterPolicyProfileUseCase,
  UpdatePolicyProfileUseCase,
} from "@server/application/ai-policy-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { PolicyProfileRepository } from "@server/infrastructure/ai-policy-profile-registry/policy-profile.repository";
import { DefaultPolicyProfileCatalog } from "@server/infrastructure/ai-policy-profile-registry/default-policy-profile.catalog";
import { DefaultPolicyProfileStatisticsProvider } from "@server/infrastructure/ai-policy-profile-registry/default-policy-profile-statistics.provider";
import { DefaultPolicyProfileValidator } from "@server/infrastructure/ai-policy-profile-registry/default-policy-profile.validator";
import { JsonPolicyProfileSerializer } from "@server/infrastructure/ai-policy-profile-registry/json-policy-profile.serializer";

/** Registers AI Policy Profile Registry services and use cases. */
export function registerAiPolicyProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileRepository,
    () => new PolicyProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileCatalog,
    () => new DefaultPolicyProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileValidator,
    () => new DefaultPolicyProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileSerializer,
    () => new JsonPolicyProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileStatisticsProvider,
    () => new DefaultPolicyProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryService,
    (provider) =>
      new AiPolicyProfileRegistryService(
        provider.resolve<IPolicyProfileRepository>(
          InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileRepository,
        ),
        provider.resolve<IPolicyProfileCatalog>(
          InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileCatalog,
        ),
        provider.resolve<IPolicyProfileValidator>(
          InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileValidator,
        ),
        provider.resolve<IPolicyProfileSerializer>(
          InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileSerializer,
        ),
        provider.resolve<IPolicyProfileStatisticsProvider>(
          InfrastructureTokens.AiPolicyProfileRegistryPolicyProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryRegisterPolicyProfileUseCase,
    (provider) =>
      new RegisterPolicyProfileUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryGetPolicyProfileUseCase,
    (provider) =>
      new GetPolicyProfileUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryListPolicyProfilesUseCase,
    (provider) =>
      new ListPolicyProfilesUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryUpdatePolicyProfileUseCase,
    (provider) =>
      new UpdatePolicyProfileUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryDeletePolicyProfileUseCase,
    (provider) =>
      new DeletePolicyProfileUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryFindPolicyProfileByNameUseCase,
    (provider) =>
      new FindPolicyProfileByNameUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryListPolicyProfilesByCategoryUseCase,
    (provider) =>
      new ListPolicyProfilesByCategoryUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryGetPolicyProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetPolicyProfileRegistryStatisticsUseCase(
        provider.resolve<AiPolicyProfileRegistryService>(
          InfrastructureTokens.AiPolicyProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiPolicyProfileRegistryApplicationService,
    (provider) =>
      new AiPolicyProfileRegistryApplicationService(
        provider.resolve<RegisterPolicyProfileUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryRegisterPolicyProfileUseCase,
        ),
        provider.resolve<GetPolicyProfileUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryGetPolicyProfileUseCase,
        ),
        provider.resolve<ListPolicyProfilesUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryListPolicyProfilesUseCase,
        ),
        provider.resolve<UpdatePolicyProfileUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryUpdatePolicyProfileUseCase,
        ),
        provider.resolve<DeletePolicyProfileUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryDeletePolicyProfileUseCase,
        ),
        provider.resolve<FindPolicyProfileByNameUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryFindPolicyProfileByNameUseCase,
        ),
        provider.resolve<ListPolicyProfilesByCategoryUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryListPolicyProfilesByCategoryUseCase,
        ),
        provider.resolve<GetPolicyProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiPolicyProfileRegistryGetPolicyProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
