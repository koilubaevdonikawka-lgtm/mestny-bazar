import type { ILifecycleManager } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ILifecycleRegistry } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ILifecycleStateEngine } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ILifecycleTransitionEngine } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ILifecycleOrchestrator } from "@server/platform/lifecycle/lifecycle/contracts";
import type { ILifecycleValidator } from "@server/platform/lifecycle/lifecycle/contracts";
import type { IRecoveryPlanner } from "@server/platform/lifecycle/lifecycle/contracts";
import {
  createLifecycleReport,
  type LifecycleComponent,
  type LifecycleReport,
  type LifecycleState,
  type LifecycleStateValue,
} from "@server/platform/lifecycle/lifecycle/models";
import {
  createLifecycleReportGeneratedEvent,
  createLifecycleStartedEvent,
} from "@server/platform/lifecycle/lifecycle/events";

/** Orchestrates platform component lifecycle metadata. */
export class LifecycleManager implements ILifecycleManager {
  constructor(
    private readonly registry: ILifecycleRegistry,
    private readonly stateEngine: ILifecycleStateEngine,
    private readonly transitionEngine: ILifecycleTransitionEngine,
    private readonly orchestrator: ILifecycleOrchestrator,
    private readonly validator: ILifecycleValidator,
    private readonly recoveryPlanner: IRecoveryPlanner,
  ) {}

  registerComponent(component: LifecycleComponent): LifecycleComponent {
    const stored = this.registry.register(component);
    this.stateEngine.setState(stored.id, "registered");
    return stored;
  }

  initialize(componentId: string): LifecycleState {
    return this.transition(componentId, "initialized");
  }

  start(componentId: string): LifecycleState {
    const component = this.requireComponent(componentId);
    if (!this.validator.validateDependencies(component)) {
      return this.stateEngine.setState(componentId, "failed");
    }
    this.transition(componentId, "starting");
    const running = this.transition(componentId, "running");
    createLifecycleStartedEvent(running);
    void this.orchestrator.startupOrder(this.registry.list());
    return running;
  }

  stop(componentId: string): LifecycleState {
    this.transition(componentId, "stopping");
    return this.transition(componentId, "stopped");
  }

  restart(componentId: string): LifecycleState {
    this.transition(componentId, "restarting");
    this.recoveryPlanner.planRestart(componentId);
    void this.orchestrator.restartOrder(this.registry.list());
    return this.start(componentId);
  }

  shutdown(componentId: string): LifecycleState {
    this.recoveryPlanner.planSafeShutdown(componentId);
    this.transition(componentId, "stopping");
    this.transition(componentId, "stopped");
    return this.transition(componentId, "disposed");
  }

  status(componentId?: string): LifecycleReport | LifecycleState {
    if (componentId) {
      return this.requireState(componentId);
    }
    const report = createLifecycleReport({
      states: this.stateEngine.listStates(),
      summary: "Platform lifecycle status report",
    });
    createLifecycleReportGeneratedEvent(report);
    return report;
  }

  private transition(componentId: string, target: LifecycleStateValue): LifecycleState {
    const current = this.stateEngine.getState(componentId)?.state ?? "registered";
    const result = this.transitionEngine.performTransition(componentId, current, target);
    if (!result.valid) {
      return this.stateEngine.setState(componentId, "failed");
    }
    return this.stateEngine.setState(componentId, target);
  }

  private requireComponent(componentId: string): LifecycleComponent {
    const component = this.registry.get(componentId);
    if (!component) {
      throw new Error(`Lifecycle component not found: ${componentId}`);
    }
    return component;
  }

  private requireState(componentId: string): LifecycleState {
    const state = this.stateEngine.getState(componentId);
    if (!state) {
      throw new Error(`Lifecycle state not found: ${componentId}`);
    }
    return state;
  }
}
