import type { LifecycleStateValue } from "./lifecycle-state.model";

/** Lifecycle state transition metadata. */
export interface LifecycleTransition {
  readonly id: string;
  readonly componentId: string;
  readonly from: LifecycleStateValue;
  readonly to: LifecycleStateValue;
  readonly valid: boolean;
  readonly performedAt: string;
  readonly reason: string;
}

export function createLifecycleTransition(input: {
  id?: string;
  componentId: string;
  from: LifecycleStateValue;
  to: LifecycleStateValue;
  valid: boolean;
  reason: string;
}): LifecycleTransition {
  return Object.freeze({
    id: input.id ?? `transition-${Date.now()}`,
    componentId: input.componentId.trim(),
    from: input.from,
    to: input.to,
    valid: input.valid,
    performedAt: new Date().toISOString(),
    reason: input.reason.trim(),
  });
}
