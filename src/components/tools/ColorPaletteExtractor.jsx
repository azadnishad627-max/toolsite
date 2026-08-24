import React, { useState } from 'react';
import { Palette, Copy, Check, Trash2, Sparkles, Code2, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { extractColorsFromImage } from '../../utils/colorExtractor';
import { downloadSingleFile } from '../../utils/zipHelper';

export default function ColorPaletteExtractor() {
  const [file, setFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [colors, setColors] = useState([]);
  const [copiedHex, setCopiedHex] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setImagePreview(URL.createObjectURL(selected));
    setIsExtracting(true);

    try {
      const palette = await extractColorsFromImage(selected, 6);
      setColors(palette);
    } catch (err) {
      console.error('Color extraction failed:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const copyToClipboard = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const downloadCssVariables = () => {
    if (colors.length === 0) return;
    let css = ':root {\n';
    colors.forEach((c, idx) => {
      css += `  --color-palette-${idx + 1}: ${c.hex}; /* ${c.rgb} */\n`;
    });
    css += '}\n';

    const blob = new Blob([css], { type: 'text/css' });
    downloadSingleFile(blob, 'palette.css');
  };

  return (
    <div className="space-y-8">
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Palette className="w-4 h-4" />
              Harmonic Color Intelligence
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              AI Palette & Swatch Extractor
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Extract dominant aesthetic color swatches, HEX codes, and CSS design tokens directly from photos and artwork.
            </p>
          </div>

          {colors.length > 0 && (
            <button
              onClick={downloadCssVariables}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-neon-purple transition-all flex items-center gap-2"
            >
              <Code2 className="w-4 h-4" /> Export CSS Variables
            </button>
          )}
        </div>
      </TiltCard>

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="image/*"
          multiple={false}
          title="Drop image to extract aesthetic color palette"
          subtitle="Generate color codes, swatch cards, and CSS tokens instantly"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <span className="font-semibold text-white text-sm">{file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setImagePreview(null);
                setColors([]);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Upload Different Image
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Preview */}
            <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-4 overflow-hidden flex items-center justify-center min-h-[260px]">
              {imagePreview && (
                <img src={imagePreview} alt="Preview" className="max-h-64 rounded-xl object-contain" />
              )}
            </div>

            {/* Extracted Swatches */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" /> Extracted Color Swatches
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {colors.map((c, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => copyToClipboard(c.hex)}
                    className="cursor-pointer rounded-2xl overflow-hidden bg-slate-900 border border-white/10 hover:border-purple-500/50 transition-all shadow-lg group"
                  >
                    <div
                      className="h-24 w-full relative flex items-center justify-center transition-transform"
                      style={{ backgroundColor: c.hex }}
                    >
                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-lg backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 ${
                          c.isDark ? 'bg-white/20 text-white' : 'bg-black/20 text-black'
                        }`}
                      >
                        {copiedHex === c.hex ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedHex === c.hex ? 'Copied!' : 'Copy HEX'}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-950 flex items-center justify-between">
                      <div>
                        <span className="font-['Space_Grotesk'] font-bold text-xs text-white block">{c.hex}</span>
                        <span className="text-[10px] text-slate-400">{c.rgb}</span>
                      </div>
                      <button className="p-1 text-slate-500 group-hover:text-purple-400 transition-colors">
                        {copiedHex === c.hex ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Dynamic Gradient Bar */}
              {colors.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/10 space-y-2">
                  <span className="text-xs font-semibold text-slate-300">Generated Linear Gradient</span>
                  <div
                    className="h-10 w-full rounded-xl shadow-inner border border-white/10"
                    style={{
                      background: `linear-gradient(90deg, ${colors.map((c) => c.hex).join(', ')})`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
