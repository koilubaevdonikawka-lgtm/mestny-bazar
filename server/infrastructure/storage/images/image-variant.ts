/** Named image variant specification for derivative generation. */
export interface ImageVariant {
  readonly name: string;
  readonly maxWidth: number;
  readonly maxHeight: number;
  readonly quality?: number;
  readonly suffix: string;
}

export const DEFAULT_IMAGE_VARIANTS: readonly ImageVariant[] = Object.freeze([
  Object.freeze({ name: "thumbnail", maxWidth: 160, maxHeight: 160, quality: 80, suffix: "_thumb" }),
  Object.freeze({ name: "medium", maxWidth: 800, maxHeight: 800, quality: 85, suffix: "_md" }),
  Object.freeze({ name: "large", maxWidth: 1600, maxHeight: 1600, quality: 90, suffix: "_lg" }),
]);
