export interface AIProviderOptions {
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Contract for LLM provider adapters in infrastructure. */
export interface IAIProvider {
  readonly providerId: string;
  complete(prompt: string, options?: AIProviderOptions): Promise<string>;
}
