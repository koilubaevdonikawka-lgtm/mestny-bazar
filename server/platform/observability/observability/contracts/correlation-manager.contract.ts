import type { CorrelationContext } from "@server/platform/observability/observability/models";

/** Contract for correlation context management. */
export interface ICorrelationManager {
  create(input?: Partial<CorrelationContext>): CorrelationContext;
  get(correlationId: string): CorrelationContext | undefined;
  list(): readonly CorrelationContext[];
}
