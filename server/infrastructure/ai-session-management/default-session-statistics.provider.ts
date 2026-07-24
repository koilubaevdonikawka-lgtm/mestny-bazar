import type { ISessionStatisticsProvider } from "@server/application/ai-session-management/contracts/session-statistics-provider.contract";
import type { SessionStatistics } from "@server/application/ai-session-management/models/session.model";

/** Default in-memory session statistics provider. */
export class DefaultSessionStatisticsProvider implements ISessionStatisticsProvider {
  async getStatistics(input: {
    totalSessions: number;
    activeSessions: number;
    closedSessions: number;
  }): Promise<SessionStatistics> {
    return Object.freeze({
      totalSessions: input.totalSessions,
      activeSessions: input.activeSessions,
      closedSessions: input.closedSessions,
    });
  }
}
