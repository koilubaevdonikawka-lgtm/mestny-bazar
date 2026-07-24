import type { ServiceRegistry } from "@server/infrastructure/di/service-container";
import { InfrastructureTokens } from "@server/infrastructure/di/tokens";
import { MemoryAIProvider } from "@server/infrastructure/ai/memory-ai.provider";
import { StubAIProvider } from "@server/infrastructure/ai/stub-ai.provider";

export type AIProviderDriver = "memory" | "stub";

/** Registers AI provider infrastructure adapters. */
export function registerAIInfrastructure(
  registry: ServiceRegistry,
  driver: AIProviderDriver = "stub",
): void {
  if (driver === "memory") {
    registry.registerSingleton(InfrastructureTokens.AIProvider, () => new MemoryAIProvider());
    return;
  }

  registry.registerSingleton(InfrastructureTokens.AIProvider, () => new StubAIProvider());
}

export { MemoryAIProvider, StubAIProvider };
