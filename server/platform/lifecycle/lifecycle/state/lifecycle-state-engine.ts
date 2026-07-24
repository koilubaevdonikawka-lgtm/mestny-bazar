import type { ILifecycleStateEngine } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createLifecycleState,
  type LifecycleState,
  type LifecycleStateValue,
} from "@server/platform/lifecycle/lifecycle/models";

/** Manages lifecycle state metadata for platform components. */
export class LifecycleStateEngine implements ILifecycleStateEngine {
  private readonly states = new Map<string, LifecycleState>();

  getState(componentId: string): LifecycleState | undefined {
    return this.states.get(componentId.trim());
  }

  setState(componentId: string, state: LifecycleStateValue): LifecycleState {
    const stored = createLifecycleState({ componentId, state });
    this.states.set(componentId.trim(), stored);
    return stored;
  }

  listStates(): readonly LifecycleState[] {
    return Object.freeze([...this.states.values()]);
  }
}
