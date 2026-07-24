import type { IEvolutionManager } from "@server/platform/evolution/evolution/contracts";
import type { IMigrationPlanner } from "@server/platform/evolution/evolution/contracts";
import type { ICompatibilityEngine } from "@server/platform/evolution/evolution/contracts";
import type { IMigrationStrategy } from "@server/platform/evolution/evolution/contracts";
import {
  createEvolutionResult,
  createEvolutionValidationResult,
  type EvolutionResult,
  type EvolutionValidationResult,
  type MigrationPlan,
} from "@server/platform/evolution/evolution/models";
import {
  createEvolutionCompletedEvent,
  createEvolutionValidatedEvent,
} from "@server/platform/evolution/evolution/events";
import { DEFAULT_STRATEGY_ID } from "@server/platform/evolution/evolution/strategies";
import type { GovernancePlatform } from "@server/platform/governance/governance/governance-platform";
import type { OperationsPlatform } from "@server/platform/operations/operations/operations-platform";
import type { ReleasePlatform } from "@server/platform/release/release/release-platform";
import type { IHealthService } from "@server/platform/runtime/runtime/contracts";

/** Orchestrates platform evolution planning, validation and execution. */
export class EvolutionManager implements IEvolutionManager {
  private readonly plans = new Map<string, MigrationPlan>();
  private readonly strategyMap: ReadonlyMap<string, IMigrationStrategy>;

  constructor(
    private readonly planner: IMigrationPlanner,
    private readonly compatibilityEngine: ICompatibilityEngine,
    private readonly governance: GovernancePlatform,
    private readonly release: ReleasePlatform,
    private readonly operations: OperationsPlatform,
    private readonly healthService: IHealthService,
    strategies: readonly IMigrationStrategy[],
  ) {
    this.strategyMap = new Map(strategies.map((strategy) => [strategy.id, strategy]));
  }

  planEvolution(targetVersion: string, strategyId = DEFAULT_STRATEGY_ID): MigrationPlan {
    const plan = this.planner.plan(targetVersion, strategyId);
    const strategy = this.requireStrategy(strategyId);
    strategy.prepare(plan);
    this.plans.set(plan.id, plan);
    return plan;
  }

  async validateEvolution(planId: string): Promise<EvolutionValidationResult> {
    const plan = this.requirePlan(planId);
    const compatibility = this.compatibilityEngine.assess(plan.targetVersion);
    const policies = await this.governance.evaluateAll();
    const governancePassed = policies.every((result) => result.passed);

    const result = createEvolutionValidationResult({
      planId,
      compatibility,
      governancePassed,
    });
    createEvolutionValidatedEvent(result);
    return result;
  }

  async executeEvolutionPlan(planId: string): Promise<EvolutionResult> {
    const startedAt = new Date().toISOString();
    const plan = this.requirePlan(planId);
    const validation = await this.validateEvolution(planId);

    if (!validation.valid) {
      const failed = createEvolutionResult({
        planId,
        status: "failed",
        startedAt,
        summary: "Evolution plan validation failed.",
        skippedSteps: plan.executionOrder,
        plan,
      });
      createEvolutionCompletedEvent(failed);
      return failed;
    }

    await this.healthService.check();
    await this.operations.backup();
    this.release.createRelease(`Evolution to ${plan.targetVersion}`);

    const executed: string[] = [];
    for (const migrationId of plan.executionOrder) {
      executed.push(migrationId);
    }

    const result = createEvolutionResult({
      planId,
      status: "executed",
      startedAt,
      summary: `Evolution plan executed for target ${plan.targetVersion}.`,
      executedSteps: executed,
      plan,
    });
    createEvolutionCompletedEvent(result);
    return result;
  }

  rollbackPlan(planId: string): EvolutionResult {
    const startedAt = new Date().toISOString();
    const plan = this.requirePlan(planId);
    const strategy = this.requireStrategy(plan.strategyId);

    const result = createEvolutionResult({
      planId,
      status: "rolled-back",
      startedAt,
      summary: strategy.prepare(plan).rollbackSupported
        ? `Rollback preparation completed for plan ${planId}.`
        : `Rollback not supported for strategy ${plan.strategyId}.`,
      skippedSteps: plan.executionOrder,
      plan,
    });
    createEvolutionCompletedEvent(result);
    return result;
  }

  getPlan(planId: string): MigrationPlan | undefined {
    return this.plans.get(planId.trim());
  }

  private requirePlan(planId: string): MigrationPlan {
    const plan = this.plans.get(planId.trim());
    if (!plan) {
      throw new Error(`Evolution plan not found: ${planId}`);
    }
    return plan;
  }

  private requireStrategy(strategyId: string): IMigrationStrategy {
    const strategy = this.strategyMap.get(strategyId);
    if (!strategy) {
      throw new Error(`Migration strategy not found: ${strategyId}`);
    }
    return strategy;
  }
}
