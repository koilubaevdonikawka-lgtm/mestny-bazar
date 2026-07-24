import type { IClock } from "@server/application/ports";

/** System clock implementation. */
export class SystemClock implements IClock {
  now(): Date {
    return new Date();
  }

  nowIso(): string {
    return this.now().toISOString();
  }
}
