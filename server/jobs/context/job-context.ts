import type { ObservabilityContext } from "@server/observability/context";
import type { SecurityContext } from "@server/security/context";
import type { TraceContext } from "@server/observability/tracing";
import type { Job } from "@server/jobs/jobs/job";
import { JobId } from "@server/jobs/jobs/job-id";

export interface JobContextProps {
  job: Job;
  trace: TraceContext;
  security: SecurityContext;
  observability: ObservabilityContext;
  correlationId?: string;
}

/** Unified execution context for background job processing. */
export class JobContext {
  readonly jobId: JobId;
  readonly job: Job;
  readonly trace: TraceContext;
  readonly security: SecurityContext;
  readonly observability: ObservabilityContext;
  readonly correlationId?: string;

  private constructor(props: JobContextProps & { jobId: JobId }) {
    this.jobId = props.jobId;
    this.job = props.job;
    this.trace = props.trace;
    this.security = props.security;
    this.observability = props.observability;
    this.correlationId = props.correlationId;
    Object.freeze(this);
  }

  static create(props: JobContextProps): JobContext {
    return new JobContext({
      jobId: props.job.id,
      job: props.job,
      trace: props.trace,
      security: props.security,
      observability: props.observability,
      correlationId: props.correlationId?.trim() || props.job.correlationId || props.observability.correlationId,
    });
  }

  withJob(job: Job): JobContext {
    return JobContext.create({
      job,
      trace: this.trace,
      security: this.security,
      observability: this.observability,
      correlationId: this.correlationId,
    });
  }
}
