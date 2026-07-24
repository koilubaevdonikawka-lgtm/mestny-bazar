import type { CompatibilityReport } from "./compatibility-report.model";

export {
  type MigrationKind,
  type MigrationDescriptor,
  createMigrationDescriptor,
} from "./migration-descriptor.model";
export {
  type MigrationStep,
  createMigrationStep,
} from "./migration-step.model";
export {
  type MigrationPlan,
  createMigrationPlan,
} from "./migration-plan.model";
export {
  type CompatibilityFinding,
  type CompatibilityReport,
  createCompatibilityReport,
} from "./compatibility-report.model";
export {
  type EvolutionStatus,
  type EvolutionResult,
  createEvolutionResult,
} from "./evolution-result.model";

export interface EvolutionValidationResult {
  readonly planId: string;
  readonly valid: boolean;
  readonly validatedAt: string;
  readonly compatibility: CompatibilityReport;
  readonly governancePassed: boolean;
}

export function createEvolutionValidationResult(input: {
  planId: string;
  compatibility: CompatibilityReport;
  governancePassed: boolean;
}): EvolutionValidationResult {
  const valid = input.compatibility.compatible && input.governancePassed;
  return Object.freeze({
    planId: input.planId.trim(),
    valid,
    validatedAt: new Date().toISOString(),
    compatibility: input.compatibility,
    governancePassed: input.governancePassed,
  });
}
