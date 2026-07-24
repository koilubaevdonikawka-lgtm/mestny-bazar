import type { ISchemaRegistry, SchemaDescriptor, SchemaKind } from "@server/platform/gateway/gateway/contracts";

/** Registry for gateway request, response, error and webhook schemas. */
export class SchemaRegistry implements ISchemaRegistry {
  private readonly schemas = new Map<string, SchemaDescriptor>();

  registerSchema(schema: SchemaDescriptor): void {
    if (this.schemas.has(schema.id)) {
      throw new Error(`Schema already registered: ${schema.id}`);
    }
    this.schemas.set(schema.id, Object.freeze({ ...schema }));
  }

  listSchemas(kind?: SchemaKind): readonly SchemaDescriptor[] {
    const all = [...this.schemas.values()];
    return Object.freeze(kind ? all.filter((schema) => schema.kind === kind) : all);
  }

  getSchema(schemaId: string): SchemaDescriptor | undefined {
    return this.schemas.get(schemaId.trim());
  }
}
