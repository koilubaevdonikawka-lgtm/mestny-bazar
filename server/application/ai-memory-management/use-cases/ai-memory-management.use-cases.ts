import type {
  DeleteMemoryRecordResult,
  FindMemoryRecordsByKeyResult,
  ListMemoryRecordsByCategoryResult,
  ListMemoryRecordsResult,
  MemoryRecord,
  MemoryStatistics,
  RegisterMemoryRecordInput,
  UpdateMemoryRecordInput,
} from "@server/application/ai-memory-management/models/memory-record.model";
import type { AiMemoryManagementService } from "@server/application/ai-memory-management/services/ai-memory-management.service";
import type { UseCaseResult } from "@server/application/shared";
import { useCaseResult } from "@server/application/shared";

export class RegisterMemoryRecordUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(input: RegisterMemoryRecordInput): Promise<UseCaseResult<MemoryRecord>> {
    return this.memoryManagement.registerMemoryRecord(input).then(useCaseResult);
  }
}

export class GetMemoryRecordUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(memoryId: string): Promise<UseCaseResult<MemoryRecord | null>> {
    return this.memoryManagement.getMemoryRecord(memoryId).then(useCaseResult);
  }
}

export class ListMemoryRecordsUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(): Promise<UseCaseResult<ListMemoryRecordsResult>> {
    return this.memoryManagement.listMemoryRecords().then(useCaseResult);
  }
}

export class UpdateMemoryRecordUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(input: UpdateMemoryRecordInput): Promise<UseCaseResult<MemoryRecord>> {
    return this.memoryManagement.updateMemoryRecord(input).then(useCaseResult);
  }
}

export class DeleteMemoryRecordUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(memoryId: string): Promise<UseCaseResult<DeleteMemoryRecordResult>> {
    return this.memoryManagement.deleteMemoryRecord(memoryId).then(useCaseResult);
  }
}

export class FindMemoryRecordsByKeyUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(key: string): Promise<UseCaseResult<FindMemoryRecordsByKeyResult>> {
    return this.memoryManagement.findMemoryRecordsByKey(key).then(useCaseResult);
  }
}

export class ListMemoryRecordsByCategoryUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(category: string): Promise<UseCaseResult<ListMemoryRecordsByCategoryResult>> {
    return this.memoryManagement.listMemoryRecordsByCategory(category).then(useCaseResult);
  }
}

export class GetMemoryStatisticsUseCase {
  constructor(private readonly memoryManagement: AiMemoryManagementService) {}

  execute(): Promise<UseCaseResult<MemoryStatistics>> {
    return this.memoryManagement.getMemoryStatistics().then(useCaseResult);
  }
}
