import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Future integration point for experiment version management. Not wired yet. */
export interface IExperimentVersionProvider {
  listVersions(experimentId: string): Promise<readonly Experiment[]>;
  getVersion(experimentId: string, version: string): Promise<Experiment | null>;
}
