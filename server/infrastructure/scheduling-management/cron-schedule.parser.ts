import type {
  IScheduleParser,
  ScheduleValidationResult,
} from "@server/application/scheduling-management/contracts/schedule-parser.contract";

const CRON_PATTERN =
  /^(\*|[0-9,-/]+)\s+(\*|[0-9,-/]+)\s+(\*|[0-9,-/]+)\s+(\*|[0-9,-/]+)\s+(\*|[0-9,-/]+)$/;

/** Basic cron schedule parser for in-memory scheduling. */
export class CronScheduleParser implements IScheduleParser {
  validate(schedule: string): ScheduleValidationResult {
    const normalized = schedule.trim();
    const errors: string[] = [];

    if (!normalized) {
      errors.push("Schedule expression is required.");
    } else if (!CRON_PATTERN.test(normalized)) {
      errors.push("Schedule must be a valid 5-field cron expression.");
    }

    return Object.freeze({
      valid: errors.length === 0,
      errors: Object.freeze(errors),
    });
  }

  computeNextRun(schedule: string, from = new Date()): string | null {
    const validation = this.validate(schedule);
    if (!validation.valid) {
      return null;
    }

    const parts = schedule.trim().split(/\s+/);
    const minutePart = parts[0] ?? "*";

    const next = new Date(from);
    next.setSeconds(0, 0);

    if (minutePart === "*") {
      next.setMinutes(next.getMinutes() + 1);
    } else if (/^\d+$/.test(minutePart)) {
      next.setMinutes(Number(minutePart));
      if (next <= from) {
        next.setHours(next.getHours() + 1);
      }
    } else {
      next.setMinutes(next.getMinutes() + 5);
    }

    return next.toISOString();
  }
}
