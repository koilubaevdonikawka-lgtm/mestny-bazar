import type { IAuditProfileCatalog } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-catalog.contract";
import type { IAuditProfileRepository } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-repository.contract";
import type { IAuditProfileSerializer } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-serializer.contract";
import type { IAuditProfileStatisticsProvider } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-statistics-provider.contract";
import type { IAuditProfileValidator } from "@server/application/ai-audit-profile-registry/contracts/audit-profile-validator.contract";
import {
  AiAuditProfileRegistryApplicationService,
  AiAuditProfileRegistryService,
  DeleteAuditProfileUseCase,
  FindAuditProfileByNameUseCase,
  GetAuditProfileRegistryStatisticsUseCase,
  GetAuditProfileUseCase,
  ListAuditProfilesByCategoryUseCase,
  ListAuditProfilesUseCase,
  RegisterAuditProfileUseCase,
  UpdateAuditProfileUseCase,
} from "@server/application/ai-audit-profile-registry";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AuditProfileRepository } from "@server/infrastructure/ai-audit-profile-registry/audit-profile.repository";
import { DefaultAuditProfileCatalog } from "@server/infrastructure/ai-audit-profile-registry/default-audit-profile.catalog";
import { DefaultAuditProfileStatisticsProvider } from "@server/infrastructure/ai-audit-profile-registry/default-audit-profile-statistics.provider";
import { DefaultAuditProfileValidator } from "@server/infrastructure/ai-audit-profile-registry/default-audit-profile.validator";
import { JsonAuditProfileSerializer } from "@server/infrastructure/ai-audit-profile-registry/json-audit-profile.serializer";

/** Registers AI Audit Profile Registry services and use cases. */
export function registerAiAuditProfileRegistryApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(
    InfrastructureTokens.AiAuditProfileRegistryAuditProfileRepository,
    () => new AuditProfileRepository(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAuditProfileRegistryAuditProfileCatalog,
    () => new DefaultAuditProfileCatalog(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAuditProfileRegistryAuditProfileValidator,
    () => new DefaultAuditProfileValidator(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAuditProfileRegistryAuditProfileSerializer,
    () => new JsonAuditProfileSerializer(),
  );

  registry.registerSingleton(
    InfrastructureTokens.AiAuditProfileRegistryAuditProfileStatisticsProvider,
    () => new DefaultAuditProfileStatisticsProvider(),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryService,
    (provider) =>
      new AiAuditProfileRegistryService(
        provider.resolve<IAuditProfileRepository>(
          InfrastructureTokens.AiAuditProfileRegistryAuditProfileRepository,
        ),
        provider.resolve<IAuditProfileCatalog>(
          InfrastructureTokens.AiAuditProfileRegistryAuditProfileCatalog,
        ),
        provider.resolve<IAuditProfileValidator>(
          InfrastructureTokens.AiAuditProfileRegistryAuditProfileValidator,
        ),
        provider.resolve<IAuditProfileSerializer>(
          InfrastructureTokens.AiAuditProfileRegistryAuditProfileSerializer,
        ),
        provider.resolve<IAuditProfileStatisticsProvider>(
          InfrastructureTokens.AiAuditProfileRegistryAuditProfileStatisticsProvider,
        ),
        provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryRegisterAuditProfileUseCase,
    (provider) =>
      new RegisterAuditProfileUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryGetAuditProfileUseCase,
    (provider) =>
      new GetAuditProfileUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryListAuditProfilesUseCase,
    (provider) =>
      new ListAuditProfilesUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryUpdateAuditProfileUseCase,
    (provider) =>
      new UpdateAuditProfileUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryDeleteAuditProfileUseCase,
    (provider) =>
      new DeleteAuditProfileUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryFindAuditProfileByNameUseCase,
    (provider) =>
      new FindAuditProfileByNameUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryListAuditProfilesByCategoryUseCase,
    (provider) =>
      new ListAuditProfilesByCategoryUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryGetAuditProfileRegistryStatisticsUseCase,
    (provider) =>
      new GetAuditProfileRegistryStatisticsUseCase(
        provider.resolve<AiAuditProfileRegistryService>(
          InfrastructureTokens.AiAuditProfileRegistryService,
        ),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AiAuditProfileRegistryApplicationService,
    (provider) =>
      new AiAuditProfileRegistryApplicationService(
        provider.resolve<RegisterAuditProfileUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryRegisterAuditProfileUseCase,
        ),
        provider.resolve<GetAuditProfileUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryGetAuditProfileUseCase,
        ),
        provider.resolve<ListAuditProfilesUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryListAuditProfilesUseCase,
        ),
        provider.resolve<UpdateAuditProfileUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryUpdateAuditProfileUseCase,
        ),
        provider.resolve<DeleteAuditProfileUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryDeleteAuditProfileUseCase,
        ),
        provider.resolve<FindAuditProfileByNameUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryFindAuditProfileByNameUseCase,
        ),
        provider.resolve<ListAuditProfilesByCategoryUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryListAuditProfilesByCategoryUseCase,
        ),
        provider.resolve<GetAuditProfileRegistryStatisticsUseCase>(
          InfrastructureTokens.AiAuditProfileRegistryGetAuditProfileRegistryStatisticsUseCase,
        ),
      ),
  );
}
