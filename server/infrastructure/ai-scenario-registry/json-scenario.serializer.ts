import type { IScenarioSerializer } from "@server/application/ai-scenario-registry/contracts/scenario-serializer.contract";
import {
  createScenario,
  type Scenario,
} from "@server/application/ai-scenario-registry/models/scenario.model";

/** JSON-based scenario serializer. */
export class JsonScenarioSerializer implements IScenarioSerializer {
  async serialize(scenario: Scenario): Promise<string> {
    return JSON.stringify(scenario);
  }

  async deserialize(serialized: string): Promise<Scenario> {
    if (!serialized.trim()) {
      throw new Error("Serialized scenario cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Scenario>;
    return createScenario({
      scenarioId: parsed.scenarioId ?? "",
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
