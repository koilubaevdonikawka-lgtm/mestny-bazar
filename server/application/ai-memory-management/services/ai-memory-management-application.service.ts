import type {
  RegisterMemoryRecordInput,
  UpdateMemoryRecordInput,
} from "@server/application/ai-memory-management/models/memory-record.model";
import {
  DeleteMemoryRecordUseCase,
  FindMemoryRecordsByKeyUseCase,
  GetMemoryRecordUseCase,
  GetMemoryStatisticsUseCase,
  ListMemoryRecordsByCategoryUseCase,
  ListMemoryRecordsUseCase,
  RegisterMemoryRecordUseCase,
  UpdateMemoryRecordUseCase,
} from "@server/application/ai-memory-management/use-cases/ai-memory-management.use-cases";

/** Application facade for AI Memory Management scenario. */
export class AiMemoryManagementApplicationService {
  constructor(
    private readonly registerMemoryRecordUseCase: RegisterMemoryRecordUseCase,
    private readonly getMemoryRecordUseCase: GetMemoryRecordUseCase,
    private readonly listMemoryRecordsUseCase: ListMemoryRecordsUseCase,
    private readonly updateMemoryRecordUseCase: UpdateMemoryRecordUseCase,
    private readonly deleteMemoryRecordUseCase: DeleteMemoryRecordUseCase,
    private readonly findMemoryRecordsByKeyUseCase: FindMemoryRecordsByKeyUseCase,
    private readonly listMemoryRecordsByCategoryUseCase: ListMemoryRecordsByCategoryUseCase,
    private readonly getMemoryStatisticsUseCase: GetMemoryStatisticsUseCase,
  ) {}

  registerMemoryRecord(input: RegisterMemoryRecordInput) {
    return this.registerMemoryRecordUseCase.execute(input);
  }

  getMemoryRecord(memoryId: string) {
    return this.getMemoryRecordUseCase.execute(memoryId);
  }

  listMemoryRecords() {
    return this.listMemoryRecordsUseCase.execute();
  }

  updateMemoryRecord(input: UpdateMemoryRecordInput) {
    return this.updateMemoryRecordUseCase.execute(input);
  }

  deleteMemoryRecord(memoryId: string) {
    return this.deleteMemoryRecordUseCase.execute(memoryId);
  }

  findMemoryRecordsByKey(key: string) {
    return this.findMemoryRecordsByKeyUseCase.execute(key);
  }

  listMemoryRecordsByCategory(category: string) {
    return this.listMemoryRecordsByCategoryUseCase.execute(category);
  }

  getMemoryStatistics() {
    return this.getMemoryStatisticsUseCase.execute();
  }
}
