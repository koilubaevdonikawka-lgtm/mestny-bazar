import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createLifecycleComponent,
  type LifecycleComponent,
  type LifecycleComponentKind,
} from "@server/platform/lifecycle/lifecycle/models";
import { createComponentRegisteredEvent } from "@server/platform/lifecycle/lifecycle/events";

/** Central registry for platform lifecycle components. */
export class LifecycleRegistry implements ILifecycleRegistry {
  private readonly components = new Map<string, LifecycleComponent>();

  register(component: LifecycleComponent): LifecycleComponent {
    const stored = createLifecycleComponent(component);
    this.components.set(stored.id, stored);
    createComponentRegisteredEvent(stored);
    return stored;
  }

  get(componentId: string): LifecycleComponent | undefined {
    return this.components.get(componentId.trim());
  }

  list(kind?: LifecycleComponentKind): readonly LifecycleComponent[] {
    const values = [...this.components.values()];
    const filtered = kind ? values.filter((component) => component.kind === kind) : values;
    return Object.freeze([...filtered]);
  }
}
