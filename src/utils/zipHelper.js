import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Zips an array of items [{ name: 'img1.webp', blob: Blob }] and triggers browser download
 */
export async function downloadZip(files, zipName = 'PrivaMedia_Bundle.zip') {
  if (!files || files.length === 0) {
    throw new Error('No files to zip');
  }

  const zip = new JSZip();

  files.forEach((fileItem) => {
    zip.file(fileItem.name, fileItem.blob);
  });

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  });

  saveAs(zipBlob, zipName);
}

/**
 * Downloads a single Blob directly with the specified filename
 */
export function downloadSingleFile(blob, filename) {
  saveAs(blob, filename);
}
