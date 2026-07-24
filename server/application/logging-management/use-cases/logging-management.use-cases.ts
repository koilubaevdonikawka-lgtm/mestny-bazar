import type {
  ClearLogsResult,
  ExportLogsResult,
  FilterLogsInput,
  ListLogsResult,
  LogEntry,
  SearchLogsInput,
  WriteLogInput,
} from "@server/application/logging-management/models/log-entry.model";
import type { LoggingManagementService } from "@server/application/logging-management/services/logging-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class WriteLogUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(input: WriteLogInput): Promise<UseCaseResult<LogEntry>> {
    return this.logging.writeLog(input).then(useCaseResult);
  }
}

export class GetLogUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(logId: string): Promise<UseCaseResult<LogEntry | null>> {
    return this.logging.getLog(logId).then(useCaseResult);
  }
}

export class ListLogsUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(): Promise<UseCaseResult<ListLogsResult>> {
    return this.logging.listLogs().then(useCaseResult);
  }
}

export class DeleteLogUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(logId: string): Promise<UseCaseResult<{ logId: string; deleted: boolean }>> {
    return this.logging.deleteLog(logId).then(useCaseResult);
  }
}

export class ClearLogsUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(): Promise<UseCaseResult<ClearLogsResult>> {
    return this.logging.clearLogs().then(useCaseResult);
  }
}

export class SearchLogsUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(input: SearchLogsInput): Promise<UseCaseResult<ListLogsResult>> {
    return this.logging.searchLogs(input).then(useCaseResult);
  }
}

export class FilterLogsUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(input: FilterLogsInput): Promise<UseCaseResult<ListLogsResult>> {
    return this.logging.filterLogs(input).then(useCaseResult);
  }
}

export class ExportLogsUseCase {
  constructor(private readonly logging: LoggingManagementService) {}

  execute(): Promise<UseCaseResult<ExportLogsResult>> {
    return this.logging.exportLogs().then(useCaseResult);
  }
}
