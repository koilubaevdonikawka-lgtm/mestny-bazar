import type { ISandboxStatisticsProvider } from "@server/application/ai-agent-sandbox/contracts/sandbox-statistics-provider.contract";
import type { SandboxStatistics } from "@server/application/ai-agent-sandbox/models/sandbox.model";

/** Default in-memory sandbox statistics provider. */
export class DefaultSandboxStatisticsProvider implements ISandboxStatisticsProvider {
  async getStatistics(input: {
    totalSandboxes: number;
    activeSandboxes: number;
    totalSessions: number;
    runningSessions: number;
  }): Promise<SandboxStatistics> {
    return Object.freeze({
      totalSandboxes: input.totalSandboxes,
      activeSandboxes: input.activeSandboxes,
      totalSessions: input.totalSessions,
      runningSessions: input.runningSessions,
    });
  }
}
