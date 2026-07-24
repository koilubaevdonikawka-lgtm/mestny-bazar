import type { IOntologySerializer } from "@server/application/ai-ontology-registry/contracts/ontology-serializer.contract";
import {
  createOntology,
  type Ontology,
} from "@server/application/ai-ontology-registry/models/ontology.model";

/** JSON-based ontology serializer. */
export class JsonOntologySerializer implements IOntologySerializer {
  async serialize(ontology: Ontology): Promise<string> {
    return JSON.stringify(ontology);
  }

  async deserialize(serialized: string): Promise<Ontology> {
    if (!serialized.trim()) {
      throw new Error("Serialized ontology cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Ontology>;
    return createOntology({
      ontologyId: parsed.ontologyId ?? "",
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
