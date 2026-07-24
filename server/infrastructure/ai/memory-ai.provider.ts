import type { AIProviderOptions, IAIProvider } from "@server/platform/ai/ai/contracts";

/** In-memory AI provider that caches prompt completions for development. */
export class MemoryAIProvider implements IAIProvider {
  readonly providerId = "memory";
  private readonly cache = new Map<string, string>();

  async complete(prompt: string, _options?: AIProviderOptions): Promise<string> {
    const normalizedPrompt = prompt.trim();
    const cached = this.cache.get(normalizedPrompt);
    if (cached) {
      return cached;
    }

    const response = `[memory-ai] ${normalizedPrompt.slice(0, 500)}`;
    this.cache.set(normalizedPrompt, response);
    return response;
  }
}
