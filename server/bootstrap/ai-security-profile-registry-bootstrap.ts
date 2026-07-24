import type { ISecurityProfileCatalog } from "@server/application/ai-security-profile-registry/contracts/security-profile-catalog.contract";
import type { ISecurityProfileRepository } from "@server/application/ai-security-profile-registry/contracts/security-profile-repository.contract";
import type { ISecurityProfileSerializer } from "@server/application/ai-security-profile-registry/contracts/security-profile-serializer.contract";
import type { ISecurityProfileStatisticsProvider } from "@server/application/ai-security-profile-registry/contracts/security-profile-statistics-provider.contract";
import type { ISecurityProfileValidator } from "@server/application/ai-security-profile-registry/contracts/security-profile-validator.contract";
import {
  AiSecurityProfileRegistryApplicationService,
  AiSecurityProfileRegistryService,
  DeleteSecurityProfileUseCase,
  FindSecurityProfileByNameUseCase,
  GetSecurityProfileRegistryStatisticsUseCase,
  GetSecurityProfileUseCase,
  ListSecurityProfilesByCategoryUseCase,
  ListSecurityProfilesUseCase,
  RegisterSecurityProfileUseCase,
  UpdateSecurityProfileUseCase,
} from "@server/application/ai-security-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { SecurityProfileRepository } from "@server/infrastructure/ai-security-profile-registry/security-profile.repository";
import { DefaultSecurityProfileCatalog } from "@server/infrastructure/ai-security-profile-registry/default-security-profile.catalog";
import { DefaultSecurityProfileStatisticsProvider } from "@server/infrastructure/ai-security-profile-registry/default-security-profile-statistics.provider";
import { DefaultSecurityProfileValidator } from "@server/infrastructure/ai-security-profile-registry/default-security-profile.validator";
import { JsonSecurityProfileSerializer } from "@server/infrastructure/ai-security-profile-registry/json-security-profile.serializer";

/** Registers AI Security Profile Registry services and use cases. */
export function registerAiSecurityProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileRepository,
    () => new SecurityProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileCatalog,
    () => new DefaultSecurityProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileValidator,
    () => new DefaultSecurityProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileSerializer,
    () => new JsonSecurityProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileStatisticsProvider,
    () => new DefaultSecurityProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryService,
    (provider) =>
      new AiSecurityProfileRegistryService(
        provider.resolve<ISecurityProfileRepository>(
          InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileRepository,
        ),
        provider.resolve<ISecurityProfileCatalog>(
          InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileCatalog,
        ),
        provider.resolve<ISecurityProfileValidator>(
          InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileValidator,
        ),
        provider.resolve<ISecurityProfileSerializer>(
          InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileSerializer,
        ),
        provider.resolve<ISecurityProfileStatisticsProvider>(
          InfrastructureTokens.AiSecurityProfileRegistrySecurityProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryRegisterSecurityProfileUseCase,
    (provider) =>
      new RegisterSecurityProfileUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryGetSecurityProfileUseCase,
    (provider) =>
      new GetSecurityProfileUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryListSecurityProfilesUseCase,
    (provider) =>
      new ListSecurityProfilesUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryUpdateSecurityProfileUseCase,
    (provider) =>
      new UpdateSecurityProfileUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryDeleteSecurityProfileUseCase,
    (provider) =>
      new DeleteSecurityProfileUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryFindSecurityProfileByNameUseCase,
    (provider) =>
      new FindSecurityProfileByNameUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryListSecurityProfilesByCategoryUseCase,
    (provider) =>
      new ListSecurityProfilesByCategoryUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryGetSecurityProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetSecurityProfileRegistryStatisticsUseCase(
        provider.resolve<AiSecurityProfileRegistryService>(
          InfrastructureTokens.AiSecurityProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiSecurityProfileRegistryApplicationService,
    (provider) =>
      new AiSecurityProfileRegistryApplicationService(
        provider.resolve<RegisterSecurityProfileUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryRegisterSecurityProfileUseCase,
        ),
        provider.resolve<GetSecurityProfileUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryGetSecurityProfileUseCase,
        ),
        provider.resolve<ListSecurityProfilesUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryListSecurityProfilesUseCase,
        ),
        provider.resolve<UpdateSecurityProfileUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryUpdateSecurityProfileUseCase,
        ),
        provider.resolve<DeleteSecurityProfileUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryDeleteSecurityProfileUseCase,
        ),
        provider.resolve<FindSecurityProfileByNameUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryFindSecurityProfileByNameUseCase,
        ),
        provider.resolve<ListSecurityProfilesByCategoryUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryListSecurityProfilesByCategoryUseCase,
        ),
        provider.resolve<GetSecurityProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiSecurityProfileRegistryGetSecurityProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
