// Rasterizes public/icons/icon-source.svg (and the maskable variant) into the
// PNG sizes needed by the Web App Manifest, Apple touch icon, and Capacitor's
// native Android/iOS icon pipelines. Run manually when the brand icon source
// changes: `node scripts/generate-pwa-icons.mjs`. Requires the `sharp`
// devDependency (kept only for this asset-generation step, never imported by
// the app itself).
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "..", "public", "icons");
const resourcesDir = join(__dirname, "..", "resources");

const standardSvg = readFileSync(join(iconsDir, "icon-source.svg"));
const maskableSvg = readFileSync(join(iconsDir, "icon-maskable-source.svg"));
const foregroundSvg = readFileSync(join(iconsDir, "icon-foreground-source.svg"));
const splashSvg = readFileSync(join(iconsDir, "splash-source.svg"));

const targets = [
  { file: "icon-16.png", size: 16, svg: standardSvg },
  { file: "icon-32.png", size: 32, svg: standardSvg },
  { file: "icon-48.png", size: 48, svg: standardSvg },
  { file: "icon-192.png", size: 192, svg: standardSvg },
  { file: "icon-512.png", size: 512, svg: standardSvg },
  { file: "icon-maskable-192.png", size: 192, svg: maskableSvg },
  { file: "icon-maskable-512.png", size: 512, svg: maskableSvg },
  { file: "apple-touch-icon.png", size: 180, svg: standardSvg },
  { file: "splash-2732.png", size: 2732, svg: splashSvg },
];

for (const { file, size, svg } of targets) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(join(iconsDir, file));
  console.log(`  ${file} (${size}x${size})`);
}

console.log(`Generated ${targets.length} PWA/Capacitor icon files in public/icons/.`);

// `resources/` feeds `npx capacitor-assets generate` — the official
// @capacitor/assets tool that rasterizes native Android/iOS launcher icons
// and splash screens (mipmap-*/ and ios/App/App/Assets.xcassets/) from these
// sources, replacing the generic Capacitor template icon `cap add` scaffolds
// by default. Same brand source as the PWA icons above, just re-composited
// for the adaptive-icon (foreground/background layer) convention.
mkdirSync(resourcesDir, { recursive: true });

await sharp(standardSvg, { density: 768 })
  .resize(1024, 1024)
  .png()
  .toFile(join(resourcesDir, "icon.png"));
console.log("  resources/icon.png (1024x1024)");

await sharp(foregroundSvg, { density: 768 })
  .resize(1024, 1024)
  .png()
  .toFile(join(resourcesDir, "icon-foreground.png"));
console.log("  resources/icon-foreground.png (1024x1024)");

await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: "#2d5940" },
})
  .png()
  .toFile(join(resourcesDir, "icon-background.png"));
console.log("  resources/icon-background.png (1024x1024)");

await sharp(splashSvg, { density: 384 })
  .resize(2732, 2732)
  .png()
  .toFile(join(resourcesDir, "splash.png"));
console.log("  resources/splash.png (2732x2732)");

console.log("Generated resources/ set for `npx capacitor-assets generate`.");
