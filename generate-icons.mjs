import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const srcPath = 'MMP.png';

for (const size of sizes) {
  await sharp(srcPath)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Apple touch icon (180x180)
await sharp(srcPath)
  .resize(180, 180)
  .png()
  .toFile('public/icons/apple-touch-icon.png');
console.log('Generated apple-touch-icon.png');

// Maskable icon (512x512) — the source already has padding/background
await sharp(srcPath)
  .resize(512, 512)
  .png()
  .toFile('public/icons/maskable-icon-512x512.png');
console.log('Generated maskable-icon-512x512.png');

console.log('\nAll icons regenerated from MMP.png!');
