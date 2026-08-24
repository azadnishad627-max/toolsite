import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Archive, Trash2, ArrowRight, CheckCircle2, Sliders, RefreshCw, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { compressImage } from '../../utils/imageProcessor';
import { formatBytes, calculateSavings, truncateFilename } from '../../utils/formatters';
import { downloadSingleFile, downloadZip } from '../../utils/zipHelper';

export default function ImageCompressor({ onSavingsAdd }) {
  const [files, setFiles] = useState([]);
  const [quality, setQuality] = useState(80);
  const [targetKB, setTargetKB] = useState(null); // null or number
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedItems, setProcessedItems] = useState([]);
  const [previewModal, setPreviewModal] = useState(null);

  const presets = [
    { label: 'High Quality (85%)', quality: 85, targetKB: null },
    { label: 'Govt Form (<50 KB)', quality: null, targetKB: 50 },
    { label: 'Job Portal (<100 KB)', quality: null, targetKB: 100 },
    { label: 'Web Optimized (<200 KB)', quality: null, targetKB: 200 },
  ];

  const handleFilesSelected = (newFiles) => {
    const validImages = newFiles.filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...validImages]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setProcessedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setProcessedItems([]);
  };

  const processImages = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const results = [];
      let totalSaved = 0;

      for (const file of files) {
        const result = await compressImage(file, {
          quality: quality / 100,
          targetSizeKB: targetKB,
          format: file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        });

        const originalUrl = URL.createObjectURL(file);
        const compressedUrl = URL.createObjectURL(result.blob);
        const savings = Math.max(0, file.size - result.size);
        totalSaved += savings;

        results.push({
          originalFile: file,
          compressedBlob: result.blob,
          originalUrl,
          compressedUrl,
          originalSize: file.size,
          compressedSize: result.size,
          width: result.width,
          height: result.height,
          savingsPercent: calculateSavings(file.size, result.size),
        });
      }

      setProcessedItems(results);
      if (onSavingsAdd && totalSaved > 0) {
        onSavingsAdd(totalSaved);
      }
    } catch (err) {
      console.error('Compression failed:', err);
      alert('Error during image compression. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      processImages();
    }
  }, [files, quality, targetKB]);

  const handleDownloadAllZip = async () => {
    if (processedItems.length === 0) return;
    const zipFiles = processedItems.map((item) => ({
      name: `compressed_${item.originalFile.name}`,
      blob: item.compressedBlob,
    }));
    await downloadZip(zipFiles, 'PrivaMedia_Compressed_Images.zip');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Controls */}
      <TiltCard glowColor="indigo" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              Smart Client-Side Compression
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Ultra Image Optimizer
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Reduce image file sizes by up to 90% without compromising visual clarity. Zero server uploads.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            {presets.map((preset, idx) => {
              const isSelected =
                (preset.targetKB === targetKB && preset.targetKB !== null) ||
                (preset.quality === quality && targetKB === null && preset.targetKB === null);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setTargetKB(preset.targetKB);
                    if (preset.quality) setQuality(preset.quality);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-neon-indigo'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Compression Sliders / Controls */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quality Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                Compression Quality: <span className="text-cyan-400 font-bold">{quality}%</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {quality > 80 ? 'Crisp Details' : quality > 50 ? 'Balanced' : 'Max Compression'}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={quality}
              onChange={(e) => {
                setTargetKB(null);
                setQuality(Number(e.target.value));
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Target Size Input (KB) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Or Exact Target Size (KB):
              </label>
              {targetKB && (
                <button
                  onClick={() => setTargetKB(null)}
                  className="text-[11px] text-amber-400 hover:underline"
                >
                  Reset to Quality %
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="e.g. 50, 100, 200"
                value={targetKB || ''}
                onChange={(e) => setTargetKB(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs font-semibold text-slate-400">KB</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Upload Zone */}
      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept="image/jpeg,image/png,image/webp,image/avif"
        title="Drop your images here for instant local compression"
        subtitle="Batch upload unlimited JPG, PNG, WebP files — 100% processed on your device"
      />

      {/* Results & Batch Actions */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                {files.length} Image{files.length > 1 ? 's' : ''} Loaded
              </span>
              {isProcessing && (
                <span className="text-xs text-indigo-400 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Processing locally...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
              {processedItems.length > 1 && (
                <button
                  onClick={handleDownloadAllZip}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-neon-indigo transition-all flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" /> Download All as ZIP
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processedItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative rounded-2xl bg-slate-900/70 border border-white/10 overflow-hidden group hover:border-indigo-500/40 transition-all"
              >
                {/* Image Thumbnail */}
                <div className="relative h-44 w-full bg-slate-950/80 overflow-hidden flex items-center justify-center">
                  <img
                    src={item.compressedUrl}
                    alt={item.originalFile.name}
                    className="max-h-full max-w-full object-contain"
                  />
                  {/* Savings Tag */}
                  {item.savingsPercent > 0 && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold shadow-lg">
                      -{item.savingsPercent}%
                    </div>
                  )}
                  {/* Preview Button */}
                  <button
                    onClick={() => setPreviewModal(item)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white text-xs font-semibold backdrop-blur-sm transition-all"
                  >
                    <Eye className="w-4 h-4" /> Compare Original vs Compressed
                  </button>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white truncate max-w-[180px]" title={item.originalFile.name}>
                      {truncateFilename(item.originalFile.name)}
                    </span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-medium">Original</span>
                      <span className="text-slate-300 font-semibold">{formatBytes(item.originalSize)}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    <div>
                      <span className="text-slate-500 text-[10px] block uppercase font-medium">Compressed</span>
                      <span className="text-emerald-400 font-bold">{formatBytes(item.compressedSize)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => downloadSingleFile(item.compressedBlob, `optimized_${item.originalFile.name}`)}
                    className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600/80 hover:bg-indigo-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Optimized
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {previewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/20 rounded-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white">
                  Side-by-Side Comparison: {previewModal.originalFile.name}
                </h3>
                <button
                  onClick={() => setPreviewModal(null)}
                  className="px-3 py-1 rounded-lg bg-white/10 text-slate-300 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Original</span>
                    <span className="text-slate-400">{formatBytes(previewModal.originalSize)}</span>
                  </div>
                  <div className="h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    <img src={previewModal.originalUrl} alt="Original" className="max-h-full object-contain" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-emerald-400">Compressed (-{previewModal.savingsPercent}%)</span>
                    <span className="text-emerald-400 font-bold">{formatBytes(previewModal.compressedSize)}</span>
                  </div>
                  <div className="h-64 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                    <img src={previewModal.compressedUrl} alt="Compressed" className="max-h-full object-contain" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    downloadSingleFile(previewModal.compressedBlob, `optimized_${previewModal.originalFile.name}`);
                    setPreviewModal(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-neon-indigo"
                >
                  <Download className="w-4 h-4" /> Download This File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
