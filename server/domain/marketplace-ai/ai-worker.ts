import type { AIJob, AIJobResult, IAIWorker } from "@server/ports/marketplace-ai.port";
import type { MarketplaceEvent } from "@server/ports/marketplace-events.port";

/** Base class for marketplace AI workers. */
export abstract class AIWorker implements IAIWorker {
  abstract readonly id: string;

  abstract canHandle(event: MarketplaceEvent): boolean;

  abstract process(job: AIJob): Promise<AIJobResult>;
}
