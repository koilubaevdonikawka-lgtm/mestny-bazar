import type { ApplicationLifecycleState } from "@server/platform/runtime/runtime/models";

/** Application lifecycle contract. */
export interface IApplicationLifecycle {
  getState(): ApplicationLifecycleState;
  startup(): Promise<void>;
  shutdown(): Promise<void>;
  restart(): Promise<void>;
}
