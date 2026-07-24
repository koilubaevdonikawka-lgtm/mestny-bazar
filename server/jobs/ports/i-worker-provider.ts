import type { Worker } from "@server/jobs/workers";
import type { WorkerRegistry } from "@server/jobs/workers/worker-registry";

/** Provides worker instances for job processing — implementations live in infrastructure. */
export interface IWorkerProvider {
  getRegistry(): WorkerRegistry;
  getWorker(name: string): Worker | undefined;
  listWorkers(): readonly Worker[];
}
