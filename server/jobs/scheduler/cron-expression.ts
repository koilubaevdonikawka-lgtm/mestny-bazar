import { InvalidCronExpressionError } from "@server/jobs/shared";

export interface CronField {
  readonly raw: string;
  readonly values: readonly number[];
}

export interface CronFields {
  readonly minute: CronField;
  readonly hour: CronField;
  readonly dayOfMonth: CronField;
  readonly month: CronField;
  readonly dayOfWeek: CronField;
  readonly second?: CronField;
}

/** Cron schedule expression — parsed without external libraries. */
export class CronExpression {
  readonly expression: string;
  readonly fields: CronFields;

  private constructor(expression: string, fields: CronFields) {
    this.expression = expression;
    this.fields = fields;
    Object.freeze(this);
  }

  static parse(expression: string): CronExpression {
    const normalized = expression?.trim().replace(/\s+/g, " ");
    if (!normalized) {
      throw new InvalidCronExpressionError(expression);
    }

    const parts = normalized.split(" ");
    if (parts.length !== 5 && parts.length !== 6) {
      throw new InvalidCronExpressionError(expression);
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek, second] =
      parts.length === 6 ? parts : [parts[0], parts[1], parts[2], parts[3], parts[4], undefined];

    const fields: CronFields = Object.freeze({
      minute: parseCronField(minute, 0, 59),
      hour: parseCronField(hour, 0, 23),
      dayOfMonth: parseCronField(dayOfMonth, 1, 31),
      month: parseCronField(month, 1, 12),
      dayOfWeek: parseCronField(dayOfWeek, 0, 6),
      second: second ? parseCronField(second, 0, 59) : undefined,
    });

    return new CronExpression(normalized, fields);
  }

  /** Returns true when the expression matches the given UTC date (minute precision). */
  matches(date: Date): boolean {
    const minute = date.getUTCMinutes();
    const hour = date.getUTCHours();
    const dayOfMonth = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const dayOfWeek = date.getUTCDay();

    return (
      fieldMatches(this.fields.minute, minute) &&
      fieldMatches(this.fields.hour, hour) &&
      fieldMatches(this.fields.dayOfMonth, dayOfMonth) &&
      fieldMatches(this.fields.month, month) &&
      fieldMatches(this.fields.dayOfWeek, dayOfWeek) &&
      (this.fields.second ? fieldMatches(this.fields.second, date.getUTCSeconds()) : true)
    );
  }

  toString(): string {
    return this.expression;
  }
}

function parseCronField(raw: string, min: number, max: number): CronField {
  const values = expandCronField(raw, min, max);
  return Object.freeze({ raw, values: Object.freeze(values) });
}

function expandCronField(raw: string, min: number, max: number): number[] {
  if (raw === "*") {
    return range(min, max);
  }

  const stepMatch = raw.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    const step = Number(stepMatch[1]);
    return range(min, max).filter((value) => (value - min) % step === 0);
  }

  return raw.split(",").flatMap((segment) => {
    const rangeMatch = segment.match(/^(\d+)-(\d+)(?:\/(\d+))?$/);
    if (rangeMatch) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      const step = rangeMatch[3] ? Number(rangeMatch[3]) : 1;
      return range(start, end).filter((value) => (value - start) % step === 0);
    }

    const value = Number(segment);
    if (Number.isInteger(value) && value >= min && value <= max) {
      return [value];
    }

    throw new InvalidCronExpressionError(raw);
  });
}

function range(start: number, end: number): number[] {
  const values: number[] = [];
  for (let current = start; current <= end; current += 1) {
    values.push(current);
  }
  return values;
}

function fieldMatches(field: CronField, value: number): boolean {
  return field.values.includes(value);
}
