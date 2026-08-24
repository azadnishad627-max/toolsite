import React, { useState } from 'react';
import { Scissors, Download, Trash2, FileText, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import { splitPdf, getPdfInfo, parsePageRange } from '../../utils/pdfProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function PdfSplitter() {
  const [file, setFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [rangeInput, setRangeInput] = useState('');
  const [isSplitting, setIsSplitting] = useState(false);
  const [splitResult, setSplitResult] = useState(null);

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setSplitResult(null);

    try {
      const info = await getPdfInfo(selected);
      setPdfInfo(info);
      setRangeInput(`1-${Math.min(info.pageCount, 3)}`);
    } catch (err) {
      console.warn('PDF info error:', err);
    }
  };

  const handleSplit = async () => {
    if (!file || !pdfInfo) return;
    setIsSplitting(true);

    try {
      const result = await splitPdf(file, rangeInput);
      setSplitResult(result);
    } catch (err) {
      alert(err.message || 'Failed to extract PDF pages');
    } finally {
      setIsSplitting(false);
    }
  };

  const parsedPages = pdfInfo ? parsePageRange(rangeInput, pdfInfo.pageCount) : [];

  return (
    <div className="space-y-6">
      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="application/pdf"
          multiple={false}
          title="Drop a PDF document to split or extract pages"
          subtitle="Choose specific page numbers or ranges (e.g. 1-3, 5, 7)"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <span className="font-semibold text-white text-sm block">{file.name}</span>
                <span className="text-xs text-slate-400">
                  {formatBytes(file.size)} • {pdfInfo?.pageCount || 0} Total Pages
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setSplitResult(null);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Choose Another PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Scissors className="w-4 h-4 text-indigo-400" /> Specify Pages to Extract
              </h3>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="e.g. 1-4, 7, 9-12"
                  value={rangeInput}
                  onChange={(e) => {
                    setRangeInput(e.target.value);
                    setSplitResult(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
                <p className="text-[11px] text-slate-400">
                  Use comma separated numbers and dashes. Total available pages: {pdfInfo?.pageCount}
                </p>
              </div>

              {/* Selected Pages Visual Badges */}
              {parsedPages.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400">
                    Selected {parsedPages.length} Page{parsedPages.length > 1 ? 's' : ''}:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                    {parsedPages.map((pageNum) => (
                      <span
                        key={pageNum}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 text-[11px] font-bold border border-indigo-500/30"
                      >
                        Page {pageNum}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-white">Extracted Document</h4>
                <p className="text-xs text-slate-400">
                  Only the specified pages will be extracted into a brand new standalone PDF.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  disabled={parsedPages.length === 0 || isSplitting}
                  onClick={handleSplit}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-all flex items-center justify-center gap-2 shadow-neon-indigo"
                >
                  {isSplitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Scissors className="w-4 h-4" />
                  )}
                  Extract {parsedPages.length} Pages
                </button>

                {splitResult && (
                  <button
                    onClick={() => downloadSingleFile(splitResult.blob, `extracted_${file.name}`)}
                    className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Download className="w-4 h-4" /> Download Extracted PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
