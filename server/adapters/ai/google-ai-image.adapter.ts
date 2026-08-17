import type {
  IAiImageProvider,
  RemoveBackgroundRequest,
  RemoveBackgroundResult,
} from "@server/ports/ai-image-provider.port";

/**
 * Image-capable Gemini model, confirmed present for this project's API key
 * via a real ListModels call (Промпт №091 diagnostics) — "gemini-2.5-flash-image"
 * was one of the models the account can actually use, unlike some newer
 * preview names that returned HTTP 404 for text generation in that same
 * session. Uses the same generateContent endpoint already verified working
 * for text (google-ai.adapter.ts), extended with an inlineData image part —
 * the standard Gemini multimodal request shape, not a second API mechanism.
 */
const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";
const GEMINI_IMAGE_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`;
const FETCH_TIMEOUT_MS = 30_000;

const BACKGROUND_REMOVAL_PROMPT =
  "Edit this product photo: remove the existing background completely and replace it " +
  "with a solid, clean, pure white background (#FFFFFF). Keep the product itself " +
  "completely unaltered — do not change its shape, color, text, or details. Center " +
  "the product neatly within the frame with even margins on all sides. Return only " +
  "the edited image.";

export interface GoogleAiImageAdapterConfig {
  apiKey: string;
}

export class GoogleAiImageAdapter implements IAiImageProvider {
  constructor(private readonly config: GoogleAiImageAdapterConfig) {}

  async removeBackground(request: RemoveBackgroundRequest): Promise<RemoveBackgroundResult> {
    const response = await fetch(GEMINI_IMAGE_ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": this.config.apiKey,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: BACKGROUND_REMOVAL_PROMPT },
              {
                inlineData: {
                  mimeType: request.mimeType,
                  data: request.imageData.toString("base64"),
                },
              },
            ],
          },
        ],
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      throw new Error(`Google AI image request failed: HTTP ${response.status} ${body}`.trim());
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> };
      }>;
    };
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((part) => part.inlineData?.data);

    if (!imagePart?.inlineData?.data) {
      throw new Error("Google AI image response contained no output image");
    }

    return {
      imageData: Buffer.from(imagePart.inlineData.data, "base64"),
      mimeType: imagePart.inlineData.mimeType ?? request.mimeType,
    };
  }
}
