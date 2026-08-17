export interface RetryOptions {
  attempts: number;
  delayMs: number;
}

/** Marks an error as safe to retry (network failure or 5xx-class provider response). A 4xx (bad request, invalid signature, etc.) will not succeed on retry and must not be retried. */
export class RetryableError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "RetryableError";
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries `fn` only when it throws `RetryableError` — any other thrown error
 * (validation failures, 4xx-class responses) propagates immediately on the
 * first attempt, since retrying those can't change the outcome.
 */
export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= options.attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!(error instanceof RetryableError) || attempt === options.attempts) throw error;
      await sleep(options.delayMs * attempt);
    }
  }

  throw lastError;
}
