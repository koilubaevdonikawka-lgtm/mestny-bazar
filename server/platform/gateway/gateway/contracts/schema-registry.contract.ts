export type SchemaKind = "request" | "response" | "error" | "webhook";

export interface SchemaDescriptor {
  readonly id: string;
  readonly kind: SchemaKind;
  readonly name: string;
  readonly version: string;
}

/** Contract for gateway schema registration. */
export interface ISchemaRegistry {
  registerSchema(schema: SchemaDescriptor): void;
  listSchemas(kind?: SchemaKind): readonly SchemaDescriptor[];
  getSchema(schemaId: string): SchemaDescriptor | undefined;
}
