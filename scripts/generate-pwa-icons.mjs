// Generates every AIKUR brand raster — PWA icons, favicon, Android launcher
// icons + splash screens, the `resources/` set for `npx capacitor-assets`, and
// the Google Play store icon — from ONE source file:
// brand-assets/aikur-logo-source.png (1024x1024, logo + "AIKUR" caption on
// black). The logo is never redrawn: it is cropped to its own content box and
// scaled/centred on a pure #000000 canvas, sized per target so it stays inside
// each platform's safe zone. Every output keeps the file name AND pixel size
// of the file it replaces (sizes are read from the existing file on disk).
// Run manually when the brand source changes: `node scripts/generate-pwa-icons.mjs`.
// Requires the `sharp` devDependency (never imported by the app itself).
import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const iconsDir = join(root, "public", "icons");
const resourcesDir = join(root, "resources");
const androidRes = join(root, "android", "app", "src", "main", "res");
const storeDir = join(root, "store-assets");
const BLACK = { r: 0, g: 0, b: 0, alpha: 1 };

// Content box of the source (logo + caption), measured as every pixel with a
// channel > 25 — the rest of the source is near-black (≤ 12) background.
const SOURCE = join(root, "brand-assets", "aikur-logo-source.png");
const CONTENT = { left: 253, top: 223, width: 524, height: 647 };
const lockup = await sharp(SOURCE).extract(CONTENT).png().toBuffer();
const aspect = CONTENT.width / CONTENT.height;

/** Black w×h canvas with the lockup centred at `heightRatio` × min(w, h) tall. */
async function compose(w, h, heightRatio, { circle = false } = {}) {
  const lh = Math.round(Math.min(w, h) * heightRatio);
  const lw = Math.round(lh * aspect);
  const logo = await sharp(lockup).resize(lw, lh, { kernel: "lanczos3" }).png().toBuffer();
  let img = sharp({ create: { width: w, height: h, channels: 4, background: BLACK } }).composite([
    { input: logo, left: Math.round((w - lw) / 2), top: Math.round((h - lh) / 2) },
  ]);
  if (circle) {
    const mask = Buffer.from(
      `<svg width="${w}" height="${h}"><circle cx="${w / 2}" cy="${h / 2}" r="${w / 2}"/></svg>`,
    );
    img = sharp(await img.png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]);
  }
  return img;
}

const solid = (w, h) => sharp({ create: { width: w, height: h, channels: 4, background: BLACK } });
const sizeOf = async (file) => {
  const { width, height } = await sharp(file).metadata();
  return { width, height };
};
async function write(file, img, { opaque = false } = {}) {
  const out = opaque ? img.flatten({ background: BLACK }).removeAlpha() : img;
  await out.png().toFile(file);
  console.log(`  ${file.slice(root.length + 1)}`);
}

// Height of the lockup as a share of the canvas' shorter side. The lockup's
// diagonal is ~1.286× its height, so:
// - FULL (0.78): plain "any"-purpose squares, logo fills the icon.
// - MASKABLE (0.58): diagonal ≈ 0.75 of the canvas, inside the 80% safe circle.
// - ADAPTIVE (0.60): the foreground PNG is drawn into the 72dp viewport
//   (16.7% inset, mipmap-anydpi-v26), so its diagonal ≈ 0.77×72 ≈ 56dp —
//   inside Android's 66dp safe-zone circle.
// - SPLASH (0.38): ≤ ~40% of the screen's shorter side in every orientation.
const FULL = 0.78;
const MASKABLE = 0.58;
const ADAPTIVE = 0.6;
const SPLASH = 0.38;

// PWA / browser icons (public/icons + favicon).
const pwa = {
  "icon-16.png": FULL,
  "icon-32.png": FULL,
  "icon-48.png": FULL,
  "icon-192.png": FULL,
  "icon-512.png": FULL,
  "apple-touch-icon.png": 0.7,
  "icon-maskable-192.png": MASKABLE,
  "icon-maskable-512.png": MASKABLE,
};
for (const [file, ratio] of Object.entries(pwa)) {
  const path = join(iconsDir, file);
  const { width, height } = await sizeOf(path);
  await write(path, await compose(width, height, ratio), { opaque: true });
}
{
  const path = join(iconsDir, "splash-2732.png");
  const { width, height } = await sizeOf(path);
  await write(path, await compose(width, height, SPLASH), { opaque: true });
}

// favicon.ico: single 256×256 PNG-compressed entry (same layout as before).
{
  const png = await (await compose(256, 256, FULL)).flatten({ background: BLACK }).png().toBuffer();
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(0, 6); // width 256
  header.writeUInt8(0, 7); // height 256
  header.writeUInt8(0, 8); // no palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // data offset
  writeFileSync(join(root, "public", "favicon.ico"), Buffer.concat([header, png]));
  console.log("  public/favicon.ico");
}

// Android launcher icons + splash screens (every density/orientation/night).
for (const dir of readdirSync(androidRes)) {
  const d = join(androidRes, dir);
  if (dir.startsWith("mipmap-") && existsSync(join(d, "ic_launcher.png"))) {
    const { width: s } = await sizeOf(join(d, "ic_launcher.png"));
    await write(join(d, "ic_launcher.png"), await compose(s, s, ADAPTIVE));
    await write(join(d, "ic_launcher_round.png"), await compose(s, s, ADAPTIVE, { circle: true }));
    await write(join(d, "ic_launcher_foreground.png"), await compose(s, s, ADAPTIVE));
    await write(join(d, "ic_launcher_background.png"), solid(s, s));
  }
  if (dir.startsWith("drawable") && existsSync(join(d, "splash.png"))) {
    const { width, height } = await sizeOf(join(d, "splash.png"));
    await write(join(d, "splash.png"), await compose(width, height, SPLASH), { opaque: true });
  }
}

// resources/ — inputs for `npx capacitor-assets generate`, kept in sync so a
// future run of that tool reproduces the same AIKUR set instead of the old one.
mkdirSync(resourcesDir, { recursive: true });
await write(join(resourcesDir, "icon.png"), await compose(1024, 1024, FULL), { opaque: true });
await write(join(resourcesDir, "icon-foreground.png"), await compose(1024, 1024, ADAPTIVE));
await write(join(resourcesDir, "icon-background.png"), solid(1024, 1024));
await write(join(resourcesDir, "splash.png"), await compose(2732, 2732, SPLASH), { opaque: true });

// Google Play store listing: 512×512 32-bit PNG, no transparency (alpha
// channel kept but fully opaque, as Play's "32-bit PNG" spec expects).
mkdirSync(storeDir, { recursive: true });
await write(
  join(storeDir, "aikur-play-icon-512.png"),
  sharp(await (await compose(512, 512, FULL)).png().toBuffer()).ensureAlpha(1),
);

console.log("Done.");
