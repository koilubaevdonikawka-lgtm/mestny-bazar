import type {
  IMemoryValidator,
  MemoryValidationResult,
} from "@server/application/ai-memory-management/contracts/memory-validator.contract";
import type {
  MemoryRecord,
  RegisterMemoryRecordInput,
  UpdateMemoryRecordInput,
} from "@server/application/ai-memory-management/models/memory-record.model";

/** Default memory record validator. */
export class DefaultMemoryValidator implements IMemoryValidator {
  async validateRegistration(
    input: RegisterMemoryRecordInput,
  ): Promise<MemoryValidationResult> {
    const errors: string[] = [];

    if (!input.key?.trim()) {
      errors.push("Memory record key is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Memory record category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Memory record status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: MemoryRecord,
    input: UpdateMemoryRecordInput,
  ): Promise<MemoryValidationResult> {
    const errors: string[] = [];

    if (input.key !== undefined && !input.key.trim()) {
      errors.push("Memory record key cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Memory record category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Memory record status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Memory record is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
