import type { SecurityContext } from "@server/security/context";
import type { TraceContext } from "@server/observability/tracing";

export interface ObservabilityContextProps {
  trace: TraceContext;
  security: SecurityContext;
  requestId?: string;
  correlationId?: string;
  timestamp?: string;
}

/** Unified observability context for logs, metrics, traces, and audit. */
export class ObservabilityContext {
  readonly trace: TraceContext;
  readonly security: SecurityContext;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly timestamp: string;

  private constructor(props: Required<ObservabilityContextProps>) {
    this.trace = props.trace;
    this.security = props.security;
    this.requestId = props.requestId;
    this.correlationId = props.correlationId;
    this.timestamp = props.timestamp;
    Object.freeze(this);
  }

  static create(props: ObservabilityContextProps): ObservabilityContext {
    return new ObservabilityContext({
      trace: props.trace,
      security: props.security,
      requestId: props.requestId?.trim() || props.security.requestId,
      correlationId: props.correlationId?.trim() || props.security.correlationId,
      timestamp: props.timestamp ?? new Date().toISOString(),
    });
  }

  withTrace(trace: TraceContext): ObservabilityContext {
    return ObservabilityContext.create({
      trace,
      security: this.security,
      requestId: this.requestId,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
    });
  }

  withSecurity(security: SecurityContext): ObservabilityContext {
    return ObservabilityContext.create({
      trace: this.trace,
      security,
      requestId: this.requestId,
      correlationId: this.correlationId,
      timestamp: this.timestamp,
    });
  }
}
