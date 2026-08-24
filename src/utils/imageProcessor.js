/**
 * Loads an image File or Blob into an HTMLImageElement
 */
export function loadImage(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Gets dimensions (width, height) of an image file
 */
export async function getImageDimensions(file) {
  const img = await loadImage(file);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

/**
 * Converts a Canvas element to a Blob with specified MIME type and quality
 */
function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Accurately hits target file size (KB) by binary searching JPEG/WebP quality
 * and downscaling canvas if even min quality cannot meet the target size.
 */
async function compressToTargetKB(canvas, format, targetSizeKB, defaultQuality = 0.85) {
  if (!targetSizeKB || targetSizeKB <= 0) {
    const blob = await canvasToBlob(canvas, format, defaultQuality);
    return blob;
  }

  // PNG does not support lossy compression in HTML5 canvas.toBlob.
  // We use image/jpeg or image/webp so quality control takes effect.
  let effectiveFormat = format;
  if (format === 'image/png' || !format) {
    effectiveFormat = 'image/jpeg';
  }

  const targetSizeBytes = targetSizeKB * 1024;
  let workingCanvas = canvas;
  let bestBlob = null;

  // Try binary searching quality on current resolution, or scale down if needed
  for (let scaleAttempt = 0; scaleAttempt < 5; scaleAttempt++) {
    let minQ = 0.01;
    let maxQ = 0.98;
    let localBest = null;

    // Binary search for highest quality that satisfies size <= targetSizeBytes
    for (let i = 0; i < 10; i++) {
      const currentQ = (minQ + maxQ) / 2;
      const testBlob = await canvasToBlob(workingCanvas, effectiveFormat, currentQ);
      if (!testBlob) break;

      if (testBlob.size <= targetSizeBytes) {
        localBest = testBlob;
        minQ = currentQ; // search for higher quality
      } else {
        maxQ = currentQ; // too large, lower quality
      }
    }

    if (localBest) {
      bestBlob = localBest;
      break;
    }

    // If even min quality (0.01) exceeds target size, downscale resolution slightly
    const minBlob = await canvasToBlob(workingCanvas, effectiveFormat, 0.05);
    const ratio = minBlob ? Math.max(0.5, Math.min(0.85, Math.sqrt(targetSizeBytes / minBlob.size))) : 0.8;

    const scaledCanvas = document.createElement('canvas');
    scaledCanvas.width = Math.max(10, Math.round(workingCanvas.width * ratio));
    scaledCanvas.height = Math.max(10, Math.round(workingCanvas.height * ratio));
    const sCtx = scaledCanvas.getContext('2d');

    if (effectiveFormat === 'image/jpeg') {
      sCtx.fillStyle = '#FFFFFF';
      sCtx.fillRect(0, 0, scaledCanvas.width, scaledCanvas.height);
    }
    sCtx.drawImage(workingCanvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
    workingCanvas = scaledCanvas;
  }

  if (!bestBlob) {
    bestBlob = await canvasToBlob(workingCanvas, effectiveFormat, 0.01);
  }

  return bestBlob;
}

/**
 * Compresses an image with specified quality, max dimensions, and optional target size
 */
export async function compressImage(file, options = {}) {
  const {
    quality = 0.8,
    maxWidth = 4096,
    maxHeight = 4096,
    format = 'image/jpeg',
    targetSizeKB = null
  } = options;

  const img = await loadImage(file);
  let { naturalWidth: width, naturalHeight: height } = img;

  // Scale down if exceeds max dimensions
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.drawImage(img, 0, 0, width, height);

  let blob;
  if (targetSizeKB && targetSizeKB > 0) {
    blob = await compressToTargetKB(canvas, format, targetSizeKB, quality);
  } else {
    blob = await canvasToBlob(canvas, format, quality);
  }

  return {
    blob: blob || file,
    width,
    height,
    size: blob ? blob.size : file.size
  };
}

/**
 * Resizes an image with exact dimensions or scale percentage + optional target file size (KB)
 */
export async function resizeImage(file, options = {}) {
  const {
    width = null,
    height = null,
    scalePercent = 100,
    keepAspectRatio = true,
    format = 'image/jpeg',
    quality = 0.9,
    targetSizeKB = null
  } = options;

  const img = await loadImage(file);
  let targetWidth = img.naturalWidth;
  let targetHeight = img.naturalHeight;

  if (scalePercent && scalePercent !== 100) {
    const scale = scalePercent / 100;
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  } else if (width && height) {
    if (keepAspectRatio) {
      const ratio = Math.min(width / targetWidth, height / targetHeight);
      targetWidth = Math.round(targetWidth * ratio);
      targetHeight = Math.round(targetHeight * ratio);
    } else {
      targetWidth = width;
      targetHeight = height;
    }
  } else if (width) {
    const ratio = width / targetWidth;
    targetWidth = width;
    targetHeight = Math.round(targetHeight * ratio);
  } else if (height) {
    const ratio = height / targetHeight;
    targetHeight = height;
    targetWidth = Math.round(targetWidth * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  let blob;
  if (targetSizeKB && targetSizeKB > 0) {
    blob = await compressToTargetKB(canvas, format, targetSizeKB, quality);
  } else {
    blob = await canvasToBlob(canvas, format, quality);
  }

  return {
    blob,
    width: targetWidth,
    height: targetHeight,
    size: blob ? blob.size : file.size
  };
}

/**
 * Crops and transforms (rotate, flip) an image with custom bounding box and optional target size (KB)
 */
export async function cropAndTransformImage(file, options = {}) {
  const {
    crop = { x: 0, y: 0, width: 0, height: 0 },
    rotation = 0, // 0, 90, 180, 270
    flipH = false,
    flipV = false,
    outputWidth = null,
    outputHeight = null,
    format = 'image/jpeg',
    quality = 0.92,
    targetSizeKB = null
  } = options;

  const img = await loadImage(file);
  const cropW = crop.width || img.naturalWidth;
  const cropH = crop.height || img.naturalHeight;
  const cropX = crop.x || 0;
  const cropY = crop.y || 0;

  const outW = outputWidth || cropW;
  const outH = outputHeight || cropH;

  const canvas = document.createElement('canvas');
  
  if (rotation === 90 || rotation === 270) {
    canvas.width = outH;
    canvas.height = outW;
  } else {
    canvas.width = outW;
    canvas.height = outH;
  }

  const ctx = canvas.getContext('2d');

  if (format === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

  ctx.drawImage(
    img,
    cropX,
    cropY,
    cropW,
    cropH,
    -outW / 2,
    -outH / 2,
    outW,
    outH
  );
  ctx.restore();

  let blob;
  if (targetSizeKB && targetSizeKB > 0) {
    blob = await compressToTargetKB(canvas, format, targetSizeKB, quality);
  } else {
    blob = await canvasToBlob(canvas, format, quality);
  }

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob ? blob.size : file.size
  };
}

/**
 * Converts image to target format (e.g. image/webp, image/png, image/jpeg)
 */
export async function convertImageFormat(file, targetMimeType, quality = 0.9) {
  const img = await loadImage(file);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  if (targetMimeType === 'image/jpeg') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  const blob = await canvasToBlob(canvas, targetMimeType, quality);

  return {
    blob,
    width: canvas.width,
    height: canvas.height,
    size: blob.size
  };
}
