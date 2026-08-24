/**
 * Formats bytes to human-readable string (e.g. 1.25 MB, 450 KB)
 */
export function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculates percentage savings between original and compressed size
 */
export function calculateSavings(originalSize, newSize) {
  if (!originalSize || !newSize || originalSize <= newSize) return 0;
  return Math.round(((originalSize - newSize) / originalSize) * 100);
}

/**
 * Truncate long filenames
 */
export function truncateFilename(name, maxLength = 24) {
  if (!name || name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex === -1) return name.slice(0, maxLength) + '...';
  
  const ext = name.slice(extIndex);
  const base = name.slice(0, extIndex);
  const charsToShow = maxLength - ext.length - 3;
  return base.slice(0, Math.max(4, charsToShow)) + '...' + ext;
}
