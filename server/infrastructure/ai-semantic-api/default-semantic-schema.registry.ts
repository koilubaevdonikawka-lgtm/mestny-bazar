import type { ISemanticSchemaRegistry } from "@server/application/ai-semantic-api/contracts/semantic-schema-registry.contract";
import type { SemanticEndpoint } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

/** Default in-memory semantic schema registry. */
export class DefaultSemanticSchemaRegistry implements ISemanticSchemaRegistry {
  private readonly schemas = new Map<string, unknown>();

  async register(endpoint: SemanticEndpoint): Promise<void> {
    this.schemas.set(endpoint.endpointId, endpoint.schema);
  }

  async getSchema(endpointId: string): Promise<unknown | null> {
    return this.schemas.get(endpointId.trim()) ?? null;
  }

  async remove(endpointId: string): Promise<void> {
    this.schemas.delete(endpointId.trim());
  }
}
