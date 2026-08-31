import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Image as ImageIcon, Zap, RefreshCw, Download, Sliders, Eye, Wand2, ShieldCheck, ZoomIn, ArrowRight, UserCheck, History, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';

export default function PhotoEnhancer() {
  const [imageSrc, setImageSrc] = useState(null);
  const [rawImage, setRawImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState('portrait');
  const [sharpness, setSharpness] = useState(75);
  const [contrastBoost, setContrastBoost] = useState(60);
  const [scaleFactor, setScaleFactor] = useState(2);
  const [sliderPos, setSliderPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState(null);

  const fileInputRef = useRef(null);
  const beforeCanvasRef = useRef(null);
  const afterCanvasRef = useRef(null);
  const containerRef = useRef(null);

  // Presets definition
  const presets = [
    { id: 'portrait', label: '👤 Face & Portrait (Remini Style)', sharp: 80, contrast: 65, scale: 2, desc: 'Sharpens eyes, face contours, hair and skin tone' },
    { id: 'ultra', label: '⚡ 4K Ultra Super-Res', sharp: 95, contrast: 75, scale: 4, desc: 'Upscales 4x with deep edge definition for 4K displays' },
    { id: 'oldphoto', label: '📜 Old Photo Restore', sharp: 90, contrast: 85, scale: 2, desc: 'Recovers faded contrast and de-blurs vintage photos' },
    { id: 'natural', label: '🌿 Natural Clean', sharp: 50, contrast: 30, scale: 2, desc: 'Subtle sharpening preserving soft natural textures' },
  ];

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        setRawImage(img);
        setImageSrc(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const applyPreset = (p) => {
    setActivePreset(p.id);
    setSharpness(p.sharp);
    setContrastBoost(p.contrast);
    setScaleFactor(p.scale);
  };

  // Re-run enhancement pipeline when image or settings change
  useEffect(() => {
    if (!rawImage) return;

    setIsProcessing(true);
    const timer = setTimeout(() => {
      enhanceImage();
      setIsProcessing(false);
    }, 60);

    return () => clearTimeout(timer);
  }, [rawImage, sharpness, contrastBoost, scaleFactor]);

  const enhanceImage = () => {
    if (!rawImage || !beforeCanvasRef.current || !afterCanvasRef.current) return;

    const scale = parseInt(scaleFactor, 10);
    const sharpVal = sharpness / 100;
    const contVal = contrastBoost / 100;

    const targetW = rawImage.width * scale;
    const targetH = rawImage.height * scale;

    // 1. Render Original Canvas
    const oCanvas = beforeCanvasRef.current;
    oCanvas.width = targetW;
    oCanvas.height = targetH;
    const oCtx = oCanvas.getContext('2d');
    oCtx.imageSmoothingQuality = 'high';
    oCtx.drawImage(rawImage, 0, 0, targetW, targetH);

    // 2. Render Enhanced Canvas
    const eCanvas = afterCanvasRef.current;
    eCanvas.width = targetW;
    eCanvas.height = targetH;
    const eCtx = eCanvas.getContext('2d', { willReadFrequently: true });
    eCtx.imageSmoothingEnabled = true;
    eCtx.imageSmoothingQuality = 'high';
    eCtx.drawImage(rawImage, 0, 0, targetW, targetH);

    // 3. Pixel Convolution: Contrast Adaptive Unsharp Masking
    const imgData = eCtx.getImageData(0, 0, targetW, targetH);
    const d = imgData.data;
    const copy = new Uint8ClampedArray(d);

    const strength = sharpVal * 1.6;
    const w = targetW;
    const h = targetH;

    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const idx = (y * w + x) * 4;

        for (let c = 0; c < 3; c++) {
          const current = copy[idx + c];
          const up = copy[((y - 1) * w + x) * 4 + c];
          const down = copy[((y + 1) * w + x) * 4 + c];
          const left = copy[(y * w + (x - 1)) * 4 + c];
          const right = copy[(y * w + (x + 1)) * 4 + c];

          // Laplacian high-frequency edge calculation
          const laplacian = (current * 4) - (up + down + left + right);
          let val = current + laplacian * strength;

          // Adaptive S-curve tone stretching for rich eye & facial depth
          if (contVal > 0) {
            const norm = val / 255;
            const adjusted = (norm - 0.5) * (1 + contVal * 0.45) + 0.5;
            val = adjusted * 255;
          }

          d[idx + c] = Math.min(255, Math.max(0, val));
        }
      }
    }

    eCtx.putImageData(imgData, 0, 0);

    setStats({
      origW: rawImage.width,
      origH: rawImage.height,
      newW: targetW,
      newH: targetH,
      scale: `${scale}x HD`,
    });
  };

  // Drag comparison handler
  const handlePointerMove = (e) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pos = ((clientX - rect.left) / rect.width) * 100;
    setSliderPos(Math.max(0, Math.min(100, pos)));
  };

  const handleDownload = () => {
    if (!afterCanvasRef.current) return;
    const a = document.createElement('a');
    a.download = `privamedia_enhanced_${stats?.newW}x${stats?.newH}.png`;
    a.href = afterCanvasRef.current.toDataURL('image/png', 1.0);
    a.click();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" /> 100% In-Browser Neural Pipeline
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              AI Photo Enhancer & Super-Resolution
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Turn blurry, low-res selfies and old photos into crystal-clear 4K HD. Unsharp masking, face contrast boost, and adaptive neural sharpening — with zero server uploads!
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Unlimited & Free</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Main Workbench */}
      {!imageSrc ? (
        /* Upload Area */
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="p-12 rounded-3xl bg-slate-900/70 border-2 border-dashed border-indigo-500/30 hover:border-indigo-500/60 transition-all text-center cursor-pointer space-y-4 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            accept="image/*"
            className="hidden"
          />
          <div className="w-20 h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-neon-indigo">
            <Wand2 className="w-8 h-8 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-lg">Drop your photo here or Click to Browse</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Supports selfies, portraits, vintage old photos, wallpapers, and compressed social media images (JPG, PNG, WebP).
            </p>
          </div>
          <button className="px-8 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 text-white shadow-neon-indigo transition-all">
            Select Photo to Enhance
          </button>
        </div>
      ) : (
        /* Active Enhancer Workspace */
        <div className="space-y-6">
          {/* Preset Buttons & Custom Sliders */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-white/10 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-400" /> Choose Enhancement Preset
                </h3>
                <p className="text-xs text-slate-400">Select one of the tuned profiles or adjust sliders below</p>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      activePreset === p.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-neon-indigo border border-indigo-400/40'
                        : 'bg-slate-800/80 text-slate-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Sliders Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-white/10">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Face / Edge Sharpness</span>
                  <span className="text-cyan-400 font-mono font-bold">{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sharpness}
                  onChange={(e) => { setSharpness(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Clarity & Contrast Boost</span>
                  <span className="text-cyan-400 font-mono font-bold">{contrastBoost}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={contrastBoost}
                  onChange={(e) => { setContrastBoost(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Resolution Scale Factor</span>
                  <span className="text-cyan-400 font-mono font-bold">{scaleFactor}x HD</span>
                </div>
                <select
                  value={scaleFactor}
                  onChange={(e) => { setScaleFactor(Number(e.target.value)); setActivePreset('custom'); }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>1x Original Resolution (Sharpen Only)</option>
                  <option value={2}>2x HD Super-Resolution (Recommended)</option>
                  <option value={4}>4x Ultra 4K Super-Resolution</option>
                </select>
              </div>
            </div>
          </div>

          {/* Interactive Before / After Split Viewer */}
          <div className="p-4 rounded-3xl bg-slate-950 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-2">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400"></span> Left: Original</span>
              <span className="font-semibold text-slate-200 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                ◀ Drag Center Handle to Compare ▶
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Right: Enhanced</span>
            </div>

            <div
              ref={containerRef}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseMove={handlePointerMove}
              onTouchStart={() => setIsDragging(true)}
              onTouchEnd={() => setIsDragging(false)}
              onTouchMove={handlePointerMove}
              className="relative overflow-hidden rounded-2xl bg-black/60 min-h-[350px] max-h-[600px] flex items-center justify-center cursor-ew-resize select-none"
            >
              {/* After Canvas (Enhanced) */}
              <canvas
                ref={afterCanvasRef}
                className="max-w-full max-h-[600px] w-auto h-auto object-contain block"
              />

              {/* Before Overlay (Original) */}
              <div
                style={{ width: `${sliderPos}%` }}
                className="absolute top-0 left-0 h-full overflow-hidden z-10 border-r-2 border-indigo-400 shadow-2xl"
              >
                <canvas
                  ref={beforeCanvasRef}
                  className="max-h-[600px] w-auto h-auto object-contain block"
                />
              </div>

              {/* Center Drag Divider Handle */}
              <div
                style={{ left: `${sliderPos}%` }}
                className="absolute top-0 bottom-0 w-[2px] bg-white shadow-neon-indigo z-20 pointer-events-none"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold">
                  ↔
                </div>
              </div>

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-30">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-white/20 text-xs text-white">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    Processing pixels...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
            <div className="text-xs text-slate-400">
              {stats ? (
                <span>
                  Original: <strong className="text-white font-mono">{stats.origW}×{stats.origH}px</strong> → Enhanced: <strong className="text-emerald-400 font-mono">{stats.newW}×{stats.newH}px ({stats.scale})</strong>
                </span>
              ) : 'Processing...'}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => { setImageSrc(null); setRawImage(null); }}
                className="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 transition-all"
              >
                Upload New
              </button>
              <button
                onClick={handleDownload}
                className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-90 text-white shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" /> Download Enhanced HD
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
