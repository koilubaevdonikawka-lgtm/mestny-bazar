import type {
  IBenchmarkValidator,
  BenchmarkValidationResult,
} from "@server/application/ai-benchmark-registry/contracts/benchmark-validator.contract";
import type {
  RegisterBenchmarkInput,
  Benchmark,
  UpdateBenchmarkInput,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";

/** Default benchmark validator. */
export class DefaultBenchmarkValidator implements IBenchmarkValidator {
  async validateRegistration(input: RegisterBenchmarkInput): Promise<BenchmarkValidationResult> {
    const errors: string[] = [];

    if (!input.name?.trim()) {
      errors.push("Benchmark name is required.");
    }
    if (!input.category?.trim()) {
      errors.push("Benchmark category is required.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Benchmark status must be 'active' or 'inactive'.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }

  async validateUpdate(
    existing: Benchmark,
    input: UpdateBenchmarkInput,
  ): Promise<BenchmarkValidationResult> {
    const errors: string[] = [];

    if (input.name !== undefined && !input.name.trim()) {
      errors.push("Benchmark name cannot be empty.");
    }
    if (input.category !== undefined && !input.category.trim()) {
      errors.push("Benchmark category cannot be empty.");
    }
    if (input.status !== undefined && input.status !== "active" && input.status !== "inactive") {
      errors.push("Benchmark status must be 'active' or 'inactive'.");
    }

    if (!existing) {
      errors.push("Benchmark is required for validation.");
    }

    return Object.freeze({ valid: errors.length === 0, errors: Object.freeze(errors) });
  }
}
