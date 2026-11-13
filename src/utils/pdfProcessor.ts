import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PDFDocumentProxy } from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

export interface LoadedPdfInfo {
  doc: PDFDocumentProxy;
  numPages: number;
  fileName: string;
  fileSizeBytes: number;
  previewDataUrl: string;
}

export async function loadPdfFile(file: File): Promise<LoadedPdfInfo> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const previewDataUrl = await renderPdfPageToDataUrl(doc, 1, 1.0);

  return {
    doc,
    numPages: doc.numPages,
    fileName: file.name,
    fileSizeBytes: file.size,
    previewDataUrl,
  };
}

export async function renderPdfPageToDataUrl(
  doc: PDFDocumentProxy,
  pageNumber: number,
  scale = 2.0
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const baseViewport = page.getViewport({ scale: 1.0 });
  const maxWidth = 1850;
  const adjustedScale = Math.min(scale, maxWidth / baseViewport.width);
  const viewport = page.getViewport({ scale: Math.max(1.0, adjustedScale) });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D context unavailable for PDF rendering.');
  }

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({
    canvasContext: context,
    canvas,
    viewport,
  }).promise;

  return canvas.toDataURL('image/jpeg', 0.92);
}

export async function extractPdfPageText(
  doc: PDFDocumentProxy,
  pageNumber: number
): Promise<string> {
  const page = await doc.getPage(pageNumber);
  const textContent = await page.getTextContent();
  return textContent.items
    .map((item) => ('str' in item ? item.str : ''))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function fileToImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Could not read image file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}
