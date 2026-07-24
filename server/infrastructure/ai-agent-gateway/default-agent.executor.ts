import type {
  AgentExecutionInput,
  AgentExecutionOutput,
  IAgentExecutor,
} from "@server/application/ai-agent-gateway/contracts/agent-executor.contract";

/** Default mock agent executor — no external AI calls. */
export class DefaultAgentExecutor implements IAgentExecutor {
  async execute(input: AgentExecutionInput): Promise<AgentExecutionOutput> {
    return Object.freeze({
      content: Object.freeze({
        message: `Mock response from agent ${input.agentId}`,
        agentId: input.agentId,
        prompt: input.prompt ?? null,
        payload: input.payload ?? null,
        timestamp: new Date().toISOString(),
      }),
      mock: true,
    });
  }
}
