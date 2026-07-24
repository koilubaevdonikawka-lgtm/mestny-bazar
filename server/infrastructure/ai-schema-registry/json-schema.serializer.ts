import type { ISchemaSerializer } from "@server/application/ai-schema-registry/contracts/schema-serializer.contract";
import {
  createSchema,
  type Schema,
} from "@server/application/ai-schema-registry/models/schema.model";

/** JSON-based schema serializer. */
export class JsonSchemaSerializer implements ISchemaSerializer {
  async serialize(schema: Schema): Promise<string> {
    return JSON.stringify(schema);
  }

  async deserialize(serialized: string): Promise<Schema> {
    if (!serialized.trim()) {
      throw new Error("Serialized schema cannot be empty.");
    }

    const parsed = JSON.parse(serialized) as Partial<Schema>;
    return createSchema({
      schemaId: parsed.schemaId ?? "",
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
