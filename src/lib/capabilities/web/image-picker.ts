import type { CameraCapability, CapturedImage, GalleryCapability } from "../types";

/**
 * `<input type="file">` works in every browser and inside a Capacitor
 * WebView on both platforms — `capture="environment"` opens the camera app
 * directly on mobile, and is silently ignored (falls back to a file picker)
 * where unsupported. Genuinely functional today; swap to @capacitor/camera
 * later only if a native in-app camera UI (vs. the OS camera app) is needed.
 */
const pickFile = (capture: boolean): Promise<CapturedImage | null> =>
  new Promise((resolve) => {
    if (typeof document === "undefined") {
      resolve(null);
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (capture) input.capture = "environment";

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: String(reader.result), mimeType: file.type });
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };

    input.click();
  });

export const webCamera: CameraCapability = {
  isSupported: () => typeof document !== "undefined",
  capturePhoto: () => pickFile(true),
};

export const webGallery: GalleryCapability = {
  isSupported: () => typeof document !== "undefined",
  pickImage: () => pickFile(false),
};
