import type { IAgentSdkStatisticsProvider } from "@server/application/ai-agent-sdk/contracts/agent-sdk-statistics-provider.contract";
import type { AgentSdkStatistics } from "@server/application/ai-agent-sdk/models/agent-sdk.model";

/** Default in-memory agent SDK statistics provider. */
export class DefaultAgentSdkStatisticsProvider implements IAgentSdkStatisticsProvider {
  async getStatistics(input: {
    totalSdks: number;
    activeSdks: number;
    totalInstances: number;
    runningInstances: number;
  }): Promise<AgentSdkStatistics> {
    return Object.freeze({
      totalSdks: input.totalSdks,
      activeSdks: input.activeSdks,
      totalInstances: input.totalInstances,
      runningInstances: input.runningInstances,
    });
  }
}
