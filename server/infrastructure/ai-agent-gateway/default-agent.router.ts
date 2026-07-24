import type { IAgentRouter } from "@server/application/ai-agent-gateway/contracts/agent-router.contract";
import type { AgentRoute } from "@server/application/ai-agent-gateway/models/agent.model";

/** Default in-memory agent router. */
export class DefaultAgentRouter implements IAgentRouter {
  private readonly routes = new Map<string, AgentRoute>();

  async registerRoute(route: AgentRoute): Promise<void> {
    this.routes.set(route.routeKey, route);
  }

  async findRoute(routeKey: string): Promise<AgentRoute | null> {
    return this.routes.get(routeKey.trim()) ?? null;
  }

  async resolveAgentId(routeKey: string): Promise<string | null> {
    const route = await this.findRoute(routeKey);
    return route?.agentId ?? null;
  }
}
