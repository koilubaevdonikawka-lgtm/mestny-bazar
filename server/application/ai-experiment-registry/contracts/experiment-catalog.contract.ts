import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

export interface IExperimentCatalog {
  register(experiment: Experiment): Promise<void>;
  remove(experimentId: string): Promise<void>;
  findById(experimentId: string): Promise<Experiment | null>;
  findByName(name: string): Promise<Experiment | null>;
  findByCategory(category: string): Promise<readonly Experiment[]>;
  listAll(): Promise<readonly Experiment[]>;
}
