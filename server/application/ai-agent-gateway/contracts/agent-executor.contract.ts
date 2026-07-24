export interface AgentExecutionInput {
  readonly agentId: string;
  readonly prompt?: string;
  readonly payload?: unknown;
}

export interface AgentExecutionOutput {
  readonly content: unknown;
  readonly mock: boolean;
}

export interface IAgentExecutor {
  execute(input: AgentExecutionInput): Promise<AgentExecutionOutput>;
}
