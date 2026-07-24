import type { ICorrelationManager } from "@server/platform/observability/observability/contracts";
import {
  createCorrelationContext,
  type CorrelationContext,
} from "@server/platform/observability/observability/models";
import { createCorrelationCreatedEvent } from "@server/platform/observability/observability/events";

/** Manages correlation, request, operation and session identifiers. */
export class CorrelationManager implements ICorrelationManager {
  private readonly contexts = new Map<string, CorrelationContext>();

  create(input: Partial<CorrelationContext> = {}): CorrelationContext {
    const context = createCorrelationContext({
      correlationId: input.correlationId,
      requestId: input.requestId,
      operationId: input.operationId,
      sessionId: input.sessionId,
    });
    this.contexts.set(context.correlationId, context);
    createCorrelationCreatedEvent(context);
    return context;
  }

  get(correlationId: string): CorrelationContext | undefined {
    return this.contexts.get(correlationId.trim());
  }

  list(): readonly CorrelationContext[] {
    return Object.freeze([...this.contexts.values()]);
  }
}
