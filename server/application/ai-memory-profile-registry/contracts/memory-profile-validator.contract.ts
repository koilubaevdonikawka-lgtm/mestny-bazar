import type {
  MemoryProfile,
  RegisterMemoryProfileInput,
  UpdateMemoryProfileInput,
} from "@server/application/ai-memory-profile-registry/models/memory-profile.model";

export interface MemoryProfileValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IMemoryProfileValidator {
  validateRegistration(input: RegisterMemoryProfileInput): Promise<MemoryProfileValidationResult>;
  validateUpdate(
    existing: MemoryProfile,
    input: UpdateMemoryProfileInput,
  ): Promise<MemoryProfileValidationResult>;
}
