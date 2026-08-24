import React, { useRef, useState } from 'react';
import { UploadCloud, FileType, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dropzone({
  onFilesSelected,
  accept = 'image/*',
  multiple = true,
  title = 'Drop your files here',
  subtitle = 'Supports PNG, JPG, WebP, AVIF up to 50MB per file',
  compact = false,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
      e.target.value = ''; // Reset input to allow re-uploading same file if desired
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`relative cursor-pointer group rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden text-center ${
        isDragOver
          ? 'border-indigo-400 bg-indigo-950/40 shadow-neon-indigo scale-[1.01]'
          : 'border-white/15 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/60'
      } ${compact ? 'p-6' : 'p-10 md:p-14'}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleChange}
        className="hidden"
      />

      {/* Decorative animated gradient circle */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center gap-3">
        <motion.div
          whileHover={{ scale: 1.15, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          className={`rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragOver
              ? 'bg-indigo-500 text-white shadow-neon-indigo'
              : 'bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-cyan-300'
          } ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}
        >
          {compact ? <Plus className="w-6 h-6" /> : <UploadCloud className="w-8 h-8" />}
        </motion.div>

        <div>
          <h3 className={`font-semibold text-white tracking-wide ${compact ? 'text-sm' : 'text-base md:text-lg'}`}>
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{subtitle}</p>
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
            <FileType className="w-3.5 h-3.5 text-indigo-400" />
            Click to Browse or Drag & Drop
          </span>
        </div>
      </div>
    </div>
  );
}
