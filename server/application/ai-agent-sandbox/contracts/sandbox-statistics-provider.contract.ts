import type { SandboxStatistics } from "@server/application/ai-agent-sandbox/models/sandbox.model";

export interface ISandboxStatisticsProvider {
  getStatistics(input: {
    totalSandboxes: number;
    activeSandboxes: number;
    totalSessions: number;
    runningSessions: number;
  }): Promise<SandboxStatistics>;
}
