import type { IComplianceProfileCatalog } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-catalog.contract";
import type { IComplianceProfileRepository } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-repository.contract";
import type { IComplianceProfileSerializer } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-serializer.contract";
import type { IComplianceProfileStatisticsProvider } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-statistics-provider.contract";
import type { IComplianceProfileValidator } from "@server/application/ai-compliance-profile-registry/contracts/compliance-profile-validator.contract";
import {
  AiComplianceProfileRegistryApplicationService,
  AiComplianceProfileRegistryService,
  DeleteComplianceProfileUseCase,
  FindComplianceProfileByNameUseCase,
  GetComplianceProfileRegistryStatisticsUseCase,
  GetComplianceProfileUseCase,
  ListComplianceProfilesByCategoryUseCase,
  ListComplianceProfilesUseCase,
  RegisterComplianceProfileUseCase,
  UpdateComplianceProfileUseCase,
} from "@server/application/ai-compliance-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { ComplianceProfileRepository } from "@server/infrastructure/ai-compliance-profile-registry/compliance-profile.repository";
import { DefaultComplianceProfileCatalog } from "@server/infrastructure/ai-compliance-profile-registry/default-compliance-profile.catalog";
import { DefaultComplianceProfileStatisticsProvider } from "@server/infrastructure/ai-compliance-profile-registry/default-compliance-profile-statistics.provider";
import { DefaultComplianceProfileValidator } from "@server/infrastructure/ai-compliance-profile-registry/default-compliance-profile.validator";
import { JsonComplianceProfileSerializer } from "@server/infrastructure/ai-compliance-profile-registry/json-compliance-profile.serializer";

/** Registers AI Compliance Profile Registry services and use cases. */
export function registerAiComplianceProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileRepository,
    () => new ComplianceProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileCatalog,
    () => new DefaultComplianceProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileValidator,
    () => new DefaultComplianceProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileSerializer,
    () => new JsonComplianceProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileStatisticsProvider,
    () => new DefaultComplianceProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryService,
    (provider) =>
      new AiComplianceProfileRegistryService(
        provider.resolve<IComplianceProfileRepository>(
          InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileRepository,
        ),
        provider.resolve<IComplianceProfileCatalog>(
          InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileCatalog,
        ),
        provider.resolve<IComplianceProfileValidator>(
          InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileValidator,
        ),
        provider.resolve<IComplianceProfileSerializer>(
          InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileSerializer,
        ),
        provider.resolve<IComplianceProfileStatisticsProvider>(
          InfrastructureTokens.AiComplianceProfileRegistryComplianceProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryRegisterComplianceProfileUseCase,
    (provider) =>
      new RegisterComplianceProfileUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryGetComplianceProfileUseCase,
    (provider) =>
      new GetComplianceProfileUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryListComplianceProfilesUseCase,
    (provider) =>
      new ListComplianceProfilesUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryUpdateComplianceProfileUseCase,
    (provider) =>
      new UpdateComplianceProfileUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryDeleteComplianceProfileUseCase,
    (provider) =>
      new DeleteComplianceProfileUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryFindComplianceProfileByNameUseCase,
    (provider) =>
      new FindComplianceProfileByNameUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryListComplianceProfilesByCategoryUseCase,
    (provider) =>
      new ListComplianceProfilesByCategoryUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryGetComplianceProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetComplianceProfileRegistryStatisticsUseCase(
        provider.resolve<AiComplianceProfileRegistryService>(
          InfrastructureTokens.AiComplianceProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiComplianceProfileRegistryApplicationService,
    (provider) =>
      new AiComplianceProfileRegistryApplicationService(
        provider.resolve<RegisterComplianceProfileUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryRegisterComplianceProfileUseCase,
        ),
        provider.resolve<GetComplianceProfileUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryGetComplianceProfileUseCase,
        ),
        provider.resolve<ListComplianceProfilesUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryListComplianceProfilesUseCase,
        ),
        provider.resolve<UpdateComplianceProfileUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryUpdateComplianceProfileUseCase,
        ),
        provider.resolve<DeleteComplianceProfileUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryDeleteComplianceProfileUseCase,
        ),
        provider.resolve<FindComplianceProfileByNameUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryFindComplianceProfileByNameUseCase,
        ),
        provider.resolve<ListComplianceProfilesByCategoryUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryListComplianceProfilesByCategoryUseCase,
        ),
        provider.resolve<GetComplianceProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiComplianceProfileRegistryGetComplianceProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
