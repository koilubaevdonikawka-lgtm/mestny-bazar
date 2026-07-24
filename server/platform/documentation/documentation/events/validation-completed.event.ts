export const ValidationCompletedEventName = "platform.documentation.validation.completed";

export interface ValidationCompletedEvent {
  readonly name: typeof ValidationCompletedEventName;
  readonly occurredAt: string;
  readonly valid: boolean;
  readonly violationCount: number;
}

export function createValidationCompletedEvent(input: {
  valid: boolean;
  violationCount: number;
}): ValidationCompletedEvent {
  return Object.freeze({
    name: ValidationCompletedEventName,
    occurredAt: new Date().toISOString(),
    valid: input.valid,
    violationCount: input.violationCount,
  });
}
