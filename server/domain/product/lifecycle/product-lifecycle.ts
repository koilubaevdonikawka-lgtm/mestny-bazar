import { ProductLifecycleViolationError } from "@server/domain/product/exceptions/product.errors";
import { ProductStateBehaviorRegistry } from "@server/domain/product/lifecycle/state-behavior";
import { ProductTransitionRules } from "@server/domain/product/lifecycle/transition-rules";
import type { ProductLifecycleAction } from "@server/domain/product/lifecycle/product-lifecycle.types";
import type { ProductStatus } from "@server/domain/product/status/product-status";

export type { ProductLifecycleAction } from "@server/domain/product/lifecycle/product-lifecycle.types";

/** Guards legal status transitions — status never changes outside the matrix. */
export class ProductLifecycle {
  static transition(
    current: ProductStatus,
    action: ProductLifecycleAction,
  ): ProductStatus {
    const behavior = ProductStateBehaviorRegistry.forStatus(current);
    if (!behavior.allowedActions().includes(action)) {
      throw new ProductLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    const next = ProductTransitionRules.resolve(current, action);
    if (!next) {
      throw new ProductLifecycleViolationError(
        `Action "${action}" is not allowed from status "${current}"`,
        current,
        current,
      );
    }

    return next;
  }

  static canTransition(current: ProductStatus, action: ProductLifecycleAction): boolean {
    return ProductTransitionRules.canResolve(current, action);
  }
}
