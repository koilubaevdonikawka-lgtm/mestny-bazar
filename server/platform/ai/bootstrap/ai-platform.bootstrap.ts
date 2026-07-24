import { BootstrapTokens } from "@server/bootstrap/tokens";
import type { IAIProvider } from "@server/platform/ai/ai/contracts";
import {
  AIOrchestrator,
  AIExecutionPlanner,
  AIResultAggregator,
  AIWorkerRegistry,
  registerDefaultAIWorkers,
} from "@server/platform/ai/ai";
import type { IIdGenerator } from "@server/application/ports";
import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { registerAIInfrastructure } from "@server/infrastructure/ai/bootstrap/ai-infrastructure.bootstrap";

/** Registers platform AI orchestrator, planner, registry, and default workers. */
export function registerAIPlatform(registry: ServiceRegistry): void {
  registerAIInfrastructure(registry, "stub");

  registry.registerSingleton(BootstrapTokens.AIWorkerRegistry, () => new AIWorkerRegistry());

  registry.registerSingleton(
    BootstrapTokens.AIExecutionPlanner,
    (provider) => new AIExecutionPlanner(provider.resolve(BootstrapTokens.AIWorkerRegistry)),
  );

  registry.registerSingleton(BootstrapTokens.AIResultAggregator, () => new AIResultAggregator());

  registry.registerSingleton(BootstrapTokens.AIOrchestrator, (provider) => {
    const workerRegistry = provider.resolve<AIWorkerRegistry>(BootstrapTokens.AIWorkerRegistry);
    const aiProvider = provider.resolve<IAIProvider>(InfrastructureTokens.AIProvider);
    registerDefaultAIWorkers(workerRegistry, aiProvider);

    return new AIOrchestrator(
      provider.resolve<AIExecutionPlanner>(BootstrapTokens.AIExecutionPlanner),
      workerRegistry,
      provider.resolve(BootstrapTokens.AIResultAggregator),
      provider.resolve<IIdGenerator>(InfrastructureTokens.IdGenerator),
    );
  });
}
