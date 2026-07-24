export interface AIProviderOptions {
  readonly model?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Platform AI provider adapter contract. */
export interface IAIProviderAdapter {
  readonly providerId: string;
  complete(prompt: string, options?: AIProviderOptions): Promise<string>;
}
