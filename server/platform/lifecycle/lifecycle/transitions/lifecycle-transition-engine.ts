import type { ILifecycleTransitionEngine } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createLifecycleTransition,
  type LifecycleStateValue,
  type LifecycleTransition,
} from "@server/platform/lifecycle/lifecycle/models";
import { createLifecycleStateChangedEvent } from "@server/platform/lifecycle/lifecycle/events";

const ALLOWED_TRANSITIONS: Readonly<Record<LifecycleStateValue, readonly LifecycleStateValue[]>> =
  Object.freeze({
    registered: Object.freeze(["initialized", "disposed"]),
    initialized: Object.freeze(["starting", "disposed"]),
    starting: Object.freeze(["running", "failed"]),
    running: Object.freeze(["stopping", "restarting", "failed"]),
    stopping: Object.freeze(["stopped", "failed"]),
    stopped: Object.freeze(["starting", "disposed"]),
    restarting: Object.freeze(["running", "failed", "stopped"]),
    failed: Object.freeze(["restarting", "disposed"]),
    disposed: Object.freeze([]),
  });

/** Validates and records lifecycle transitions (metadata only). */
export class LifecycleTransitionEngine implements ILifecycleTransitionEngine {
  validateTransition(from: LifecycleStateValue, to: LifecycleStateValue): boolean {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
  }

  performTransition(
    componentId: string,
    from: LifecycleStateValue,
    to: LifecycleStateValue,
  ): LifecycleTransition {
    const valid = this.validateTransition(from, to);
    const transition = createLifecycleTransition({
      componentId,
      from,
      to,
      valid,
      reason: valid ? "transition-permitted" : "transition-denied",
    });
    createLifecycleStateChangedEvent(transition);
    return transition;
  }

  rollbackTransition(
    componentId: string,
    from: LifecycleStateValue,
    to: LifecycleStateValue,
  ): LifecycleTransition {
    const transition = createLifecycleTransition({
      componentId,
      from,
      to,
      valid: true,
      reason: "transition-rolled-back",
    });
    createLifecycleStateChangedEvent(transition);
    return transition;
  }
}
