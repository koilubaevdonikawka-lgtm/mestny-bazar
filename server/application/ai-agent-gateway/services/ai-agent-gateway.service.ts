/**
 * AI Agent Gateway — single entry point for AI agents.
 *
 * Fully independent module. No business logic or domain knowledge.
 */
import type { IAgentExecutor } from "@server/application/ai-agent-gateway/contracts/agent-executor.contract";
import type { IAgentRepository } from "@server/application/ai-agent-gateway/contracts/agent-repository.contract";
import type { IAgentRequestHistoryRepository } from "@server/application/ai-agent-gateway/contracts/agent-request-history-repository.contract";
import type { IAgentResponseSerializer } from "@server/application/ai-agent-gateway/contracts/agent-response-serializer.contract";
import type { IAgentRouter } from "@server/application/ai-agent-gateway/contracts/agent-router.contract";
import {
  createAgentRequestHistoryEntry,
  createAgentRoute,
  createAiAgent,
  type AiAgent,
  type AgentRoute,
  type ClearAgentRequestHistoryResult,
  type ExecuteAgentRequestInput,
  type ExecuteAgentRequestResult,
  type GetAgentRequestHistoryResult,
  type ListAgentsResult,
  type RegisterAgentInput,
  type RegisterAgentRouteInput,
  type RouteAgentRequestInput,
  type RouteAgentRequestResult,
} from "@server/application/ai-agent-gateway/models/agent.model";
import type { IIdGenerator } from "@server/application/ports";

export class AiAgentGatewayService {
  constructor(
    private readonly agentRepository: IAgentRepository,
    private readonly agentRouter: IAgentRouter,
    private readonly agentExecutor: IAgentExecutor,
    private readonly requestHistoryRepository: IAgentRequestHistoryRepository,
    private readonly responseSerializer: IAgentResponseSerializer,
    private readonly idGenerator: IIdGenerator,
  ) {}

  async registerAgent(input: RegisterAgentInput): Promise<AiAgent> {
    const name = input.name.trim();
    if (!name) {
      throw new Error("Agent name is required.");
    }

    const agent = createAiAgent({
      agentId: this.idGenerator.generate(),
      name,
      description: input.description,
      providerType: input.providerType,
      status: input.status,
    });

    await this.agentRepository.save(agent);
    return agent;
  }

  async getAgent(agentId: string): Promise<AiAgent | null> {
    return this.agentRepository.findById(agentId.trim());
  }

  async listAgents(): Promise<ListAgentsResult> {
    const agents = Object.freeze(
      [...(await this.agentRepository.findAll())].sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    );
    return Object.freeze({ agents, total: agents.length });
  }

  async registerAgentRoute(input: RegisterAgentRouteInput): Promise<AgentRoute> {
    const routeKey = input.routeKey.trim();
    const agentId = input.agentId.trim();

    if (!routeKey) {
      throw new Error("Route key is required.");
    }
    if (!agentId) {
      throw new Error("Agent ID is required.");
    }

    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const existing = await this.agentRouter.findRoute(routeKey);
    if (existing) {
      throw new Error(`Route already exists: ${routeKey}`);
    }

    const route = createAgentRoute({
      routeId: this.idGenerator.generate(),
      routeKey,
      agentId,
    });

    await this.agentRouter.registerRoute(route);
    return route;
  }

  async routeAgentRequest(input: RouteAgentRequestInput): Promise<RouteAgentRequestResult> {
    const routeKey = input.routeKey.trim();
    if (!routeKey) {
      throw new Error("Route key is required.");
    }

    const route = await this.agentRouter.findRoute(routeKey);
    if (!route) {
      throw new Error(`Route not found: ${routeKey}`);
    }

    const agent = await this.requireAgent(route.agentId);

    return Object.freeze({
      routeKey,
      agentId: agent.agentId,
      agentName: agent.name,
    });
  }

  async executeAgentRequest(input: ExecuteAgentRequestInput): Promise<ExecuteAgentRequestResult> {
    let agentId = input.agentId?.trim();
    let routeKey: string | null = input.routeKey?.trim() ?? null;

    if (routeKey) {
      const routed = await this.routeAgentRequest({ routeKey });
      agentId = routed.agentId;
    }

    if (!agentId) {
      throw new Error("Either agentId or routeKey is required.");
    }

    await this.requireAgent(agentId);

    const executionInput = Object.freeze({
      prompt: input.prompt,
      payload: input.payload,
    });

    const execution = await this.agentExecutor.execute({
      agentId,
      prompt: input.prompt,
      payload: input.payload,
    });

    const response = Object.freeze({
      content: execution.content,
      serialized: this.responseSerializer.serialize(execution.content),
    });

    const requestId = this.idGenerator.generate();
    await this.requestHistoryRepository.save(
      createAgentRequestHistoryEntry({
        requestId,
        agentId,
        routeKey,
        input: executionInput,
        response,
      }),
    );

    return Object.freeze({
      requestId,
      agentId,
      routeKey,
      response,
      mock: execution.mock,
    });
  }

  async getAgentRequestHistory(): Promise<GetAgentRequestHistoryResult> {
    const entries = Object.freeze([...(await this.requestHistoryRepository.findAll())]);
    return Object.freeze({ entries, total: entries.length });
  }

  async clearAgentRequestHistory(): Promise<ClearAgentRequestHistoryResult> {
    const removedCount = await this.requestHistoryRepository.clear();
    return Object.freeze({ removedCount });
  }

  private async requireAgent(agentId: string): Promise<AiAgent> {
    const agent = await this.agentRepository.findById(agentId);
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }
    if (agent.status !== "active") {
      throw new Error(`Agent is not active: ${agentId}`);
    }
    return agent;
  }
}
