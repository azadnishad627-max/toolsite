import React, { useState } from 'react';
import { Layers, Download, Trash2, ArrowUp, ArrowDown, FileText, RefreshCw, CheckCircle2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { mergePdfs, getPdfInfo } from '../../utils/pdfProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function PdfMerger() {
  const [pdfItems, setPdfItems] = useState([]);
  const [isMerging, setIsMerging] = useState(false);
  const [mergedBlob, setMergedBlob] = useState(null);

  const handleFilesSelected = async (newFiles) => {
    const validPdfs = newFiles.filter((f) => f.type === 'application/pdf' || f.name.endsWith('.pdf'));
    const loadedItems = [];

    for (const file of validPdfs) {
      try {
        const info = await getPdfInfo(file);
        loadedItems.push({
          file,
          name: file.name,
          size: file.size,
          pageCount: info.pageCount,
        });
      } catch (err) {
        console.warn('Could not read PDF info:', err);
        loadedItems.push({
          file,
          name: file.name,
          size: file.size,
          pageCount: '?',
        });
      }
    }

    setPdfItems((prev) => [...prev, ...loadedItems]);
    setMergedBlob(null);
  };

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pdfItems.length) return;
    const updated = [...pdfItems];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setPdfItems(updated);
    setMergedBlob(null);
  };

  const removeItem = (index) => {
    setPdfItems((prev) => prev.filter((_, i) => i !== index));
    setMergedBlob(null);
  };

  const clearAll = () => {
    setPdfItems([]);
    setMergedBlob(null);
  };

  const handleMerge = async () => {
    if (pdfItems.length < 2) {
      alert('Please add at least 2 PDF files to merge.');
      return;
    }

    setIsMerging(true);
    try {
      const filesToMerge = pdfItems.map((item) => item.file);
      const blob = await mergePdfs(filesToMerge);
      setMergedBlob(blob);
    } catch (err) {
      console.error('PDF merge failed:', err);
      alert('Failed to merge PDFs. Please check file integrity.');
    } finally {
      setIsMerging(false);
    }
  };

  const totalPages = pdfItems.reduce((acc, curr) => acc + (typeof curr.pageCount === 'number' ? curr.pageCount : 0), 0);

  return (
    <div className="space-y-8">
      <TiltCard glowColor="indigo" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Layers className="w-4 h-4" />
              Document Combiner
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Zero-Upload PDF Merger
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Combine multiple PDF documents, receipts, or contracts into a single organized file in seconds.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
            <span className="font-bold">{pdfItems.length}</span> Files Selected
            {totalPages > 0 && <span>• <span className="font-bold">{totalPages}</span> Total Pages</span>}
          </div>
        </div>
      </TiltCard>

      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept="application/pdf"
        title="Drop PDF documents here to merge"
        subtitle="Select multiple PDFs • Rearrange sequence • 100% private in-browser merging"
      />

      {pdfItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <span className="text-xs font-semibold text-slate-300">
              Drag / Reorder sequence before merging:
            </span>
            <button
              onClick={clearAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          </div>

          <div className="space-y-2">
            <AnimatePresence>
              {pdfItems.map((item, index) => (
                <motion.div
                  key={item.name + index}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <FileText className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-xs font-semibold text-white">{item.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {formatBytes(item.size)} • {item.pageCount} page{item.pageCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={index === 0}
                      onClick={() => moveItem(index, -1)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-all"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      disabled={index === pdfItems.length - 1}
                      onClick={() => moveItem(index, 1)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-300 transition-all"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all ml-1"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-end">
            <button
              disabled={pdfItems.length < 2 || isMerging}
              onClick={handleMerge}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 text-white shadow-neon-indigo transition-all flex items-center justify-center gap-2"
            >
              {isMerging ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Merging Locally...
                </>
              ) : (
                <>
                  <Layers className="w-4 h-4" /> Merge {pdfItems.length} PDFs Now
                </>
              )}
            </button>

            {mergedBlob && (
              <button
                onClick={() => downloadSingleFile(mergedBlob, 'PrivaMedia_Merged_Document.pdf')}
                className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Merged PDF ({formatBytes(mergedBlob.size)})
              </button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
