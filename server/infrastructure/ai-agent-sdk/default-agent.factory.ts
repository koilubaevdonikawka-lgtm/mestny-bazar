import type {
  AgentFactoryResult,
  IAgentFactory,
} from "@server/application/ai-agent-sdk/contracts/agent-factory.contract";
import {
  createAgentInstance,
  type AgentSdk,
  type CreateAgentInstanceInput,
} from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Mock agent factory — no real AI SDK integration. */
export class DefaultAgentFactory implements IAgentFactory {
  async create(
    sdk: AgentSdk,
    input: CreateAgentInstanceInput,
    instanceId: string,
  ): Promise<AgentFactoryResult> {
    const instance = createAgentInstance({
      instanceId,
      sdkId: sdk.sdkId,
      name: input.name,
      config: input.config ?? sdk.config,
      status: "created",
      mock: true,
    });

    return Object.freeze({
      instance,
      mock: true,
    });
  }
}
