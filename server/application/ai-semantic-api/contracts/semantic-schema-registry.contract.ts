import type { SemanticEndpoint } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

export interface ISemanticSchemaRegistry {
  register(endpoint: SemanticEndpoint): Promise<void>;
  getSchema(endpointId: string): Promise<unknown | null>;
  remove(endpointId: string): Promise<void>;
}
