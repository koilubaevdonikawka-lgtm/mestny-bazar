import type { IAIWorker } from "@server/platform/ai/ai/contracts";

/** Registry of platform AI workers with dynamic registration support. */
export class AIWorkerRegistry {
  private readonly workers = new Map<string, IAIWorker>();

  register(worker: IAIWorker): void {
    if (this.workers.has(worker.id)) {
      throw new Error(`AI worker already registered: ${worker.id}`);
    }
    this.workers.set(worker.id, worker);
  }

  unregister(workerId: string): boolean {
    return this.workers.delete(workerId.trim());
  }

  getWorker(workerId: string): IAIWorker | undefined {
    return this.workers.get(workerId.trim());
  }

  getWorkers(): readonly IAIWorker[] {
    return Object.freeze([...this.workers.values()]);
  }

  getAvailableWorkers(): readonly string[] {
    return Object.freeze([...this.workers.keys()]);
  }
}
