/** Base class for background job failures. */
export abstract class JobError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Raised when a job handler is not registered for a job type. */
export class JobHandlerNotFoundError extends JobError {
  readonly code = "jobs.handler_not_found";

  constructor(jobType: string) {
    super(`No handler registered for job type: ${jobType}`);
  }
}

/** Raised when a job exceeds its maximum retry attempts. */
export class JobMaxRetriesExceededError extends JobError {
  readonly code = "jobs.max_retries_exceeded";

  constructor(jobId: string) {
    super(`Job exceeded maximum retry attempts: ${jobId}`);
  }
}

/** Raised when queue operations fail at the provider boundary. */
export class QueueOperationError extends JobError {
  readonly code = "jobs.queue_operation_failed";

  constructor(message: string) {
    super(message);
  }
}

/** Raised when a cron expression is invalid. */
export class InvalidCronExpressionError extends JobError {
  readonly code = "jobs.invalid_cron_expression";

  constructor(expression: string) {
    super(`Invalid cron expression: ${expression}`);
  }
}
