import type {
  MemoryRecord,
  RegisterMemoryRecordInput,
  UpdateMemoryRecordInput,
} from "@server/application/ai-memory-management/models/memory-record.model";

export interface MemoryValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IMemoryValidator {
  validateRegistration(input: RegisterMemoryRecordInput): Promise<MemoryValidationResult>;
  validateUpdate(
    existing: MemoryRecord,
    input: UpdateMemoryRecordInput,
  ): Promise<MemoryValidationResult>;
}
