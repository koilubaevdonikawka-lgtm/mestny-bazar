import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Future integration point for experiment synchronization. Not wired yet. */
export interface IExperimentSynchronizationProvider {
  synchronize(experiments: readonly Experiment[]): Promise<void>;
}
