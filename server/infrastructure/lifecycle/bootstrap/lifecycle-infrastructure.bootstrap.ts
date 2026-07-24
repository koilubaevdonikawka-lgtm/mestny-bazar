import type { ServiceProvider } from "@server/infrastructure/di/service-container";
import {
  createPlatformDescriptor,
  DocumentationTokens,
  type DocumentationPlatform,
} from "@server/platform/documentation/documentation";
import {
  createLifecycleComponent,
  LifecycleTokens,
  type LifecycleOrchestrator,
  type LifecyclePlatform,
  type LifecycleRegistry,
} from "@server/platform/lifecycle/lifecycle";

/** Activates lifecycle platform metadata and default component catalog. */
export function activateLifecyclePlatform(provider: ServiceProvider): void {
  const documentation = provider.resolve<DocumentationPlatform>(
    DocumentationTokens.DocumentationPlatform,
  );

  documentation.registerArchitecture({
    platform: createPlatformDescriptor({
      id: "platform-lifecycle",
      name: "Lifecycle Platform",
      path: "server/platform/lifecycle",
      components: [
        "LifecyclePlatform",
        "LifecycleManager",
        "LifecycleRegistry",
        "LifecycleStateEngine",
        "LifecycleTransitionEngine",
        "LifecycleOrchestrator",
        "LifecycleValidator",
        "RecoveryPlanner",
      ],
      dependencies: [
        "platform-runtime",
        "platform-operations",
        "platform-documentation",
        "platform-governance",
        "platform-observability",
        "platform-integration",
      ],
    }),
  });

  const lifecyclePlatform = provider.resolve<LifecyclePlatform>(LifecycleTokens.LifecyclePlatform);
  const orchestrator = provider.resolve<LifecycleOrchestrator>(LifecycleTokens.LifecycleOrchestrator);
  const registry = provider.resolve<LifecycleRegistry>(LifecycleTokens.LifecycleRegistry);

  const runtimeComponent = lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "component-runtime-platform",
      name: "Runtime Platform",
      kind: "component",
      platformId: "platform-runtime",
    }),
  );

  lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "service-observability",
      name: "Observability Service",
      kind: "service",
      platformId: "platform-observability",
      dependencies: [runtimeComponent.id],
    }),
  );

  lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "registry-provider",
      name: "Provider Registry",
      kind: "registry",
      platformId: "platform-integration",
      dependencies: [runtimeComponent.id],
    }),
  );

  lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "manager-lifecycle",
      name: "Lifecycle Manager",
      kind: "manager",
      platformId: "platform-lifecycle",
      dependencies: [runtimeComponent.id],
    }),
  );

  lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "provider-integration",
      name: "Integration Provider",
      kind: "provider",
      platformId: "platform-integration",
      dependencies: [runtimeComponent.id],
    }),
  );

  lifecyclePlatform.registerComponent(
    createLifecycleComponent({
      id: "component-operations-platform",
      name: "Operations Platform",
      kind: "component",
      platformId: "platform-operations",
      dependencies: [runtimeComponent.id],
    }),
  );

  lifecyclePlatform.initialize(runtimeComponent.id);
  lifecyclePlatform.start(runtimeComponent.id);

  void orchestrator.startupOrder(registry.list());
  void lifecyclePlatform.status();
}
