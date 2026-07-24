export type LifecycleStateValue =
  | "registered"
  | "initialized"
  | "starting"
  | "running"
  | "stopping"
  | "stopped"
  | "restarting"
  | "failed"
  | "disposed";

/** Current lifecycle state metadata for a component. */
export interface LifecycleState {
  readonly componentId: string;
  readonly state: LifecycleStateValue;
  readonly updatedAt: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export function createLifecycleState(input: {
  componentId: string;
  state: LifecycleStateValue;
  metadata?: Readonly<Record<string, unknown>>;
}): LifecycleState {
  return Object.freeze({
    componentId: input.componentId.trim(),
    state: input.state,
    updatedAt: new Date().toISOString(),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}
