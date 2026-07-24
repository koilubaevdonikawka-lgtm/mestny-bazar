import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

export interface IExperimentSerializer {
  serialize(experiment: Experiment): Promise<string>;
  deserialize(serialized: string): Promise<Experiment>;
}
