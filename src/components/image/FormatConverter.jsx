import React, { useState, useEffect } from 'react';
import { Layers, Download, Archive, Trash2, ArrowRight, RefreshCw, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { convertImageFormat } from '../../utils/imageProcessor';
import { formatBytes, truncateFilename } from '../../utils/formatters';
import { downloadSingleFile, downloadZip } from '../../utils/zipHelper';

export default function FormatConverter() {
  const [files, setFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('image/webp');
  const [quality, setQuality] = useState(90);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedItems, setConvertedItems] = useState([]);

  const formats = [
    { label: 'WebP (Ultra Light & Modern)', mime: 'image/webp', ext: 'webp' },
    { label: 'PNG (Lossless & Transparent)', mime: 'image/png', ext: 'png' },
    { label: 'JPEG / JPG (Universal)', mime: 'image/jpeg', ext: 'jpg' },
  ];

  const handleFilesSelected = (newFiles) => {
    const validImages = newFiles.filter((f) => f.type.startsWith('image/'));
    setFiles((prev) => [...prev, ...validImages]);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setConvertedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setFiles([]);
    setConvertedItems([]);
  };

  const runConversion = async () => {
    if (files.length === 0) return;
    setIsConverting(true);

    try {
      const selectedExt = formats.find((f) => f.mime === targetFormat)?.ext || 'webp';
      const results = [];

      for (const file of files) {
        const result = await convertImageFormat(file, targetFormat, quality / 100);
        const originalBase = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        const newName = `${originalBase}.${selectedExt}`;
        const previewUrl = URL.createObjectURL(result.blob);

        results.push({
          originalFile: file,
          convertedBlob: result.blob,
          newName,
          previewUrl,
          originalSize: file.size,
          newSize: result.size,
          ext: selectedExt,
        });
      }

      setConvertedItems(results);
    } catch (err) {
      console.error('Format conversion failed:', err);
      alert('Error during conversion. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  useEffect(() => {
    if (files.length > 0) {
      runConversion();
    }
  }, [files, targetFormat, quality]);

  const handleDownloadAllZip = async () => {
    if (convertedItems.length === 0) return;
    const zipFiles = convertedItems.map((item) => ({
      name: item.newName,
      blob: item.convertedBlob,
    }));
    await downloadZip(zipFiles, 'PrivaMedia_Converted_Images.zip');
  };

  return (
    <div className="space-y-8">
      {/* Header & Target Format Select */}
      <TiltCard glowColor="cyan" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Layers className="w-4 h-4" />
              Batch Format Transcoder
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Universal Image Converter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Convert between WebP, PNG, JPG, and AVIF in high resolution inside your browser with 0 latency.
            </p>
          </div>

          {/* Format Selector Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {formats.map((fmt) => (
              <button
                key={fmt.mime}
                onClick={() => setTargetFormat(fmt.mime)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  targetFormat === fmt.mime
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                }`}
              >
                {targetFormat === fmt.mime && <Check className="w-3.5 h-3.5" />}
                {fmt.label}
              </button>
            ))}
          </div>
        </div>
      </TiltCard>

      {/* Upload Zone */}
      <Dropzone
        onFilesSelected={handleFilesSelected}
        accept="image/*"
        title="Drop images to transcode into modern WebP / PNG / JPG"
        subtitle="Zero upload limits • 100% Client-side conversion • Preserves full resolution"
      />

      {/* Results */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white text-sm">
                {files.length} File{files.length > 1 ? 's' : ''} Ready
              </span>
              {isConverting && (
                <span className="text-xs text-cyan-400 flex items-center gap-1.5 animate-pulse">
                  <RefreshCw className="w-3 h-3 animate-spin" /> Converting locally...
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={clearAll}
                className="px-3.5 py-2 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
              {convertedItems.length > 1 && (
                <button
                  onClick={handleDownloadAllZip}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-neon-cyan transition-all flex items-center gap-1.5"
                >
                  <Archive className="w-3.5 h-3.5" /> Download All (ZIP)
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {convertedItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl bg-slate-900/70 border border-white/10 p-4 space-y-3 hover:border-cyan-500/40 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-white/10">
                      <img src={item.previewUrl} alt={item.newName} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-white truncate max-w-[150px]" title={item.newName}>
                        {truncateFilename(item.newName)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                          {item.ext}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">{formatBytes(item.newSize)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFile(index)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => downloadSingleFile(item.convertedBlob, item.newName)}
                  className="w-full py-2 rounded-xl text-xs font-semibold bg-cyan-600/80 hover:bg-cyan-600 text-white transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download {item.ext.toUpperCase()}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
