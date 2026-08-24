import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Download, Trash2, MapPin, Camera, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { readExifData, stripExifData } from '../../utils/exifHelper';
import { formatBytes } from '../../utils/formatters';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function ExifStripper() {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [cleanResult, setCleanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setIsProcessing(true);
    setCleanResult(null);

    try {
      const meta = await readExifData(selected);
      setMetadata(meta);

      // Automatically prepare clean version
      const clean = await stripExifData(selected);
      setCleanResult(clean);
    } catch (err) {
      console.error('EXIF processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setMetadata(null);
    setCleanResult(null);
  };

  return (
    <div className="space-y-8">
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Privacy & Metadata Sanitizer
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              EXIF & Location Wiper
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Remove hidden GPS location coordinates, phone serials, camera settings, and timestamps before sharing photos on social media or forums.
            </p>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/80 border border-purple-500/20">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">GPS Privacy Guard</div>
              <div className="text-[11px] text-slate-400">100% anonymized images</div>
            </div>
          </div>
        </div>
      </TiltCard>

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="image/jpeg,image/png,image/webp"
          multiple={false}
          title="Drop a photo to inspect and wipe metadata"
          subtitle="Check camera tags, GPS coordinates, and generate a 100% sanitized copy"
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
              <span className="text-xs text-slate-400">({formatBytes(file.size)})</span>
            </div>
            <button
              onClick={handleClear}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Upload Another
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Metadata Inspection Panel */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Detected Metadata Tags
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-indigo-400" /> Camera / Phone Model
                  </span>
                  <span className="font-medium text-slate-200">
                    {metadata?.camera || 'None or Hidden'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                  <span className="text-slate-400 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-400" /> GPS Geolocation
                  </span>
                  <span className="font-medium text-slate-200">
                    {metadata?.gps ? (
                      <span className="text-red-400 font-bold">⚠️ GPS Location Found</span>
                    ) : (
                      <span className="text-emerald-400">✓ No GPS Coordinates</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                  <span className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" /> Date & Time Timestamp
                  </span>
                  <span className="font-medium text-slate-200">
                    {metadata?.dateTime || 'None'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-white/5 text-xs">
                  <span className="text-slate-400 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" /> Software / OS Tag
                  </span>
                  <span className="font-medium text-slate-200">
                    {metadata?.software || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sanitized Clean Copy Panel */}
            <div className="bg-slate-900/70 border border-purple-500/30 rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-sm text-white">
                    100% Sanitized Safe Image
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All EXIF headers, camera serial identifiers, geolocation coordinates, and editing metadata have been completely wiped via canvas re-rasterization.
                </p>

                {cleanResult && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                    Clean file size: <span className="font-bold">{formatBytes(cleanResult.cleanSize)}</span> • Ready to share anonymously
                  </div>
                )}
              </div>

              {cleanResult && (
                <button
                  onClick={() => downloadSingleFile(cleanResult.blob, `clean_${file.name}`)}
                  className="w-full py-3 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-neon-purple transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download Clean Image
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
