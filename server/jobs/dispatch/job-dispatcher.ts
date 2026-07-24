import type { JobContext } from "@server/jobs/context/job-context";
import type { Job } from "@server/jobs/jobs/job";
import type { IQueueProvider } from "@server/jobs/queue";
import { createQueueProcessResult, type QueueEnvelope } from "@server/jobs/queue";
import type { JobRouter } from "@server/jobs/dispatch/job-router";
import { JobHandlerNotFoundError } from "@server/jobs/shared";
import { createWorkerResult, type WorkerResult } from "@server/jobs/workers/worker-context";

/** Dispatches jobs to queues and routes them to registered handlers. */
export class JobDispatcher {
  constructor(
    private readonly queueProvider: IQueueProvider,
    private readonly router: JobRouter,
  ) {
    Object.freeze(this);
  }

  async enqueue(job: Job): Promise<Job> {
    await this.queueProvider.enqueue(job.queue, job.withStatus("queued"));
    return job.withStatus("queued");
  }

  async dispatch(context: JobContext): Promise<WorkerResult> {
    const handler = this.router.resolve(context.job.payload.type);
    if (!handler) {
      throw new JobHandlerNotFoundError(context.job.payload.type);
    }

    const runningContext = context.withJob(context.job.withStatus("running"));
    return handler(runningContext);
  }

  async processEnvelope(envelope: QueueEnvelope, context: JobContext): Promise<WorkerResult> {
    try {
      const result = await this.dispatch(context.withJob(envelope.job));

      if (result.status === "completed") {
        await this.queueProvider.ack(envelope);
      } else if (result.status === "retry") {
        await this.queueProvider.nack(envelope, createQueueProcessResult("retry", result.error));
      } else {
        await this.queueProvider.nack(envelope, createQueueProcessResult("nack", result.error));
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.queueProvider.nack(envelope, createQueueProcessResult("nack", message));
      return createWorkerResult({ status: "failed", error: message });
    }
  }
}

export type { JobHandler } from "@server/jobs/dispatch/job-router";
