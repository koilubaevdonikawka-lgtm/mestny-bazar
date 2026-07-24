/**
 * Future integration ports for AI Agent Gateway.
 * Not implemented — reserved for external AI providers.
 */

export interface OpenAICompletionInput {
  readonly prompt: string;
  readonly model?: string;
}

export interface OpenAICompletionOutput {
  readonly content: string;
}

/** OpenAI Provider — OpenAI API integration. */
export interface IOpenAIProvider {
  complete(input: OpenAICompletionInput): Promise<OpenAICompletionOutput>;
}

export interface AnthropicCompletionInput {
  readonly prompt: string;
  readonly model?: string;
}

export interface AnthropicCompletionOutput {
  readonly content: string;
}

/** Anthropic Provider — Anthropic API integration. */
export interface IAnthropicProvider {
  complete(input: AnthropicCompletionInput): Promise<AnthropicCompletionOutput>;
}

export interface GoogleAICompletionInput {
  readonly prompt: string;
  readonly model?: string;
}

export interface GoogleAICompletionOutput {
  readonly content: string;
}

/** Google AI Provider — Google AI API integration. */
export interface IGoogleAIProvider {
  complete(input: GoogleAICompletionInput): Promise<GoogleAICompletionOutput>;
}

export interface LocalLlmCompletionInput {
  readonly prompt: string;
  readonly endpoint?: string;
}

export interface LocalLlmCompletionOutput {
  readonly content: string;
}

/** Local LLM Provider — local model integration. */
export interface ILocalLlmProvider {
  complete(input: LocalLlmCompletionInput): Promise<LocalLlmCompletionOutput>;
}

/** Multi-Agent Router — advanced multi-agent routing integration. */
export interface IMultiAgentRouter {
  route(routeKey: string, payload: unknown): Promise<string>;
}
