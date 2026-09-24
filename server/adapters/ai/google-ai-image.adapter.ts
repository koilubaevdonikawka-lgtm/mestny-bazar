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

// Задача №250 — the earlier prompt's "Center the product neatly within the
// frame with even margins on all sides" was an explicit recomposition
// instruction: for a tall/narrow product (e.g. a bottle), the generative
// model would re-crop/re-scale it to fit its own idea of "centered with
// even margins," cutting off the top/bottom. Removed that instruction
// outright and added an explicit "keep it exactly where/how it already is"
// constraint instead — this is a background swap, not a recompose.
//
// Задача №255 — separate defect from the cropping one above: when the
// original photo had other items behind/around the product (other bottles
// on a shelf, boxes, packaging), Gemini would sometimes only partially
// clear them, leaving dark smudges/shadows/partial silhouettes instead of
// a fully uniform white background. Appended an explicit "remove every
// other object completely, no residue" instruction — the anti-crop
// constraint above is untouched, this only adds to it.
//
// Orientation-correction instruction attempted and reverted: real testing
// against Gemini (multiple prompt variants, including one combined into this
// same prompt and several isolated single-purpose rotation-only calls) found
// it unreliable — it silently skipped 90°-rotation fixes, and at least one
// variant produced a false-positive rotation of an already-correct photo.
// Chasing a fix moved to a deterministic executor (Gemini classifies the
// needed rotation, a separate step applies it exactly), which was also
// abandoned after the one available Workers-compatible rotation library
// (@cf-wasm/photon) proved to corrupt colors on rotate(). No orientation
// instruction ships here; see normalizeExifOrientation (src/lib/
// image-compression.ts) for the fallback that does ship — camera-EXIF-based
// correction on the "без обработки ИИ" upload path.
const BACKGROUND_REMOVAL_PROMPT =
  "Edit this product photo: remove the existing background completely and replace it " +
  "with a solid, clean, pure white background (#FFFFFF). Do not crop, resize, reframe, " +
  "or reposition the product — keep it at exactly the same position, scale, and framing " +
  "as in the original photo. Keep the product itself completely unaltered — do not " +
  "change its shape, color, text, or details. Only replace the background pixels " +
  "around it; nothing else in the composition should change. The background must " +
  "become a single uniform pure white (#FFFFFF), with absolutely no remnants, " +
  "shadows, silhouettes, or color bleed from any other objects that were in the " +
  "original photo (other bottles, boxes, packaging, etc. behind or around the " +
  "product). If multiple items were visible in the original photo, keep ONLY the " +
  "single main product in the foreground and remove everything else completely — " +
  "no gray or black smudges, no partial second bottle or object visible anywhere " +
  "in the frame. Return only the edited image.";

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
