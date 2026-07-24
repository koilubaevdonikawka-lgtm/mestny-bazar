export type { IMemoryRepository } from "./contracts/memory-repository.contract";
export type { IMemoryCatalog } from "./contracts/memory-catalog.contract";
export type {
  IMemoryValidator,
  MemoryValidationResult,
} from "./contracts/memory-validator.contract";
export type { IMemorySerializer } from "./contracts/memory-serializer.contract";
export type { IMemoryStatisticsProvider } from "./contracts/memory-statistics-provider.contract";
export type { IVectorMemoryProvider } from "./contracts/vector-memory-provider.contract";
export type { ILongTermMemoryProvider } from "./contracts/long-term-memory-provider.contract";
export type { IShortTermMemoryProvider } from "./contracts/short-term-memory-provider.contract";
export type { IRemoteMemoryProvider } from "./contracts/remote-memory-provider.contract";
export type { IMemorySynchronizationProvider } from "./contracts/memory-synchronization-provider.contract";
export { createMemoryRecord } from "./models/memory-record.model";
export type {
  MemoryRecord,
  RegisterMemoryRecordInput,
  UpdateMemoryRecordInput,
  ListMemoryRecordsResult,
  FindMemoryRecordsByKeyResult,
  ListMemoryRecordsByCategoryResult,
  DeleteMemoryRecordResult,
  MemoryStatistics,
} from "./models/memory-record.model";
export { AiMemoryManagementService } from "./services/ai-memory-management.service";
export { AiMemoryManagementApplicationService } from "./services/ai-memory-management-application.service";
export {
  RegisterMemoryRecordUseCase,
  GetMemoryRecordUseCase,
  ListMemoryRecordsUseCase,
  UpdateMemoryRecordUseCase,
  DeleteMemoryRecordUseCase,
  FindMemoryRecordsByKeyUseCase,
  ListMemoryRecordsByCategoryUseCase,
  GetMemoryStatisticsUseCase,
} from "./use-cases/ai-memory-management.use-cases";
