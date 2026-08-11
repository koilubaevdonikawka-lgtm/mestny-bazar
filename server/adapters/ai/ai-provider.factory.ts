import type { ServerEnv } from "@server/config/env";
import type { IAiTextProvider } from "@server/ports/ai-provider.port";
import type { IAiImageProvider } from "@server/ports/ai-image-provider.port";
import { GoogleAiAdapter } from "@server/adapters/ai/google-ai.adapter";
import { GoogleAiImageAdapter } from "@server/adapters/ai/google-ai-image.adapter";
import { StubAiProvider, StubAiImageProvider } from "@server/adapters/ai/stub-ai-provider";

/**
 * The single decision point for which AI provider backs text translation
 * (Промпт №088 universal AI infrastructure; Промпт №089 first real
 * provider — Google AI / Gemini API, chosen by the project owner, not
 * assumed). Real adapter only when GOOGLE_AI_API_KEY is configured,
 * otherwise the safe stub — so the app always boots regardless of AI
 * configuration. Adding another provider later means one new adapter file
 * under server/adapters/ai/ plus one new branch here — server/domain/
 * ai-translation.service.ts and every caller stay unchanged (PL-09,
 * Replaceable Adapters).
 */
export function createAiProvider(env: ServerEnv): IAiTextProvider {
  if (env.GOOGLE_AI_API_KEY) {
    return new GoogleAiAdapter({ apiKey: env.GOOGLE_AI_API_KEY });
  }

  return new StubAiProvider();
}

/**
 * Same decision point, for the image-processing capability (Промпт №101 —
 * product photo background removal). Same GOOGLE_AI_API_KEY gate, same
 * provider (Google AI) — this is the single AI provider this project uses
 * for both text and image, not a second, independently-configured system.
 */
export function createAiImageProvider(env: ServerEnv): IAiImageProvider {
  if (env.GOOGLE_AI_API_KEY) {
    return new GoogleAiImageAdapter({ apiKey: env.GOOGLE_AI_API_KEY });
  }

  return new StubAiImageProvider();
}
