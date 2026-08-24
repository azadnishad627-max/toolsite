import { loadImage } from './imageProcessor';

/**
 * Extracts dominant color palette from an image file
 */
export async function extractColorsFromImage(file, colorCount = 6) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  // Downscale for fast sampling
  const sampleSize = 100;
  canvas.width = sampleSize;
  canvas.height = sampleSize;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

  const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
  const colorBuckets = {};

  // Sample every 4th pixel
  for (let i = 0; i < imageData.length; i += 16) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    // Ignore transparent and nearly transparent
    if (a < 128) continue;

    // Quantize colors to reduce space (groups of 24)
    const qr = Math.round(r / 24) * 24;
    const qg = Math.round(g / 24) * 24;
    const qb = Math.round(b / 24) * 24;

    const key = `${qr},${qg},${qb}`;
    colorBuckets[key] = (colorBuckets[key] || 0) + 1;
  }

  // Sort by frequency
  const sortedColors = Object.entries(colorBuckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount);

  return sortedColors.map(([rgbStr]) => {
    const [r, g, b] = rgbStr.split(',').map(Number);
    const hex = rgbToHex(r, g, b);
    const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
    return {
      r,
      g,
      b,
      hex,
      isDark,
      rgb: `rgb(${r}, ${g}, ${b})`
    };
  });
}

function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map((x) => {
    const hex = Math.min(255, Math.max(0, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}
