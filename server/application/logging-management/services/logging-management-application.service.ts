import type {
  FilterLogsInput,
  SearchLogsInput,
  WriteLogInput,
} from "@server/application/logging-management/models/log-entry.model";
import {
  ClearLogsUseCase,
  DeleteLogUseCase,
  ExportLogsUseCase,
  FilterLogsUseCase,
  GetLogUseCase,
  ListLogsUseCase,
  SearchLogsUseCase,
  WriteLogUseCase,
} from "@server/application/logging-management/use-cases/logging-management.use-cases";

/** Application facade for logging management scenario. */
export class LoggingManagementApplicationService {
  constructor(
    private readonly writeLogUseCase: WriteLogUseCase,
    private readonly getLogUseCase: GetLogUseCase,
    private readonly listLogsUseCase: ListLogsUseCase,
    private readonly deleteLogUseCase: DeleteLogUseCase,
    private readonly clearLogsUseCase: ClearLogsUseCase,
    private readonly searchLogsUseCase: SearchLogsUseCase,
    private readonly filterLogsUseCase: FilterLogsUseCase,
    private readonly exportLogsUseCase: ExportLogsUseCase,
  ) {}

  writeLog(input: WriteLogInput) {
    return this.writeLogUseCase.execute(input);
  }

  getLog(logId: string) {
    return this.getLogUseCase.execute(logId);
  }

  listLogs() {
    return this.listLogsUseCase.execute();
  }

  deleteLog(logId: string) {
    return this.deleteLogUseCase.execute(logId);
  }

  clearLogs() {
    return this.clearLogsUseCase.execute();
  }

  searchLogs(input: SearchLogsInput) {
    return this.searchLogsUseCase.execute(input);
  }

  filterLogs(input: FilterLogsInput) {
    return this.filterLogsUseCase.execute(input);
  }

  exportLogs() {
    return this.exportLogsUseCase.execute();
  }
}
