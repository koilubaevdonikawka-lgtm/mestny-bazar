import {
  createWorkerContext,
  createWorkerResult,
  type WorkerContext,
  type WorkerResult,
} from "@server/jobs/workers/worker-context";

export type WorkerHandler = (context: WorkerContext) => Promise<WorkerResult> | WorkerResult;

/** Background worker bound to one or more queues. */
export class Worker {
  readonly name: string;
  readonly queues: readonly string[];
  readonly concurrency: number;

  constructor(
    name: string,
    private readonly handler: WorkerHandler,
    options?: { queues?: readonly string[]; concurrency?: number },
  ) {
    const workerName = name?.trim();
    if (!workerName) {
      throw new Error("Worker requires a non-empty name.");
    }

    this.name = workerName;
    this.queues = Object.freeze([...(options?.queues ?? ["default"])]);
    this.concurrency = options?.concurrency ?? 1;
    Object.freeze(this);
  }

  async process(context: WorkerContext): Promise<WorkerResult> {
    const started = performance.now();
    try {
      const result = await this.handler(context);
      return createWorkerResult({
        ...result,
        durationMs: result.durationMs ?? performance.now() - started,
      });
    } catch (error) {
      return createWorkerResult({
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
        durationMs: performance.now() - started,
      });
    }
  }

  supportsQueue(queue: string): boolean {
    return this.queues.includes(queue);
  }
}

export { createWorkerContext, createWorkerResult, type WorkerContext, type WorkerResult };
