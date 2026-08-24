/**
 * Lightweight EXIF parser without external bloat
 */
export async function readExifData(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const view = new DataView(e.target.result);
      const metadata = {
        hasExif: false,
        camera: null,
        lens: null,
        dateTime: null,
        software: null,
        exposure: null,
        focalLength: null,
        iso: null,
        gps: null,
        fileSize: file.size,
        fileType: file.type,
        fileName: file.name
      };

      try {
        if (view.getUint16(0, false) !== 0xFFD8) {
          // Not a standard JPEG or has no EXIF header
          return resolve(metadata);
        }

        const length = view.byteLength;
        let offset = 2;

        while (offset < length) {
          if (view.getUint8(offset) !== 0xFF) break;
          const marker = view.getUint8(offset + 1);

          if (marker === 0xE1) { // APP1 Marker (EXIF)
            metadata.hasExif = true;
            const exifLength = view.getUint16(offset + 2, false);
            
            // Check for 'Exif\0\0'
            if (view.getUint32(offset + 4, false) === 0x45786966) {
              const tiffOffset = offset + 10;
              const isLittleEndian = view.getUint16(tiffOffset, false) === 0x4949;

              const getUint16 = (off) => view.getUint16(off, isLittleEndian);
              const getUint32 = (off) => view.getUint32(off, isLittleEndian);

              const firstIFDOffset = getUint32(tiffOffset + 4);
              if (firstIFDOffset < 8) return resolve(metadata);

              const numEntries = getUint16(tiffOffset + firstIFDOffset);
              for (let i = 0; i < numEntries; i++) {
                const entryOffset = tiffOffset + firstIFDOffset + 2 + i * 12;
                const tag = getUint16(entryOffset);

                // Common tags
                if (tag === 0x010F) metadata.camera = 'Make found in tags';
                if (tag === 0x0110) metadata.camera = (metadata.camera ? metadata.camera + ' ' : '') + 'Model found';
                if (tag === 0x0132) metadata.dateTime = 'Timestamp metadata present';
                if (tag === 0x0131) metadata.software = 'Software metadata present';
                if (tag === 0x8825) metadata.gps = 'GPS Coordinates present';
              }
            }
            break;
          }
          offset += 2 + view.getUint16(offset + 2, false);
        }
      } catch (err) {
        console.warn('EXIF parse error:', err);
      }

      resolve(metadata);
    };
    reader.readAsArrayBuffer(file.slice(0, 128 * 1024)); // Read first 128KB
  });
}

/**
 * Strips all EXIF, GPS, and device metadata from image by re-encoding via canvas
 */
export async function stripExifData(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');

      ctx.drawImage(img, 0, 0);

      // Determine output format
      const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to strip metadata'));
          return;
        }
        resolve({
          blob,
          originalSize: file.size,
          cleanSize: blob.size,
          width: canvas.width,
          height: canvas.height
        });
      }, mimeType, 0.95);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for metadata stripping'));
    };

    img.src = url;
  });
}
