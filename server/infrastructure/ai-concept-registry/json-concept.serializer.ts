import type { IConceptSerializer } from "@server/application/ai-concept-registry/contracts/concept-serializer.contract";
import {
  createConcept,
  type Concept,
} from "@server/application/ai-concept-registry/models/concept.model";

/** JSON-based concept serializer. */
export class JsonConceptSerializer implements IConceptSerializer {
  async serialize(concept: Concept): Promise<string> {
    return JSON.stringify(concept);
  }

  async deserialize(serialized: string): Promise<Concept> {
    if (!serialized.trim()) {
      throw new Error("Serialized concept cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Concept>;
    return createConcept({
      conceptId: parsed.conceptId ?? "",
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
