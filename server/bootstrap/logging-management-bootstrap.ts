import type { ILogExporter } from "@server/application/logging-management/contracts/log-exporter.contract";
import type { ILogFilter } from "@server/application/logging-management/contracts/log-filter.contract";
import type { ILogFormatter } from "@server/application/logging-management/contracts/log-formatter.contract";
import type { ILogRepository } from "@server/application/logging-management/contracts/log-repository.contract";
import type { ILogRetentionPolicy } from "@server/application/logging-management/contracts/log-retention-policy.contract";
import {
  ClearLogsUseCase,
  DeleteLogUseCase,
  ExportLogsUseCase,
  FilterLogsUseCase,
  GetLogUseCase,
  ListLogsUseCase,
  LoggingManagementApplicationService,
  LoggingManagementService,
  SearchLogsUseCase,
  WriteLogUseCase,
} from "@server/application/logging-management";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { DefaultLogFilter } from "@server/infrastructure/logging-management/default-log.filter";
import { DefaultLogRetentionPolicy } from "@server/infrastructure/logging-management/default-log-retention.policy";
import { JsonLogExporter } from "@server/infrastructure/logging-management/json-log.exporter";
import { JsonLogFormatter } from "@server/infrastructure/logging-management/json-log.formatter";
import { LogRepository } from "@server/infrastructure/logging-management/log.repository";

/** Registers logging management services and use cases. */
export function registerLoggingManagementApplication(registry: ServiceRegistry): void {
  registry.registerSingleton(InfrastructureTokens.LoggingManagementLogRepository, () =>
    new LogRepository(),
  );

  registry.registerSingleton(InfrastructureTokens.LoggingManagementLogFormatter, () =>
    new JsonLogFormatter(),
  );

  registry.registerSingleton(InfrastructureTokens.LoggingManagementLogFilter, () =>
    new DefaultLogFilter(),
  );

  registry.registerSingleton(InfrastructureTokens.LoggingManagementLogExporter, () =>
    new JsonLogExporter(),
  );

  registry.registerSingleton(InfrastructureTokens.LoggingManagementLogRetentionPolicy, () =>
    new DefaultLogRetentionPolicy(),
  );

  registry.registerTransient(InfrastructureTokens.LoggingManagementService, (provider) =>
    new LoggingManagementService(
      provider.resolve<ILogRepository>(InfrastructureTokens.LoggingManagementLogRepository),
      provider.resolve<ILogFormatter>(InfrastructureTokens.LoggingManagementLogFormatter),
      provider.resolve<ILogFilter>(InfrastructureTokens.LoggingManagementLogFilter),
      provider.resolve<ILogExporter>(InfrastructureTokens.LoggingManagementLogExporter),
      provider.resolve<ILogRetentionPolicy>(
        InfrastructureTokens.LoggingManagementLogRetentionPolicy,
      ),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    ),
  );

  registry.registerTransient(
    InfrastructureTokens.LoggingManagementWriteLogUseCase,
    (provider) =>
      new WriteLogUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementGetLogUseCase,
    (provider) =>
      new GetLogUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementListLogsUseCase,
    (provider) =>
      new ListLogsUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementDeleteLogUseCase,
    (provider) =>
      new DeleteLogUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementClearLogsUseCase,
    (provider) =>
      new ClearLogsUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementSearchLogsUseCase,
    (provider) =>
      new SearchLogsUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementFilterLogsUseCase,
    (provider) =>
      new FilterLogsUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );
  registry.registerTransient(
    InfrastructureTokens.LoggingManagementExportLogsUseCase,
    (provider) =>
      new ExportLogsUseCase(
        provider.resolve<LoggingManagementService>(InfrastructureTokens.LoggingManagementService),
      ),
  );

  registry.registerTransient(
    InfrastructureTokens.LoggingManagementApplicationService,
    (provider) =>
      new LoggingManagementApplicationService(
        provider.resolve<WriteLogUseCase>(InfrastructureTokens.LoggingManagementWriteLogUseCase),
        provider.resolve<GetLogUseCase>(InfrastructureTokens.LoggingManagementGetLogUseCase),
        provider.resolve<ListLogsUseCase>(InfrastructureTokens.LoggingManagementListLogsUseCase),
        provider.resolve<DeleteLogUseCase>(InfrastructureTokens.LoggingManagementDeleteLogUseCase),
        provider.resolve<ClearLogsUseCase>(InfrastructureTokens.LoggingManagementClearLogsUseCase),
        provider.resolve<SearchLogsUseCase>(
          InfrastructureTokens.LoggingManagementSearchLogsUseCase,
        ),
        provider.resolve<FilterLogsUseCase>(
          InfrastructureTokens.LoggingManagementFilterLogsUseCase,
        ),
        provider.resolve<ExportLogsUseCase>(
          InfrastructureTokens.LoggingManagementExportLogsUseCase,
        ),
      ),
  );
}
