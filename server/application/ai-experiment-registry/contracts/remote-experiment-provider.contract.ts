import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Future integration point for external experiment providers. Not wired yet. */
export interface IRemoteExperimentProvider {
  fetchRemote(experimentId: string): Promise<Experiment | null>;
  pushRemote(experiment: Experiment): Promise<void>;
}
