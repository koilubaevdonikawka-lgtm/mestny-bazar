import type {
  LifecycleComponent,
  LifecycleComponentKind,
} from "@server/platform/lifecycle/lifecycle/models";

/** Contract for lifecycle component registration. */
export interface ILifecycleRegistry {
  register(component: LifecycleComponent): LifecycleComponent;
  get(componentId: string): LifecycleComponent | undefined;
  list(kind?: LifecycleComponentKind): readonly LifecycleComponent[];
}
