import React, { useState, useRef, useEffect } from 'react';
import { Crop, RotateCw, RotateCcw, FlipHorizontal, FlipVertical, Download, Trash2, Sliders, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { cropAndTransformImage, getImageDimensions, loadImage } from '../../utils/imageProcessor';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function ImageCropper() {
  const [file, setFile] = useState(null);
  const [imgElement, setImgElement] = useState(null);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  // Crop Box state in percentage of image (0 to 100)
  const [cropBox, setCropBox] = useState({ x: 10, y: 10, width: 80, height: 80 });
  const [aspectRatioPreset, setAspectRatioPreset] = useState('free'); // 'free', '1:1', '16:9', '9:16', '4:3'
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [targetKB, setTargetKB] = useState(null);
  const [quality, setQuality] = useState(90);

  const [croppedResult, setCroppedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragTypeRef = useRef(null); // 'move', 'nw', 'ne', 'se', 'sw'
  const dragStartPos = useRef({ x: 0, y: 0, box: { ...cropBox } });

  const aspectPresets = [
    { label: 'Freeform', value: 'free', ratio: null },
    { label: '1:1 Square (Avatar/Post)', value: '1:1', ratio: 1 },
    { label: '16:9 Landscape (YouTube)', value: '16:9', ratio: 16 / 9 },
    { label: '9:16 Portrait (Reel/Story)', value: '9:16', ratio: 9 / 16 },
    { label: '4:3 Classic', value: '4:3', ratio: 4 / 3 },
  ];

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    const img = await loadImage(selected);
    setImgElement(img);
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    setCropBox({ x: 10, y: 10, width: 80, height: 80 });
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCroppedResult(null);
  };

  const applyAspectPreset = (preset) => {
    setAspectRatioPreset(preset.value);
    if (!preset.ratio || naturalSize.width === 0) return;

    // Adjust crop box width and height to match aspect ratio
    const imgAspect = naturalSize.width / naturalSize.height;
    let newW = 70;
    let newH = (newW / preset.ratio) * imgAspect;

    if (newH > 80) {
      newH = 80;
      newW = newH * preset.ratio * (1 / imgAspect);
    }

    const newX = Math.max(0, (100 - newW) / 2);
    const newY = Math.max(0, (100 - newH) / 2);

    setCropBox({ x: newX, y: newY, width: newW, height: newH });
  };

  // Mouse / Touch handlers for dragging and resizing the crop box
  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragTypeRef.current = type;
    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      box: { ...cropBox },
    };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartPos.current.x) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartPos.current.y) / rect.height) * 100;
      const start = dragStartPos.current.box;

      if (dragTypeRef.current === 'move') {
        let newX = Math.max(0, Math.min(100 - start.width, start.x + deltaXPercent));
        let newY = Math.max(0, Math.min(100 - start.height, start.y + deltaYPercent));
        setCropBox((prev) => ({ ...prev, x: newX, y: newY }));
      } else if (dragTypeRef.current === 'se') {
        let newW = Math.max(15, Math.min(100 - start.x, start.width + deltaXPercent));
        let newH = Math.max(15, Math.min(100 - start.y, start.height + deltaYPercent));

        if (aspectRatioPreset !== 'free') {
          const ratioItem = aspectPresets.find((p) => p.value === aspectRatioPreset);
          if (ratioItem?.ratio && naturalSize.width > 0) {
            const imgAspect = naturalSize.width / naturalSize.height;
            newH = (newW / ratioItem.ratio) * imgAspect;
            if (newH + start.y > 100) {
              newH = 100 - start.y;
              newW = newH * ratioItem.ratio * (1 / imgAspect);
            }
          }
        }
        setCropBox((prev) => ({ ...prev, width: newW, height: newH }));
      } else if (dragTypeRef.current === 'nw') {
        let newW = Math.max(15, start.width - deltaXPercent);
        let newH = Math.max(15, start.height - deltaYPercent);
        let newX = Math.max(0, start.x + deltaXPercent);
        let newY = Math.max(0, start.y + deltaYPercent);
        setCropBox({ x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      dragTypeRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [cropBox, aspectRatioPreset, naturalSize]);

  // Perform actual crop operation
  const executeCrop = async () => {
    if (!file || naturalSize.width === 0) return;
    setIsProcessing(true);

    try {
      const realCrop = {
        x: Math.round((cropBox.x / 100) * naturalSize.width),
        y: Math.round((cropBox.y / 100) * naturalSize.height),
        width: Math.round((cropBox.width / 100) * naturalSize.width),
        height: Math.round((cropBox.height / 100) * naturalSize.height),
      };

      const result = await cropAndTransformImage(file, {
        crop: realCrop,
        rotation,
        flipH,
        flipV,
        format: file.type || 'image/jpeg',
        quality: quality / 100,
        targetSizeKB: targetKB,
      });

      const previewUrl = URL.createObjectURL(result.blob);
      setCroppedResult({
        blob: result.blob,
        url: previewUrl,
        width: result.width,
        height: result.height,
        size: result.size,
      });
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (file && naturalSize.width > 0) {
      executeCrop();
    }
  }, [cropBox, rotation, flipH, flipV, targetKB, quality]);

  return (
    <div className="space-y-8">
      <TiltCard glowColor="cyan" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Crop className="w-4 h-4" />
              Interactive Crop & Precision Sizer
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Visual Image Cropper & Size Limiter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Crop photos with rule-of-thirds grid, rotate, flip, and set strict custom output file sizes (e.g. Under 50KB or 100KB).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {aspectPresets.map((p) => (
              <button
                key={p.value}
                onClick={() => applyAspectPreset(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  aspectRatioPreset === p.value
                    ? 'bg-cyan-500 text-white shadow-neon-cyan'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-white/10'
                }`}
              >
                {p.label}
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
          title="Drop image to crop and set custom file size"
          subtitle="Visual rule-of-thirds crop • Rotate 90° • Flip • Target KB compression"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Top Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRotation((prev) => (prev + 270) % 360)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Rotate 90° Left"
              >
                <RotateCcw className="w-3.5 h-3.5" /> -90°
              </button>
              <button
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Rotate 90° Right"
              >
                <RotateCw className="w-3.5 h-3.5" /> +90°
              </button>
              <button
                onClick={() => setFlipH((prev) => !prev)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  flipH ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-300 border-white/10'
                }`}
                title="Flip Horizontal"
              >
                <FlipHorizontal className="w-3.5 h-3.5" /> Flip H
              </button>
              <button
                onClick={() => setFlipV((prev) => !prev)}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  flipV ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-300 border-white/10'
                }`}
                title="Flip Vertical"
              >
                <FlipVertical className="w-3.5 h-3.5" /> Flip V
              </button>
            </div>

            {/* Custom Target File Size */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Custom Target Size:</span>
                <input
                  type="number"
                  placeholder="e.g. 50, 100 (KB)"
                  value={targetKB || ''}
                  onChange={(e) => setTargetKB(e.target.value ? Number(e.target.value) : null)}
                  className="w-28 px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-cyan-500"
                />
                <span className="text-xs font-bold text-slate-400">KB</span>
                {targetKB && (
                  <button
                    onClick={() => setTargetKB(null)}
                    className="text-[11px] text-amber-400 hover:underline ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              <button
                onClick={() => setFile(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Change Image
              </button>
            </div>
          </div>

          {/* Interactive Workspace Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Crop Canvas Area */}
            <div className="lg:col-span-2 bg-slate-950 rounded-2xl border border-white/10 p-4 flex flex-col items-center justify-center overflow-hidden min-h-[420px]">
              <div
                ref={containerRef}
                className="relative select-none max-w-full max-h-[500px] overflow-hidden rounded-xl"
                style={{
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                  transition: 'transform 0.2s ease',
                }}
              >
                {imgElement && (
                  <img
                    src={imgElement.src}
                    alt="To Crop"
                    className="max-h-[460px] max-w-full block pointer-events-none"
                    draggable={false}
                  />
                )}

                {/* Dark Mask around crop box */}
                <div
                  className="absolute inset-0 bg-black/60 pointer-events-none"
                  style={{
                    clipPath: `polygon(
                      0% 0%, 100% 0%, 100% 100%, 0% 100%,
                      0% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y}%, 
                      ${cropBox.x}% ${cropBox.y + cropBox.height}%, 
                      ${cropBox.x + cropBox.width}% ${cropBox.y + cropBox.height}%, 
                      ${cropBox.x + cropBox.width}% ${cropBox.y}%, 
                      0% ${cropBox.y}%
                    )`,
                  }}
                />

                {/* Interactive Crop Box Overlay */}
                <div
                  onMouseDown={(e) => handleMouseDown(e, 'move')}
                  className="absolute border-2 border-cyan-400 cursor-move shadow-2xl"
                  style={{
                    left: `${cropBox.x}%`,
                    top: `${cropBox.y}%`,
                    width: `${cropBox.width}%`,
                    height: `${cropBox.height}%`,
                  }}
                >
                  {/* Rule of Thirds Grid Lines */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                    <div className="border-r border-b border-cyan-300" />
                    <div className="border-r border-b border-cyan-300" />
                    <div className="border-b border-cyan-300" />
                    <div className="border-r border-b border-cyan-300" />
                    <div className="border-r border-b border-cyan-300" />
                    <div className="border-b border-cyan-300" />
                    <div className="border-r border-cyan-300" />
                    <div className="border-r border-cyan-300" />
                    <div />
                  </div>

                  {/* Corner Handles */}
                  <div
                    onMouseDown={(e) => handleMouseDown(e, 'nw')}
                    className="absolute -top-2 -left-2 w-4 h-4 bg-cyan-400 border-2 border-slate-900 rounded-full cursor-nwse-resize"
                  />
                  <div
                    onMouseDown={(e) => handleMouseDown(e, 'se')}
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-cyan-400 border-2 border-slate-900 rounded-full cursor-nwse-resize"
                  />
                </div>
              </div>

              <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-2">
                <span>💡 Tip: Drag inside the box to move. Drag corner handles to resize.</span>
              </div>
            </div>

            {/* Cropped Output & Download Panel */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-white">Live Cropped Output</h3>
                  {isProcessing && (
                    <span className="text-[11px] text-cyan-400 flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                    </span>
                  )}
                </div>

                {/* Cropped Preview Thumbnail */}
                <div className="h-48 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-white/10 p-2">
                  {croppedResult ? (
                    <img
                      src={croppedResult.url}
                      alt="Cropped Preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                    />
                  ) : (
                    <span className="text-xs text-slate-500">Calculating preview...</span>
                  )}
                </div>

                {/* Specs Box */}
                {croppedResult && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Cropped Resolution:</span>
                      <span className="text-white font-bold">{croppedResult.width} × {croppedResult.height} px</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Output File Size:</span>
                      <span className="text-emerald-400 font-bold">{formatBytes(croppedResult.size)}</span>
                    </div>
                    {targetKB && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target Size Limit:</span>
                        <span className="text-cyan-300 font-semibold">&lt; {targetKB} KB</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {croppedResult && (
                <button
                  onClick={() => {
                    const base = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const ext = croppedResult.blob.type === 'image/jpeg' ? 'jpg' : croppedResult.blob.type === 'image/webp' ? 'webp' : file.name.split('.').pop() || 'jpg';
                    downloadSingleFile(croppedResult.blob, `cropped_${base}.${ext}`);
                  }}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-neon-cyan transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Cropped Image
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
