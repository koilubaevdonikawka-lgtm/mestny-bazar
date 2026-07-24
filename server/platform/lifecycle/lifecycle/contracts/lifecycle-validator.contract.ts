import type { LifecycleComponent } from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle validation metadata. */
export interface ILifecycleValidator {
  validateDependencies(component: LifecycleComponent): boolean;
  validateRequiredComponents(components: readonly LifecycleComponent[]): boolean;
  validateConfiguration(): boolean;
  validatePlatformReadiness(): boolean;
}
