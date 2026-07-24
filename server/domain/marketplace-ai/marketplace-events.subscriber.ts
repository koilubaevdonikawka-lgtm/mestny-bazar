import { randomUUID } from "node:crypto";

import type { IMarketplaceEventBus } from "@server/ports/marketplace-events.port";
import type { AIOrchestrator } from "@server/domain/marketplace-ai/core/ai-orchestrator";

/** Routes marketplace events into the AI orchestrator. */
export function subscribeAIWorkers(bus: IMarketplaceEventBus, orchestrator: AIOrchestrator): void {
  const enqueue = async (event: Parameters<typeof orchestrator.run>[0]["event"]) => {
    await orchestrator.run({
      id: randomUUID(),
      event,
      createdAt: new Date().toISOString(),
    });
  };

  bus.subscribe("order.created", async (event) => {
    await enqueue(event);
  });

  bus.subscribe("product.media.analysis.requested", async (event) => {
    await enqueue(event);
  });

  bus.subscribe("product.catalog.analysis.requested", async (event) => {
    await enqueue(event);
  });
}
