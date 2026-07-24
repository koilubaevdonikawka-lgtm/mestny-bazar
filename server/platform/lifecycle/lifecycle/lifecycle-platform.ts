import type { ILifecycleManager } from "@server/platform/lifecycle/lifecycle/contracts";
import type {
  LifecycleComponent,
  LifecycleReport,
  LifecycleState,
} from "@server/platform/lifecycle/lifecycle/models";

/** Public lifecycle platform facade. */
export class LifecyclePlatform {
  constructor(private readonly manager: ILifecycleManager) {}

  registerComponent(component: LifecycleComponent): LifecycleComponent {
    return this.manager.registerComponent(component);
  }

  initialize(componentId: string): LifecycleState {
    return this.manager.initialize(componentId);
  }

  start(componentId: string): LifecycleState {
    return this.manager.start(componentId);
  }

  stop(componentId: string): LifecycleState {
    return this.manager.stop(componentId);
  }

  restart(componentId: string): LifecycleState {
    return this.manager.restart(componentId);
  }

  shutdown(componentId: string): LifecycleState {
    return this.manager.shutdown(componentId);
  }

  status(componentId?: string): LifecycleReport | LifecycleState {
    return this.manager.status(componentId);
  }
}
