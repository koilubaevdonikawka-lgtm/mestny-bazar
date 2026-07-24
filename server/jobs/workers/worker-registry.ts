import { Worker } from "@server/jobs/workers/worker";

/** Registry of background workers keyed by name. */
export class WorkerRegistry {
  private readonly workers = new Map<string, Worker>();

  register(worker: Worker): WorkerRegistry {
    if (this.workers.has(worker.name)) {
      throw new Error(`Worker already registered: ${worker.name}`);
    }
    this.workers.set(worker.name, worker);
    return this;
  }

  unregister(name: string): WorkerRegistry {
    this.workers.delete(name);
    return this;
  }

  get(name: string): Worker | undefined {
    return this.workers.get(name);
  }

  list(): readonly Worker[] {
    return Object.freeze([...this.workers.values()]);
  }

  forQueue(queue: string): readonly Worker[] {
    return Object.freeze(this.list().filter((worker) => worker.supportsQueue(queue)));
  }
}
