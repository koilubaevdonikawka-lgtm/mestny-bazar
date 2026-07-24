import { SellerLifecycleViolationError } from "@server/domain/seller/exceptions/seller.errors";
import { SellerStateBehaviorRegistry } from "@server/domain/seller/lifecycle/state-behavior";
import { SellerTransitionRules } from "@server/domain/seller/lifecycle/transition-rules";
import type { SellerLifecycleAction } from "@server/domain/seller/lifecycle/seller-lifecycle.types";
import type { SellerLifecycleStatus } from "@server/domain/seller/status/seller-status";

export type { SellerLifecycleAction } from "@server/domain/seller/lifecycle/seller-lifecycle.types";

export class SellerLifecycle {
  static transition(
    current: SellerLifecycleStatus,
    action: SellerLifecycleAction,
  ): SellerLifecycleStatus {
    const behavior = SellerStateBehaviorRegistry.forStatus(current);
    if (!behavior.allowedActions().includes(action)) {
      throw new SellerLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    const next = SellerTransitionRules.resolve(current, action);
    if (!next) {
      throw new SellerLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    return next;
  }

  static canTransition(current: SellerLifecycleStatus, action: SellerLifecycleAction): boolean {
    return SellerTransitionRules.canResolve(current, action);
  }
}
