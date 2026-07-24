import type { IMcpResourceRepository } from "@server/application/mcp-server/contracts/mcp-resource-repository.contract";
import type { McpResource } from "@server/application/mcp-server/models/mcp.model";

/** In-memory MCP resource store. */
export class McpResourceRepository implements IMcpResourceRepository {
  private readonly resources = new Map<string, McpResource>();
  private readonly resourcesByUri = new Map<string, string>();

  async save(resource: McpResource): Promise<void> {
    this.resources.set(resource.resourceId, resource);
    this.resourcesByUri.set(resource.uri, resource.resourceId);
  }

  async findById(resourceId: string): Promise<McpResource | null> {
    return this.resources.get(resourceId.trim()) ?? null;
  }

  async findByUri(uri: string): Promise<McpResource | null> {
    const resourceId = this.resourcesByUri.get(uri.trim());
    if (!resourceId) {
      return null;
    }
    return this.findById(resourceId);
  }

  async findAll(): Promise<readonly McpResource[]> {
    return Object.freeze([...this.resources.values()]);
  }
}
