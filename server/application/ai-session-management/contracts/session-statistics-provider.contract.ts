import type { SessionStatistics } from "@server/application/ai-session-management/models/session.model";

export interface ISessionStatisticsProvider {
  getStatistics(input: {
    totalSessions: number;
    activeSessions: number;
    closedSessions: number;
  }): Promise<SessionStatistics>;
}
