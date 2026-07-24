import type { IRecoveryPlanner } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createRecoveryPlan,
  type RecoveryPlan,
  type RecoveryPlanKind,
} from "@server/platform/lifecycle/lifecycle/models";
import { createRecoveryPlannedEvent } from "@server/platform/lifecycle/lifecycle/events";

/** Creates recovery and shutdown plans as metadata (no execution). */
export class RecoveryPlanner implements IRecoveryPlanner {
  planRestart(componentId: string): RecoveryPlan {
    return this.storePlan(
      createRecoveryPlan({
        componentId,
        kind: "restart",
        steps: Object.freeze(["stop", "validate", "start"]),
      }),
    );
  }

  planRecovery(componentId: string): RecoveryPlan {
    return this.storePlan(
      createRecoveryPlan({
        componentId,
        kind: "recovery",
        steps: Object.freeze(["diagnose", "rollback", "restart"]),
      }),
    );
  }

  planSafeShutdown(componentId: string): RecoveryPlan {
    return this.storePlan(
      createRecoveryPlan({
        componentId,
        kind: "safe-shutdown",
        steps: Object.freeze(["drain", "stop", "dispose"]),
      }),
    );
  }

  planRollback(componentId: string): RecoveryPlan {
    return this.storePlan(
      createRecoveryPlan({
        componentId,
        kind: "rollback",
        steps: Object.freeze(["capture-state", "rollback-transition", "verify"]),
      }),
    );
  }

  plan(kind: RecoveryPlanKind, componentId: string): RecoveryPlan {
    switch (kind) {
      case "restart":
        return this.planRestart(componentId);
      case "recovery":
        return this.planRecovery(componentId);
      case "safe-shutdown":
        return this.planSafeShutdown(componentId);
      case "rollback":
        return this.planRollback(componentId);
      default:
        return this.planRecovery(componentId);
    }
  }

  private storePlan(plan: RecoveryPlan): RecoveryPlan {
    createRecoveryPlannedEvent(plan);
    return plan;
  }
}
