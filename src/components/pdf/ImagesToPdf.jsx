import React, { useState } from 'react';
import { FileImage, Download, Trash2, ArrowUp, ArrowDown, FileText, RefreshCw, Sliders } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import { imagesToPdf } from '../../utils/pdfProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function ImagesToPdf() {
  const [images, setImages] = useState([]);
  const [pageSize, setPageSize] = useState('A4'); // 'A4', 'Letter', 'Fit'
  const [orientation, setOrientation] = useState('portrait'); // 'portrait', 'landscape'
  const [margin, setMargin] = useState(20);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPdfBlob, setCompiledPdfBlob] = useState(null);

  const handleFilesSelected = (newFiles) => {
    const validImages = newFiles.filter((f) => f.type.startsWith('image/'));
    const items = validImages.map((file) => ({
      file,
      name: file.name,
      size: file.size,
      previewUrl: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...items]);
    setCompiledPdfBlob(null);
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setImages(updated);
    setCompiledPdfBlob(null);
  };

  const removeItem = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setCompiledPdfBlob(null);
  };

  const clearAll = () => {
    setImages([]);
    setCompiledPdfBlob(null);
  };

  const handleCompile = async () => {
    if (images.length === 0) return;
    setIsCompiling(true);

    try {
      const rawFiles = images.map((item) => item.file);
      const pdfBlob = await imagesToPdf(rawFiles, {
        pageSize,
        orientation,
        margin: Number(margin),
      });
      setCompiledPdfBlob(pdfBlob);
    } catch (err) {
      console.error('Images to PDF failed:', err);
      alert('Error creating PDF from images: ' + err.message);
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="space-y-6">
      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept="image/jpeg,image/png,image/webp"
        multiple={true}
        title="Drop JPG / PNG / WebP images to convert into a single PDF"
        subtitle="Combine photos, scanned book pages, or certificates into a clean multipage PDF"
      />

      {images.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Controls Bar */}
          <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Page Size */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Page Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(e.target.value);
                    setCompiledPdfBlob(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="A4">A4 Standard</option>
                  <option value="Letter">US Letter</option>
                  <option value="Fit">Fit to Image Size</option>
                </select>
              </div>

              {/* Orientation */}
              {pageSize !== 'Fit' && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Orientation:</span>
                  <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-white/10 text-xs">
                    <button
                      onClick={() => {
                        setOrientation('portrait');
                        setCompiledPdfBlob(null);
                      }}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        orientation === 'portrait'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => {
                        setOrientation('landscape');
                        setCompiledPdfBlob(null);
                      }}
                      className={`px-3 py-1 rounded-lg font-medium transition-all ${
                        orientation === 'landscape'
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Landscape
                    </button>
                  </div>
                </div>
              )}

              {/* Margin */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Margin:</span>
                <select
                  value={margin}
                  onChange={(e) => {
                    setMargin(Number(e.target.value));
                    setCompiledPdfBlob(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
                >
                  <option value="0">No Margin (0px)</option>
                  <option value="15">Small (15px)</option>
                  <option value="30">Standard (30px)</option>
                  <option value="50">Large (50px)</option>
                </select>
              </div>
            </div>

            <button
              onClick={clearAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All ({images.length})
            </button>
          </div>

          {/* Image Reorder Grid */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-400">
              Page Sequence (Drag or use arrows to rearrange):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              <AnimatePresence>
                {images.map((item, index) => (
                  <motion.div
                    key={item.name + index}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 relative group"
                  >
                    <div className="relative h-32 w-full bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/5">
                      <img src={item.previewUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[11px] font-bold">
                        Page {index + 1}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white truncate max-w-[120px]" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-slate-400 text-[10px]">{formatBytes(item.size)}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <button
                          disabled={index === 0}
                          onClick={() => moveItem(index, -1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-all"
                          title="Move Earlier"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={index === images.length - 1}
                          onClick={() => moveItem(index, 1)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 transition-all"
                          title="Move Later"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Compile & Download Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-end">
            <button
              disabled={isCompiling}
              onClick={handleCompile}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white shadow-neon-indigo transition-all flex items-center justify-center gap-2"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Compiling PDF Locally...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" /> Convert {images.length} Images to PDF
                </>
              )}
            </button>

            {compiledPdfBlob && (
              <button
                onClick={() => downloadSingleFile(compiledPdfBlob, 'PrivaMedia_Document.pdf')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download PDF ({formatBytes(compiledPdfBlob.size)})
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
