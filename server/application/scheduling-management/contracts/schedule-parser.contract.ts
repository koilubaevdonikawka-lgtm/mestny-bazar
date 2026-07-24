export interface ScheduleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export interface IScheduleParser {
  validate(schedule: string): ScheduleValidationResult;
  computeNextRun(schedule: string, from?: Date): string | null;
}
