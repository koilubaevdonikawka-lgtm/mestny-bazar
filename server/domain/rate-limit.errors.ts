/** Задача №288 — thrown when an edge rate limit rejects a sensitive action. Maps to HTTP 429 (see server/functions/rate-limit.guard.ts). */
export class RateLimitedError extends Error {
  constructor(
    message = "Слишком много запросов. Пожалуйста, подождите минуту и попробуйте снова.",
    readonly retryAfterSeconds = 60,
  ) {
    super(message);
    this.name = "RateLimitedError";
  }
}
