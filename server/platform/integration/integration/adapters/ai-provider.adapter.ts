import type {
  AIProviderOptions,
  IAIProviderAdapter,
} from "@server/platform/integration/integration/contracts";
import type { IAIProvider } from "@server/platform/ai/ai/contracts";

/** Adapts platform AI providers to the integration layer contract. */
export class AIProviderAdapter implements IAIProviderAdapter {
  constructor(private readonly delegate: IAIProvider) {}

  get providerId(): string {
    return this.delegate.providerId;
  }

  complete(prompt: string, options?: AIProviderOptions): Promise<string> {
    return this.delegate.complete(prompt, options);
  }
}
