import type { Experiment } from "@server/application/ai-experiment-registry/models/experiment.model";

/** Future integration point for experiment export. Not wired yet. */
export interface IExperimentExportProvider {
  exportTo(experiments: readonly Experiment[]): Promise<string>;
}
