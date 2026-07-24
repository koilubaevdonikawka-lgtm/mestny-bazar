import type { AIProviderOptions, IAIProvider } from "@server/platform/ai/ai/contracts";

/** Deterministic stub AI provider for tests and local development. */
export class StubAIProvider implements IAIProvider {
  readonly providerId = "stub";

  async complete(prompt: string, options?: AIProviderOptions): Promise<string> {
    const model = options?.model ?? "stub-model";
    return `[stub-ai:${model}] ${prompt.trim().length} chars`;
  }
}
