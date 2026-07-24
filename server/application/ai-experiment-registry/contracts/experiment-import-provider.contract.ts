import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Future integration point for experiment import. Not wired yet. */
export interface IExperimentImportProvider {
  importFrom(source: string): Promise<readonly Experiment[]>;
}
