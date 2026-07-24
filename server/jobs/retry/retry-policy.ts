import type { Job } from "@server/jobs/jobs/job";

/** Context for evaluating retry decisions. */
export interface RetryContext {
  readonly job: Job;
  readonly attempt: number;
  readonly lastError?: string;
  readonly lastAttemptAt?: string;
}

/** Backoff strategy for job retries. */
export type RetryStrategy = "fixed" | "linear" | "exponential";

export interface RetryPolicyOptions {
  maxAttempts: number;
  strategy?: RetryStrategy;
  baseDelayMs?: number;
  maxDelayMs?: number;
}

/** Configurable retry policy for failed jobs. */
export class RetryPolicy {
  readonly maxAttempts: number;
  readonly strategy: RetryStrategy;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;

  constructor(options: RetryPolicyOptions) {
    if (options.maxAttempts < 1) {
      throw new Error("RetryPolicy maxAttempts must be at least 1.");
    }

    this.maxAttempts = options.maxAttempts;
    this.strategy = options.strategy ?? "exponential";
    this.baseDelayMs = options.baseDelayMs ?? 1_000;
    this.maxDelayMs = options.maxDelayMs ?? 60_000;
    Object.freeze(this);
  }

  shouldRetry(context: RetryContext): boolean {
    return context.attempt < this.maxAttempts;
  }

  calculateDelayMs(attempt: number): number {
    let delay: number;

    switch (this.strategy) {
      case "fixed":
        delay = this.baseDelayMs;
        break;
      case "linear":
        delay = this.baseDelayMs * attempt;
        break;
      case "exponential":
      default:
        delay = this.baseDelayMs * 2 ** Math.max(attempt - 1, 0);
        break;
    }

    return Math.min(delay, this.maxDelayMs);
  }

  nextRetryAt(context: RetryContext): string {
    const delayMs = this.calculateDelayMs(context.attempt + 1);
    return new Date(Date.now() + delayMs).toISOString();
  }
}

/** Default retry policy for background jobs. */
export const DefaultRetryPolicy = new RetryPolicy({
  maxAttempts: 3,
  strategy: "exponential",
  baseDelayMs: 1_000,
  maxDelayMs: 30_000,
});
