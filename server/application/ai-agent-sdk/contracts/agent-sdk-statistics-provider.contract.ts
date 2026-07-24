import type { AgentSdkStatistics } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

export interface IAgentSdkStatisticsProvider {
  getStatistics(input: {
    totalSdks: number;
    activeSdks: number;
    totalInstances: number;
    runningInstances: number;
  }): Promise<AgentSdkStatistics>;
}
