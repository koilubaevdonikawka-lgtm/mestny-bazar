import type { ExperimentDescriptor, ExperimentKind } from "@server/platform/features/features/models";

/** Contract for experiment metadata registration. */
export interface IExperimentRegistry {
  register(experiment: ExperimentDescriptor): ExperimentDescriptor;
  get(experimentId: string): ExperimentDescriptor | undefined;
  list(kind?: ExperimentKind): readonly ExperimentDescriptor[];
}
