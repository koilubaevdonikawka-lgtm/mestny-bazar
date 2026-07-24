import type {
  RegisterBenchmarkInput,
  Benchmark,
  UpdateBenchmarkInput,
} from "@server/application/ai-benchmark-registry/models/benchmark.model";

export interface BenchmarkValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IBenchmarkValidator {
  validateRegistration(input: RegisterBenchmarkInput): Promise<BenchmarkValidationResult>;
  validateUpdate(
    existing: Benchmark,
    input: UpdateBenchmarkInput,
  ): Promise<BenchmarkValidationResult>;
}
