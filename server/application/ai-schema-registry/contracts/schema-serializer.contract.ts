import type { Schema } from "@server/application/ai-schema-registry/models/schema.model";

export interface ISchemaSerializer {
  serialize(schema: Schema): Promise<string>;
  deserialize(serialized: string): Promise<Schema>;
}
