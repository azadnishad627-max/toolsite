import React, { useState } from 'react';
import { FileText, Download, Trash2, Archive, RefreshCw, Sparkles, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import { pdfToImages, getPdfInfo } from '../../utils/pdfProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile, downloadZip } from '../../utils/zipHelper';

export default function PdfToImages() {
  const [file, setFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [format, setFormat] = useState('image/jpeg'); // 'image/jpeg' or 'image/png'
  const [scale, setScale] = useState(2.0); // 1.5x (standard), 2.0x (HD), 3.0x (Ultra HD)
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedPages, setExtractedPages] = useState([]);
  const [previewModal, setPreviewModal] = useState(null);

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setExtractedPages([]);

    try {
      const info = await getPdfInfo(selected);
      setPdfInfo(info);
    } catch (err) {
      console.warn('PDF info error:', err);
    }
  };

  const handleExtract = async () => {
    if (!file) return;
    setIsExtracting(true);

    try {
      const pages = await pdfToImages(file, {
        format,
        scale: Number(scale),
      });
      setExtractedPages(pages);
    } catch (err) {
      console.error('PDF to images error:', err);
      alert('Failed to render PDF pages: ' + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownloadAllZip = async () => {
    if (extractedPages.length === 0) return;
    const zipFiles = extractedPages.map((page) => ({
      name: `${file.name.replace('.pdf', '')}_page_${page.pageNum}.${format === 'image/png' ? 'png' : 'jpg'}`,
      blob: page.blob,
    }));
    await downloadZip(zipFiles, `${file.name.replace('.pdf', '')}_Pages.zip`);
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="application/pdf"
          multiple={false}
          title="Drop a PDF document to convert into high-res JPG / PNG images"
          subtitle="Extract every page into crystal clear images with 1-click batch download"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls Bar */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-semibold text-white text-sm block">{file.name}</span>
                <span className="text-xs text-slate-400">
                  {formatBytes(file.size)} • {pdfInfo?.pageCount || '?'} Total Pages
                </span>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Format:</span>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="image/jpeg">JPEG (Compressed)</option>
                  <option value="image/png">PNG (Lossless High-Res)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Resolution:</span>
                <select
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="1.5">Standard (150 DPI)</option>
                  <option value="2.0">HD (200 DPI)</option>
                  <option value="3.0">Ultra HD (300 DPI)</option>
                </select>
              </div>

              <button
                disabled={isExtracting}
                onClick={handleExtract}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-neon-indigo transition-all flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Extracting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> Render Pages
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setFile(null);
                  setExtractedPages([]);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Remove PDF"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {extractedPages.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
                <span className="font-semibold text-white text-sm">
                  {extractedPages.length} Page{extractedPages.length > 1 ? 's' : ''} Rendered in HD
                </span>
                <button
                  onClick={handleDownloadAllZip}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg transition-all flex items-center gap-2"
                >
                  <Archive className="w-4 h-4" /> Download All Pages as ZIP
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {extractedPages.map((page) => (
                  <motion.div
                    key={page.pageNum}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-3 group hover:border-indigo-500/40 transition-all"
                  >
                    <div className="relative h-48 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                      <img src={page.url} alt={`Page ${page.pageNum}`} className="max-h-full max-w-full object-contain" />
                      <span className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-bold">
                        Page {page.pageNum}
                      </span>
                      <button
                        onClick={() => setPreviewModal(page)}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-semibold backdrop-blur-sm transition-all"
                      >
                        <Eye className="w-4 h-4" /> Full View
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">
                        {page.width} × {page.height} px
                      </span>
                      <span className="text-emerald-400 font-bold">{formatBytes(page.size)}</span>
                    </div>

                    <button
                      onClick={() => downloadSingleFile(page.blob, page.filename)}
                      className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Page {page.pageNum}
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Full Preview Modal */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Page {previewModal.pageNum} Preview ({previewModal.width} × {previewModal.height} px)
                </h3>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="h-[550px] bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                <img src={previewModal.url} alt="Full Page" className="max-h-full object-contain" />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    downloadSingleFile(previewModal.blob, previewModal.filename);
                    setPreviewModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-neon-indigo"
                >
                  <Download className="w-4 h-4" /> Download This Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
