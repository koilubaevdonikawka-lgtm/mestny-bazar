import type { ISemanticEndpointRepository } from "@server/application/ai-semantic-api/contracts/semantic-endpoint-repository.contract";
import type { SemanticEndpoint } from "@server/application/ai-semantic-api/models/semantic-endpoint.model";

/** In-memory semantic endpoint store. */
export class SemanticEndpointRepository implements ISemanticEndpointRepository {
  private readonly endpoints = new Map<string, SemanticEndpoint>();
  private readonly endpointsByName = new Map<string, string>();
  private readonly endpointsByPath = new Map<string, string>();

  async save(endpoint: SemanticEndpoint): Promise<void> {
    const existing = this.endpoints.get(endpoint.endpointId);
    if (existing) {
      if (existing.name !== endpoint.name) {
        this.endpointsByName.delete(existing.name);
      }
      if (existing.path !== endpoint.path) {
        this.endpointsByPath.delete(existing.path);
      }
    }

    this.endpoints.set(endpoint.endpointId, endpoint);
    this.endpointsByName.set(endpoint.name, endpoint.endpointId);
    this.endpointsByPath.set(endpoint.path, endpoint.endpointId);
  }

  async findById(endpointId: string): Promise<SemanticEndpoint | null> {
    return this.endpoints.get(endpointId.trim()) ?? null;
  }

  async findByName(name: string): Promise<SemanticEndpoint | null> {
    const endpointId = this.endpointsByName.get(name.trim());
    if (!endpointId) {
      return null;
    }
    return this.findById(endpointId);
  }

  async findByPath(path: string): Promise<SemanticEndpoint | null> {
    const endpointId = this.endpointsByPath.get(path.trim());
    if (!endpointId) {
      return null;
    }
    return this.findById(endpointId);
  }

  async findAll(): Promise<readonly SemanticEndpoint[]> {
    return Object.freeze([...this.endpoints.values()]);
  }

  async delete(endpointId: string): Promise<boolean> {
    const endpoint = await this.findById(endpointId);
    if (!endpoint) {
      return false;
    }
    this.endpoints.delete(endpoint.endpointId);
    this.endpointsByName.delete(endpoint.name);
    this.endpointsByPath.delete(endpoint.path);
    return true;
  }
}
