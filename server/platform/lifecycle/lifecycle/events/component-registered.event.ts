import type { LifecycleComponent } from "@server/platform/lifecycle/lifecycle/models";

export interface ComponentRegisteredEvent {
  readonly type: "lifecycle.component.registered";
  readonly component: LifecycleComponent;
}

export function createComponentRegisteredEvent(
  component: LifecycleComponent,
): ComponentRegisteredEvent {
  return Object.freeze({ type: "lifecycle.component.registered", component });
}
