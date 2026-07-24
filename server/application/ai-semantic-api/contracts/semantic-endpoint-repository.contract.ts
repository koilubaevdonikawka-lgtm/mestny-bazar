import type { SemanticEndpoint } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

export interface ISemanticEndpointRepository {
  save(endpoint: SemanticEndpoint): Promise<void>;
  findById(endpointId: string): Promise<SemanticEndpoint | null>;
  findByName(name: string): Promise<SemanticEndpoint | null>;
  findByPath(path: string): Promise<SemanticEndpoint | null>;
  findAll(): Promise<readonly SemanticEndpoint[]>;
  delete(endpointId: string): Promise<boolean>;
}
