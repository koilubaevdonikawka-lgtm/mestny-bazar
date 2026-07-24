import type { AgentRoute } from "@server/application/ai-agent-gateway/models/agent.model";

export interface IAgentRouter {
  registerRoute(route: AgentRoute): Promise<void>;
  findRoute(routeKey: string): Promise<AgentRoute | null>;
  resolveAgentId(routeKey: string): Promise<string | null>;
}
