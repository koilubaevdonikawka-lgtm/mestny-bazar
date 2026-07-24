import type { IExperimentRegistry } from "@server/platform/features/features/contracts";
import {
  createExperimentDescriptor,
  type ExperimentDescriptor,
  type ExperimentKind,
} from "@server/platform/features/features/models";

/** Registers experiment metadata (A/B, canary, beta). */
export class ExperimentRegistry implements IExperimentRegistry {
  private readonly experiments = new Map<string, ExperimentDescriptor>();

  register(experiment: ExperimentDescriptor): ExperimentDescriptor {
    const stored = createExperimentDescriptor(experiment);
    this.experiments.set(stored.id, stored);
    return stored;
  }

  get(experimentId: string): ExperimentDescriptor | undefined {
    return this.experiments.get(experimentId.trim());
  }

  list(kind?: ExperimentKind): readonly ExperimentDescriptor[] {
    const values = [...this.experiments.values()];
    const filtered = kind ? values.filter((experiment) => experiment.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
