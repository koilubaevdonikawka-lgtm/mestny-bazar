/** automation.md — a read-only map of the event bus already wired in server/di/container.ts. */
export interface AutomationEventSummary {
  eventType: string;
  description: string;
  subscribers: string[];
}

export interface AutomationOverviewDTO {
  events: AutomationEventSummary[];
  /** automation.md, "Ограничение архитектуры" — the bus is in-memory, single-process, synchronous. */
  architectureNote: string;
}
