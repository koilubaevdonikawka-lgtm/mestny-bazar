import type { McpResource } from "@server/application/mcp-server/models/mcp.model";

export interface IMcpResourceRepository {
  save(resource: McpResource): Promise<void>;
  findById(resourceId: string): Promise<McpResource | null>;
  findByUri(uri: string): Promise<McpResource | null>;
  findAll(): Promise<readonly McpResource[]>;
}
