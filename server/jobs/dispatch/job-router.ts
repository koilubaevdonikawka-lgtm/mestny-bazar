import type { JobContext } from "@server/jobs/context/job-context";
import type { WorkerResult } from "@server/jobs/workers/worker-context";

/** Handles a specific job payload type. */
export type JobHandler = (context: JobContext) => Promise<WorkerResult> | WorkerResult;

/** Maps job payload types to handlers. */
export class JobRouter {
  private readonly handlers = new Map<string, JobHandler>();

  register(jobType: string, handler: JobHandler): JobRouter {
    const type = jobType?.trim();
    if (!type) {
      throw new Error("JobRouter requires a non-empty job type.");
    }
    if (this.handlers.has(type)) {
      throw new Error(`Handler already registered for job type: ${type}`);
    }
    this.handlers.set(type, handler);
    return this;
  }

  unregister(jobType: string): JobRouter {
    this.handlers.delete(jobType.trim());
    return this;
  }

  resolve(jobType: string): JobHandler | undefined {
    return this.handlers.get(jobType.trim());
  }

  list(): readonly string[] {
    return Object.freeze([...this.handlers.keys()]);
  }
}
