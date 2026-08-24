import React, { useState } from 'react';
import { Layers, Download, Copy, Check, Sparkles, Trash2, Code2, Archive } from 'lucide-react';
import { motion } from 'framer-motion';
import Dropzone from '../common/Dropzone';
import TiltCard from '../3d/TiltCard';
import { loadImage } from '../../utils/imageProcessor';
import { downloadZip } from '../../utils/zipHelper';
import { formatBytes } from '../../utils/formatters';

export default function FaviconGenerator() {
  const [file, setFile] = useState(null);
  const [icons, setIcons] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const iconSizes = [
    { name: 'favicon-16x16.png', size: 16, label: '16×16 (Standard Browser Tab)' },
    { name: 'favicon-32x32.png', size: 32, label: '32×32 (High DPI Desktop)' },
    { name: 'apple-touch-icon.png', size: 180, label: '180×180 (Apple iOS Home Screen)' },
    { name: 'android-chrome-192x192.png', size: 192, label: '192×192 (Android / PWA Icon)' },
    { name: 'android-chrome-512x512.png', size: 512, label: '512×512 (PWA Splash & Store)' },
  ];

  const handleFileSelected = async (files) => {
    if (files.length === 0) return;
    const selected = files[0];
    setFile(selected);
    setIsGenerating(true);

    try {
      const img = await loadImage(selected);
      const generated = [];

      for (const item of iconSizes) {
        const canvas = document.createElement('canvas');
        canvas.width = item.size;
        canvas.height = item.size;
        const ctx = canvas.getContext('2d');

        // Draw image onto canvas maintaining sharpness
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, item.size, item.size);

        const blob = await new Promise((res) => canvas.toBlob(res, 'image/png'));
        const url = URL.createObjectURL(blob);

        generated.push({
          ...item,
          blob,
          url,
          fileSize: blob.size,
        });
      }

      setIcons(generated);
    } catch (err) {
      console.error('Favicon generation error:', err);
      alert('Error generating icons');
    } finally {
      setIsGenerating(false);
    }
  };

  const htmlCode = `<!-- Favicon & App Icon Meta Tags -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">`;

  const webManifest = `{
  "name": "My App",
  "short_name": "App",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}`;

  const copyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAllZip = async () => {
    if (icons.length === 0) return;
    const zipFiles = icons.map((icon) => ({
      name: icon.name,
      blob: icon.blob,
    }));

    // Add webmanifest file
    zipFiles.push({
      name: 'site.webmanifest',
      blob: new Blob([webManifest], { type: 'application/json' }),
    });

    await downloadZip(zipFiles, 'Favicon_Package.zip');
  };

  return (
    <div className="space-y-8">
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" />
              Complete Favicon & PWA Suite
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Multi-Size Favicon Generator
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Convert your logo into standard 16px, 32px, 180px Apple Touch Icon, Android 192/512px icons + ready HTML code in 1-click.
            </p>
          </div>

          {icons.length > 0 && (
            <button
              onClick={handleDownloadAllZip}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-neon-purple transition-all flex items-center gap-2"
            >
              <Archive className="w-4 h-4" /> Download Complete Favicon Package (.ZIP)
            </button>
          )}
        </div>
      </TiltCard>

      {!file ? (
        <Dropzone
          onFilesSelected={handleFileSelected}
          accept="image/*"
          multiple={false}
          title="Drop your brand logo to generate all favicon & app icon sizes"
          subtitle="Supports high-res PNG, JPG, WebP, SVG • 100% processed in browser"
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/10">
            <span className="font-semibold text-white text-sm">Source: {file.name}</span>
            <button
              onClick={() => {
                setFile(null);
                setIcons([]);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-red-400 hover:bg-red-500/10 border border-red-500/20 transition-all flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" /> Upload Different Logo
            </button>
          </div>

          {/* Generated Icons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {icons.map((icon) => (
              <div
                key={icon.size}
                className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-col items-center justify-between text-center space-y-3"
              >
                <div className="text-[11px] font-semibold text-slate-300 truncate w-full">{icon.size}×{icon.size} px</div>
                <div className="w-20 h-20 bg-slate-950 rounded-xl flex items-center justify-center border border-white/5 p-2">
                  <img src={icon.url} alt={icon.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div className="text-[10px] text-slate-400 font-mono">{formatBytes(icon.fileSize)}</div>
              </div>
            ))}
          </div>

          {/* HTML Snippet Box */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" /> HTML &lt;head&gt; Code
              </h4>
              <button
                onClick={copyHtml}
                className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Code'}
              </button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-xs font-mono overflow-x-auto border border-white/5">
              {htmlCode}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
