import type { IAuditEventPublisher } from "@server/application/audit-management/contracts/audit-event-publisher.contract";
import type { IAuditFormatter } from "@server/application/audit-management/contracts/audit-formatter.contract";
import type { IAuditRepository } from "@server/application/audit-management/contracts/audit-repository.contract";
import type { IAuditRetentionPolicy } from "@server/application/audit-management/contracts/audit-retention-policy.contract";
import {
  AuditManagementApplicationService,
  AuditManagementService,
  GetAuditByDateRangeUseCase,
  GetAuditByEventTypeUseCase,
  GetAuditByModuleUseCase,
  GetAuditByUserUseCase,
  GetAuditEntryUseCase,
  GetAuditLogUseCase,
  WriteAuditEntryUseCase,
} from "@server/application/audit-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { AuditRepository } from "@server/infrastructure/audit-management/audit.repository";
import { DefaultAuditFormatter } from "@server/infrastructure/audit-management/default-audit-formatter";
import { DefaultAuditRetentionPolicy } from "@server/infrastructure/audit-management/default-audit-retention-policy";
import { NoopAuditEventPublisher } from "@server/infrastructure/audit-management/noop-audit-event.publisher";

/** Registers audit management services and use cases. */
export function registerAuditManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.AuditManagementRetentionPolicy, () =>
    new DefaultAuditRetentionPolicy(),
  );

  registry.registerSingleton(InfrastructureTokens.AuditManagementRepository, (provider) =>
    new AuditRepository(
      provider.resolve<IAuditRetentionPolicy>(InfrastructureTokens.AuditManagementRetentionPolicy),
    ),
  );

  registry.registerSingleton(InfrastructureTokens.AuditManagementFormatter, () =>
    new DefaultAuditFormatter(),
  );

  registry.registerSingleton(InfrastructureTokens.AuditManagementEventPublisher, () =>
    new NoopAuditEventPublisher(),
  );

  registry.registerTransient(InfrastructureTokens.AuditManagementService, (provider) =>
    new AuditManagementService(
      provider.resolve<IAuditRepository>(InfrastructureTokens.AuditManagementRepository),
      provider.resolve<IAuditFormatter>(InfrastructureTokens.AuditManagementFormatter),
      provider.resolve<IAuditRetentionPolicy>(InfrastructureTokens.AuditManagementRetentionPolicy),
      provider.resolve<IAuditEventPublisher>(InfrastructureTokens.AuditManagementEventPublisher),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.AuditManagementWriteAuditEntryUseCase,
    (provider) =>
      new WriteAuditEntryUseCase(
        provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
      ),
  );
  registry.registerTransient(InfrastructureTokens.AuditManagementGetAuditEntryUseCase, (provider) =>
    new GetAuditEntryUseCase(
      provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AuditManagementGetAuditLogUseCase, (provider) =>
    new GetAuditLogUseCase(
      provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
    ),
  );
  registry.registerTransient(InfrastructureTokens.AuditManagementGetAuditByUserUseCase, (provider) =>
    new GetAuditByUserUseCase(
      provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
    ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuditManagementGetAuditByModuleUseCase,
    (provider) =>
      new GetAuditByModuleUseCase(
        provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuditManagementGetAuditByEventTypeUseCase,
    (provider) =>
      new GetAuditByEventTypeUseCase(
        provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.AuditManagementGetAuditByDateRangeUseCase,
    (provider) =>
      new GetAuditByDateRangeUseCase(
        provider.resolve<AuditManagementService>(InfrastructureTokens.AuditManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.AuditManagementApplicationService,
    (provider) =>
      new AuditManagementApplicationService(
        provider.resolve<WriteAuditEntryUseCase>(
          InfrastructureTokens.AuditManagementWriteAuditEntryUseCase,
        ),
        provider.resolve<GetAuditEntryUseCase>(
          InfrastructureTokens.AuditManagementGetAuditEntryUseCase,
        ),
        provider.resolve<GetAuditLogUseCase>(InfrastructureTokens.AuditManagementGetAuditLogUseCase),
        provider.resolve<GetAuditByUserUseCase>(
          InfrastructureTokens.AuditManagementGetAuditByUserUseCase,
        ),
        provider.resolve<GetAuditByModuleUseCase>(
          InfrastructureTokens.AuditManagementGetAuditByModuleUseCase,
        ),
        provider.resolve<GetAuditByEventTypeUseCase>(
          InfrastructureTokens.AuditManagementGetAuditByEventTypeUseCase,
        ),
        provider.resolve<GetAuditByDateRangeUseCase>(
          InfrastructureTokens.AuditManagementGetAuditByDateRangeUseCase,
        ),
      ),
  );
}
