import type { IAIWorker } from "@server/ports/marketplace-ai.port";

/** Registry of marketplace AI workers. */
export class AIWorkerRegistry {
  private readonly workers: IAIWorker[] = [];

  register(worker: IAIWorker): void {
    this.workers.push(worker);
  }

  getWorkers(): readonly IAIWorker[] {
    return this.workers;
  }

  getWorker(workerId: string): IAIWorker | undefined {
    return this.workers.find((worker) => worker.id === workerId);
  }
}
