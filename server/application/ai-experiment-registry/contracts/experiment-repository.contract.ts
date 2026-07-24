import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

export interface IExperimentRepository {
  save(experiment: Experiment): Promise<void>;
  findById(experimentId: string): Promise<Experiment | null>;
  findByName(name: string): Promise<Experiment | null>;
  findByCategory(category: string): Promise<readonly Experiment[]>;
  findAll(): Promise<readonly Experiment[]>;
  delete(experimentId: string): Promise<boolean>;
}
