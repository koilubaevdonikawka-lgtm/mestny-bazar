import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { TranslateTextRequest, TranslateTextResult } from "@shared/contracts/ai-provider";

/**
 * Official Google AI (Gemini API / AI Studio) generateContent endpoint and
 * authentication header — verified against current official documentation
 * (ai.google.dev/api/generate-content, ai.google.dev/gemini-api/docs/api-key),
 * not assumed (Промпт №089).
 *
 * Model (Промпт №091 follow-up): "gemini-2.0-flash" returned a real HTTP 429
 * (RESOURCE_EXHAUSTED, free-tier quota limit: 0 for that specific pinned
 * version) for the configured key; "gemini-2.5-flash"/"gemini-2.5-flash-lite"
 * returned a real HTTP 404 ("no longer available to new users"). Verified
 * via ListModels (v1beta/models) and a real generateContent call per
 * candidate — "gemini-flash-latest" is the one that returned a real HTTP 200
 * for this key. It is Google's own alias to their current recommended flash
 * model, which avoids re-hitting the same dead-end when a specific pinned
 * version is retired or gated in the future.
 */
const GEMINI_MODEL = "gemini-flash-latest";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const FETCH_TIMEOUT_MS = 10_000;

export interface GoogleAiAdapterConfig {
  apiKey: string;
}

/**
 * First real IAiTextProvider implementation (Промпт №089). generateContent
 * is a general-purpose text endpoint, not a dedicated translation API, so
 * translation is performed via an explicit instruction prompt telling the
 * model to return only the translated text — a standard, well-documented
 * technique, not a guess at an undocumented protocol.
 */
export class GoogleAiAdapter implements IAiTextProvider {
  constructor(private readonly config: GoogleAiAdapterConfig) {}

  async translateText(request: TranslateTextRequest): Promise<TranslateTextResult> {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": this.config.apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: this.buildPrompt(request) }] }],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Google AI request failed: HTTP ${response.status} ${body}`.trim());
    }

    const data = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Google AI response contained no translated text");
    }

    return {
      translatedText: text.trim(),
      detectedSourceLanguage: request.sourceLanguage ?? null,
    };
  }

  private buildPrompt(request: TranslateTextRequest): string {
    const sourceClause = request.sourceLanguage ? `from ${request.sourceLanguage} ` : "";
    return [
      `Translate the following text ${sourceClause}into ${request.targetLanguage}.`,
      "Return ONLY the translated text, with no explanations, quotes, or extra formatting.",
      "",
      "Text:",
      request.text,
    ].join("\n");
  }
}
