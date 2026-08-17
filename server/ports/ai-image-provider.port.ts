/**
 * Port for AI-based product photo processing (Промпт №101): background
 * removal + clean white background + centering. Sibling to
 * IAiTextProvider (ai-provider.port.ts) — same Port → Adapter shape, same
 * factory-selected provider, so there is exactly one AI-provider mechanism
 * in this codebase, not two.
 */
export interface RemoveBackgroundRequest {
  imageData: Buffer;
  mimeType: string;
}

export interface RemoveBackgroundResult {
  imageData: Buffer;
  mimeType: string;
}

export interface IAiImageProvider {
  removeBackground(request: RemoveBackgroundRequest): Promise<RemoveBackgroundResult>;
}
