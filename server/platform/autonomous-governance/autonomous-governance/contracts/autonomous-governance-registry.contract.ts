import type {
  GovernancePlan,
  GovernanceSession,
  PlatformHealthReport,
  PlatformSystemEntry,
  GovernanceSummary,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Contract for autonomous governance registry. */
export interface IAutonomousGovernanceRegistry {
  registerSystem(entry: PlatformSystemEntry): PlatformSystemEntry;
  registerSession(session: GovernanceSession): GovernanceSession;
  registerPlan(plan: GovernancePlan): GovernancePlan;
  registerHealth(report: PlatformHealthReport): PlatformHealthReport;
  registerReport(summary: GovernanceSummary): GovernanceSummary;
  listSystems(): readonly PlatformSystemEntry[];
  listSessions(): readonly GovernanceSession[];
  listPlans(): readonly GovernancePlan[];
  listHealthReports(): readonly PlatformHealthReport[];
  listReports(): readonly GovernanceSummary[];
}
