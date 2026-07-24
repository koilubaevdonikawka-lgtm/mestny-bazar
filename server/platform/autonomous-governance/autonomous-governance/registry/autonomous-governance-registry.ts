import type { IAutonomousGovernanceRegistry } from "@server/platform/autonomous-governance/autonomous-governance/contracts";
import {
  createGovernanceSession,
  createPlatformSystemEntry,
  type GovernancePlan,
  type GovernanceSession,
  type GovernanceSummary,
  type PlatformHealthReport,
  type PlatformSystemEntry,
} from "@server/platform/autonomous-governance/autonomous-governance/models";

/** Central registry for autonomous governance artifacts. */
export class AutonomousGovernanceRegistry implements IAutonomousGovernanceRegistry {
  private readonly systems: PlatformSystemEntry[] = [];
  private readonly sessions: GovernanceSession[] = [];
  private readonly plans: GovernancePlan[] = [];
  private readonly healthReports: PlatformHealthReport[] = [];
  private readonly reports: GovernanceSummary[] = [];

  registerSystem(entry: PlatformSystemEntry): PlatformSystemEntry {
    const stored = createPlatformSystemEntry(entry);
    this.systems.push(stored);
    return stored;
  }

  registerSession(session: GovernanceSession): GovernanceSession {
    const stored = createGovernanceSession(session);
    this.sessions.push(stored);
    return stored;
  }

  registerPlan(plan: GovernancePlan): GovernancePlan {
    this.plans.push(plan);
    return plan;
  }

  registerHealth(report: PlatformHealthReport): PlatformHealthReport {
    this.healthReports.push(report);
    return report;
  }

  registerReport(summary: GovernanceSummary): GovernanceSummary {
    this.reports.push(summary);
    return summary;
  }

  listSystems(): readonly PlatformSystemEntry[] {
    return Object.freeze([...this.systems]);
  }

  listSessions(): readonly GovernanceSession[] {
    return Object.freeze([...this.sessions]);
  }

  listPlans(): readonly GovernancePlan[] {
    return Object.freeze([...this.plans]);
  }

  listHealthReports(): readonly PlatformHealthReport[] {
    return Object.freeze([...this.healthReports]);
  }

  listReports(): readonly GovernanceSummary[] {
    return Object.freeze([...this.reports]);
  }
}
