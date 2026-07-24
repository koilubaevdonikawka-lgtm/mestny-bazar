import type { IExperimentSerializer } from "@server/application/ai-experiment-registry/contracts/experiment-serializer.contract";
import {
  createExperiment,
  type Experiment,
} from "@server/application/ai-experiment-registry/models/experiment.model";

/** JSON-based experiment serializer. */
export class JsonExperimentSerializer implements IExperimentSerializer {
  async serialize(experiment: Experiment): Promise<string> {
    return JSON.stringify(experiment);
  }

  async deserialize(serialized: string): Promise<Experiment> {
    if (!serialized.trim()) {
      throw new Error("Serialized experiment cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Experiment>;
    return createExperiment({
      experimentId: parsed.experimentId ?? "",
      name: parsed.name ?? "",
      category: parsed.category ?? "",
      description: parsed.description,
      version: parsed.version,
      status: parsed.status,
      createdAt: parsed.createdAt,
      updatedAt: parsed.updatedAt,
    });
  }
}
