import React, { useState, useEffect } from 'react';
import { Cpu, Download, Trash2, Lock, Unlock, RefreshCw, Check, Crop, Sliders } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { resizeImage, getImageDimensions } from '../../utils/imageProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';
import ImageCropper from './ImageCropper';

export default function ImageResizer() {
  const [activeSubMode, setActiveSubMode] = useState('resize'); // 'resize' or 'crop'
  const [file, setFile] = useState(null);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [targetKB, setTargetKB] = useState(null); // Custom target size in KB
  const [quality, setQuality] = useState(90);
  const [resizedBlob, setResizedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const presets = [
    { label: 'YouTube Thumbnail (1280x720)', w: 1280, h: 720 },
    { label: 'Instagram Square (1080x1080)', w: 1080, h: 1080 },
    { label: 'Instagram Story (1080x1920)', w: 1080, h: 1920 },
    { label: 'Govt Portal Photo (200x200)', w: 200, h: 200 },
    { label: 'Govt Signature (140x60)', w: 140, h: 60 },
  ];

  const sizePresets = [
    { label: '< 20 KB (Govt Signature)', kb: 20 },
    { label: '< 50 KB (Govt Photo)', kb: 50 },
    { label: '< 100 KB (Job Portal)', kb: 100 },
    { label: '< 200 KB (Web Fast)', kb: 200 },
  ];

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const dims = await getImageDimensions(selected);
    setOriginalDimensions(dims);
    setWidth(dims.width);
    setHeight(dims.height);
  };

  const handleWidthChange = (val) => {
    const newWidth = Number(val);
    setWidth(newWidth);
    if (lockAspectRatio && originalDimensions.width > 0) {
      const ratio = originalDimensions.height / originalDimensions.width;
      setHeight(Math.round(newWidth * ratio));
    }
  };

  const handleHeightChange = (val) => {
    const newHeight = Number(val);
    setHeight(newHeight);
    if (lockAspectRatio && originalDimensions.height > 0) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(newHeight * ratio));
    }
  };

  const applyPreset = (preset) => {
    setWidth(preset.w);
    setHeight(preset.h);
  };

  const handleResize = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setIsProcessing(true);
    try {
      const res = await resizeImage(file, {
        width,
        height,
        keepAspectRatio: false,
        format: file.type || 'image/jpeg',
        quality: quality / 100,
        targetSizeKB: targetKB,
      });
      setResizedBlob(res.blob);
    } catch (err) {
      console.error('Resize failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file && width > 0 && height > 0) {
      handleResize();
    }
  }, [file, width, height, targetKB, quality]);

  if (activeSubMode === 'crop') {
    return (
      <div className="space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-white/10">
            <button
              onClick={() => setActiveSubMode('resize')}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2"
            >
              <Cpu className="w-4 h-4" /> Resize Resolution & Size
            </button>
            <button
              onClick={() => setActiveSubMode('crop')}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan transition-all flex items-center gap-2"
            >
              <Crop className="w-4 h-4" /> Interactive Crop & Rotate
            </button>
          </div>
        </div>
        <ImageCropper />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-2xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setActiveSubMode('resize')}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-neon-indigo transition-all flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" /> Resize Resolution & Size
          </button>
          <button
            onClick={() => setActiveSubMode('crop')}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-all flex items-center gap-2"
          >
            <Crop className="w-4 h-4" /> Interactive Crop & Rotate
          </button>
        </div>
      </div>

      <TiltCard glowColor="indigo" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Cpu className="w-4 h-4" />
              Dimension & Custom File Size Sizer
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Precision Image Resizer
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Scale pixel dimensions and set custom file size limits (e.g. 50KB/100KB for exam forms) with zero server uploads.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {presets.slice(0, 3).map((p, idx) => (
              <button
                key={idx}
                onClick={() => applyPreset(p)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10 transition-all"
              >
                {p.label.split(' ')[0]} ({p.w}x{p.h})
              </button>
            ))}
          </div>
        </div>
      </TiltCard>

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="image/*"
          multiple={false}
          title="Drop image to resize resolution & custom file size"
          subtitle="Supports all image formats with instant resolution adjustments and KB limits"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-white text-sm">{file.name}</span>
              <span className="text-xs text-slate-400">
                Original: {originalDimensions.width} × {originalDimensions.height} px ({formatBytes(file.size)})
              </span>
            </div>
            <button
              onClick={() => setFile(null)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Change Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dimensions and Custom File Size Controls */}
            <div className="md:col-span-2 bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm text-white">Target Dimensions</h3>
                <button
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    lockAspectRatio
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-white/10'
                  }`}
                >
                  {lockAspectRatio ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  {lockAspectRatio ? 'Aspect Ratio Locked' : 'Free Transform'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Width (pixels)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-300">Height (pixels)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Custom File Size Limit (KB) Section */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                    Custom Output File Size Limit (KB)
                  </label>
                  {targetKB && (
                    <button
                      onClick={() => setTargetKB(null)}
                      className="text-[11px] text-amber-400 hover:underline"
                    >
                      Remove Size Limit
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="e.g. 50, 100, 200 (Leave empty for default)"
                    value={targetKB || ''}
                    onChange={(e) => setTargetKB(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-xs font-bold text-slate-400">KB</span>
                </div>

                {/* Quick Size Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {sizePresets.map((sp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setTargetKB(sp.kb)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                        targetKB === sp.kb
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-slate-950 text-slate-400 border-white/5 hover:border-white/20'
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets Grid */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs font-medium text-slate-400">Resolution Presets</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {presets.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyPreset(p)}
                      className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-white/5 hover:border-indigo-500/30 text-left transition-all"
                    >
                      <div className="text-xs font-semibold text-slate-200">{p.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Output Download Panel */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">Resized Output</h3>
                  {isProcessing && (
                    <span className="text-[11px] text-indigo-400 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                    </span>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-white/5 space-y-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resolution:</span>
                    <span className="text-white font-bold">{width} × {height} px</span>
                  </div>
                  {resizedBlob && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual Output Size:</span>
                      <span className="text-emerald-400 font-bold">{formatBytes(resizedBlob.size)}</span>
                    </div>
                  )}
                  {targetKB && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Custom Target:</span>
                      <span className="text-cyan-300 font-semibold">&lt; {targetKB} KB</span>
                    </div>
                  )}
                </div>
              </div>

              {resizedBlob && (
                <button
                  onClick={() => {
                    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const ext = resizedBlob.type === 'image/jpeg' ? 'jpg' : resizedBlob.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'jpg';
                    downloadSingleFile(resizedBlob, `resized_${width}x${height}_${base}.${ext}`);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Resized Image
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
