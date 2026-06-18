import sharp from 'sharp';
import { mkdirSync } from 'fs';

mkdirSync('public/icons', { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = 'public/favicon.svg';

for (const size of sizes) {
  await sharp(svgPath)
    .resize(size, size, { fit: 'contain', background: { r: 45, g: 90, b: 39, alpha: 1 } })
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`);
  console.log(`Generated icon-${size}x${size}.png`);
}

// Apple touch icon (180x180)
await sharp(svgPath)
  .resize(180, 180, { fit: 'contain', background: { r: 45, g: 90, b: 39, alpha: 1 } })
  .png()
  .toFile('public/icons/apple-touch-icon.png');
console.log('Generated apple-touch-icon.png');

// Maskable icon with extra padding (512x512 with safe zone)
const maskableSize = 512;
const iconSize = Math.round(maskableSize * 0.6);
const padding = Math.round((maskableSize - iconSize) / 2);
await sharp(svgPath)
  .resize(iconSize, iconSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .extend({
    top: padding,
    bottom: maskableSize - iconSize - padding,
    left: padding,
    right: maskableSize - iconSize - padding,
    background: { r: 45, g: 90, b: 39, alpha: 1 },
  })
  .png()
  .toFile('public/icons/maskable-icon-512x512.png');
console.log('Generated maskable-icon-512x512.png');

console.log('\nAll icons generated successfully!');
