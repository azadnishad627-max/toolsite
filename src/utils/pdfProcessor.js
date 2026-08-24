import { PDFDocument, PageSizes } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if available or use unpkg CDN worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Gets page count and title metadata of a PDF file
 */
export async function getPdfInfo(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  return {
    pageCount: pdfDoc.getPageCount(),
    title: pdfDoc.getTitle() || file.name,
    author: pdfDoc.getAuthor() || 'Unknown',
    fileSize: file.size
  };
}

/**
 * Merges multiple PDF files into one single PDF document
 */
export async function mergePdfs(pdfFiles) {
  if (!pdfFiles || pdfFiles.length === 0) {
    throw new Error('No PDF files provided for merging');
  }

  const mergedPdf = await PDFDocument.create();

  for (const file of pdfFiles) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  return new Blob([mergedPdfBytes], { type: 'application/pdf' });
}

/**
 * Splits / extracts pages from a PDF based on page range string (e.g. "1-3, 5, 8")
 */
export async function splitPdf(pdfFile, pageRangeString) {
  const arrayBuffer = await pdfFile.arrayBuffer();
  const srcPdf = await PDFDocument.load(arrayBuffer);
  const totalPages = srcPdf.getPageCount();

  const pagesToExtract = parsePageRange(pageRangeString, totalPages);
  if (pagesToExtract.length === 0) {
    throw new Error('Invalid page selection. Please check your page range input.');
  }

  const newPdf = await PDFDocument.create();
  const zeroIndexedPages = pagesToExtract.map((p) => p - 1);
  const copiedPages = await newPdf.copyPages(srcPdf, zeroIndexedPages);
  copiedPages.forEach((page) => newPdf.addPage(page));

  const pdfBytes = await newPdf.save();
  return {
    blob: new Blob([pdfBytes], { type: 'application/pdf' }),
    pageCount: copiedPages.length
  };
}

/**
 * Converts multiple JPG/PNG/WebP images into a single clean PDF document
 */
export async function imagesToPdf(imageFiles, options = {}) {
  const {
    pageSize = 'A4', // 'A4', 'Letter', 'Fit'
    orientation = 'portrait', // 'portrait', 'landscape'
    margin = 20,
  } = options;

  const pdfDoc = await PDFDocument.create();

  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer();
    let embeddedImage;

    // Convert WebP or non-standard to JPEG canvas first if needed
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      embeddedImage = await pdfDoc.embedJpg(arrayBuffer);
    } else if (file.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(arrayBuffer);
    } else {
      // Rasterize via canvas
      const img = new Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });
      URL.revokeObjectURL(url);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpegBlob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.92));
      const jpegBuffer = await jpegBlob.arrayBuffer();
      embeddedImage = await pdfDoc.embedJpg(jpegBuffer);
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage;

    let pageWidth, pageHeight;

    if (pageSize === 'Fit') {
      pageWidth = imgWidth + margin * 2;
      pageHeight = imgHeight + margin * 2;
    } else {
      const baseDims = pageSize === 'Letter' ? PageSizes.Letter : PageSizes.A4;
      if (orientation === 'landscape') {
        pageWidth = baseDims[1];
        pageHeight = baseDims[0];
      } else {
        pageWidth = baseDims[0];
        pageHeight = baseDims[1];
      }
    }

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate scaled dimensions to fit within margins
    const availableWidth = pageWidth - margin * 2;
    const availableHeight = pageHeight - margin * 2;
    const scale = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);

    const drawWidth = imgWidth * scale;
    const drawHeight = imgHeight * scale;
    const drawX = margin + (availableWidth - drawWidth) / 2;
    const drawY = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x: drawX,
      y: drawY,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Converts all pages of a PDF document into high-res PNG/JPG images
 */
export async function pdfToImages(pdfFile, options = {}) {
  const { format = 'image/jpeg', scale = 2.0 } = options;
  const arrayBuffer = await pdfFile.arrayBuffer();
  
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const totalPages = pdf.numPages;
  const images = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');

    if (format === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    await page.render({ canvasContext: ctx, viewport }).promise;

    const ext = format === 'image/png' ? 'png' : 'jpg';
    const blob = await new Promise((res) => canvas.toBlob(res, format, 0.92));
    const url = URL.createObjectURL(blob);

    images.push({
      pageNum,
      blob,
      url,
      width: canvas.width,
      height: canvas.height,
      size: blob.size,
      filename: `page_${pageNum}.${ext}`
    });
  }

  return images;
}

/**
 * Parses strings like "1-3, 5, 7-9" into an array of page numbers [1, 2, 3, 5, 7, 8, 9]
 */
export function parsePageRange(rangeStr, maxPages) {
  if (!rangeStr || !rangeStr.trim()) return [];
  const parts = rangeStr.split(',').map((s) => s.trim());
  const selectedPages = new Set();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-').map((s) => s.trim());
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const min = Math.max(1, Math.min(start, end));
        const max = Math.min(maxPages, Math.max(start, end));
        for (let i = min; i <= max; i++) {
          selectedPages.add(i);
        }
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= maxPages) {
        selectedPages.add(pageNum);
      }
    }
  }

  return Array.from(selectedPages).sort((a, b) => a - b);
}
