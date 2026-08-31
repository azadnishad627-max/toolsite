import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Binary,
  Copy,
  Check,
  Trash2,
  ArrowRightLeft,
  Upload,
  Download,
  Image as ImageIcon,
  FileText,
  AlertCircle,
  Sparkles,
  FileCode,
  FileArchive,
  RefreshCw,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';
import { formatBytes } from '../../utils/formatters';

// Safe UTF-8 Base64 Encoders/Decoders
function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(base64) {
  // Strip whitespace and line breaks
  let clean = base64.trim().replace(/\s+/g, '');
  // Normalize URL-safe Base64
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  // Add padding if missing
  while (clean.length % 4 !== 0) {
    clean += '=';
  }

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

// Convert Base64 string to Blob for download
function base64ToBlob(base64, mimeType = 'application/octet-stream') {
  let clean = base64.trim().replace(/\s+/g, '');
  if (clean.includes(',')) {
    const parts = clean.split(',');
    const mimeMatch = parts[0].match(/:(.*?);/);
    if (mimeMatch) mimeType = mimeMatch[1];
    clean = parts[1];
  }
  clean = clean.replace(/-/g, '+').replace(/_/g, '/');
  while (clean.length % 4 !== 0) {
    clean += '=';
  }

  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

// Detect MIME type and previewability from Base64
function detectMimeAndType(inputStr) {
  const trimmed = inputStr.trim();
  if (!trimmed) return { isImage: false, isAudio: false, isPdf: false, isText: false, mime: 'text/plain', previewUrl: null };

  // Check if it's already a Data URI
  const dataUriMatch = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-+.]+);base64,(.*)$/s);
  if (dataUriMatch) {
    const mime = dataUriMatch[1].toLowerCase();
    const isImage = mime.startsWith('image/');
    const isAudio = mime.startsWith('audio/');
    const isPdf = mime === 'application/pdf';
    return {
      isImage,
      isAudio,
      isPdf,
      isText: mime.startsWith('text/') || mime.includes('json'),
      mime,
      previewUrl: isImage || isAudio ? trimmed : null
    };
  }

  // Check magic byte signatures in raw Base64
  const rawBase64 = trimmed.replace(/\s+/g, '');
  if (rawBase64.startsWith('iVBORw0KGgo')) {
    return { isImage: true, mime: 'image/png', previewUrl: `data:image/png;base64,${rawBase64}` };
  }
  if (rawBase64.startsWith('/9j/')) {
    return { isImage: true, mime: 'image/jpeg', previewUrl: `data:image/jpeg;base64,${rawBase64}` };
  }
  if (rawBase64.startsWith('R0lGOD')) {
    return { isImage: true, mime: 'image/gif', previewUrl: `data:image/gif;base64,${rawBase64}` };
  }
  if (rawBase64.startsWith('UklGR')) {
    return { isImage: true, mime: 'image/webp', previewUrl: `data:image/webp;base64,${rawBase64}` };
  }
  if (rawBase64.startsWith('PHN2Zy') || rawBase64.startsWith('PD94bWw')) {
    return { isImage: true, mime: 'image/svg+xml', previewUrl: `data:image/svg+xml;base64,${rawBase64}` };
  }
  if (rawBase64.startsWith('JVBERi0')) {
    return { isImage: false, isPdf: true, mime: 'application/pdf', previewUrl: null };
  }

  return { isImage: false, isAudio: false, isPdf: false, isText: true, mime: 'text/plain', previewUrl: null };
}

export default function Base64Tool() {
  const [mode, setMode] = useState('encode'); // 'encode' | 'decode'
  const [inputText, setInputText] = useState('Welcome to PrivaMedia Studio! 🚀 100% Client-Side Privacy.');
  const [outputText, setOutputText] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const [includeDataUriHeader, setIncludeDataUriHeader] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileMime, setFileMime] = useState('text/plain');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Perform Real-Time Conversion
  useEffect(() => {
    setError(null);
    if (!inputText.trim()) {
      setOutputText('');
      return;
    }

    try {
      if (mode === 'encode') {
        let encoded = utf8ToBase64(inputText);
        if (urlSafe) {
          encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        }
        if (includeDataUriHeader && fileMime) {
          encoded = `data:${fileMime};base64,${encoded}`;
        }
        setOutputText(encoded);
      } else {
        // Decode mode
        let cleanInput = inputText.trim();
        let mime = 'text/plain';

        if (cleanInput.startsWith('data:')) {
          const parts = cleanInput.split(',');
          if (parts.length > 1) {
            const mimeMatch = parts[0].match(/:(.*?);/);
            if (mimeMatch) mime = mimeMatch[1];
            cleanInput = parts[1];
          }
        }

        setFileMime(mime);
        const decoded = base64ToUtf8(cleanInput);
        setOutputText(decoded);
      }
    } catch (err) {
      setError(mode === 'encode' ? 'Encoding failed: ' + err.message : 'Invalid Base64 string format.');
      setOutputText('');
    }
  }, [inputText, mode, urlSafe, includeDataUriHeader, fileMime]);

  // Handle File Input Upload
  const handleFileUpload = (file) => {
    if (!file) return;
    setUploadedFile({
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream'
    });
    setFileMime(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target.result;
      if (mode === 'encode') {
        if (typeof result === 'string') {
          // Data URL format: data:...;base64,XXXXX
          if (includeDataUriHeader) {
            setInputText(result);
            setOutputText(result);
          } else {
            const commaIdx = result.indexOf(',');
            const rawBase64 = commaIdx !== -1 ? result.substring(commaIdx + 1) : result;
            setInputText(`[File Loaded: ${file.name} (${formatBytes(file.size)})]`);
            setOutputText(rawBase64);
          }
        }
      } else {
        // Decode file mode: read text
        reader.readAsText(file);
      }
    };

    if (mode === 'encode') {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSwap = () => {
    if (outputText && !error) {
      const newMode = mode === 'encode' ? 'decode' : 'encode';
      setMode(newMode);
      setInputText(outputText);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDecoded = () => {
    try {
      let blob;
      let filename = `decoded_output_${Date.now()}`;

      if (mode === 'decode') {
        const detected = detectMimeAndType(inputText);
        blob = base64ToBlob(inputText, detected.mime);
        
        let ext = '.bin';
        if (detected.mime.includes('image/png')) ext = '.png';
        else if (detected.mime.includes('image/jpeg')) ext = '.jpg';
        else if (detected.mime.includes('image/gif')) ext = '.gif';
        else if (detected.mime.includes('image/webp')) ext = '.webp';
        else if (detected.mime.includes('image/svg')) ext = '.svg';
        else if (detected.mime.includes('pdf')) ext = '.pdf';
        else if (detected.mime.includes('text') || detected.mime.includes('plain')) ext = '.txt';
        else if (detected.mime.includes('json')) ext = '.json';
        
        filename += ext;
      } else {
        blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
        filename += '.txt';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setUploadedFile(null);
    setError(null);
  };

  // Detect decoded media details
  const mediaInfo = useMemo(() => {
    if (mode === 'decode') {
      return detectMimeAndType(inputText);
    }
    return { isImage: false, isAudio: false, isPdf: false, mime: 'text/plain', previewUrl: null };
  }, [mode, inputText]);

  return (
    <div className="space-y-8">
      {/* 3D TiltCard Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Binary className="w-4 h-4" />
              Binary & Data URL Engine
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Base64 Encoder & Decoder
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Encode text and arbitrary binary files into Base64 strings or decode Base64 into readable text, live image previews, and downloadable files.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-slate-950 p-1.5 rounded-2xl border border-white/10 shrink-0">
            <button
              onClick={() => setMode('encode')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'encode'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neon-indigo'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4" /> Encode to Base64
            </button>
            <button
              onClick={() => setMode('decode')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                mode === 'decode'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-neon-indigo'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" /> Decode from Base64
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Main Workbench Area */}
      <div className="space-y-6">
        {/* Controls Toolbar */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* File Picker Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              {mode === 'encode' ? 'Encode Any File' : 'Load Base64 File'}
            </button>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              disabled={!outputText || Boolean(error)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 disabled:opacity-40 transition-all flex items-center gap-1.5"
              title="Swap input and output"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400" /> Swap
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Options Toggles */}
            {mode === 'encode' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={urlSafe}
                    onChange={(e) => setUrlSafe(e.target.checked)}
                    className="rounded bg-slate-950 border-white/10 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>URL-Safe Base64</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                  <input
                    type="checkbox"
                    checked={includeDataUriHeader}
                    onChange={(e) => setIncludeDataUriHeader(e.target.checked)}
                    className="rounded bg-slate-950 border-white/10 text-indigo-600 focus:ring-0 w-3.5 h-3.5"
                  />
                  <span>Data URI Header (`data:...`)</span>
                </label>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!outputText}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-all flex items-center gap-1.5 shadow-sm"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>

            <button
              onClick={handleDownloadDecoded}
              disabled={!inputText.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-400" /> Download File
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-all"
              title="Clear all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Uploaded File Info Pill */}
        {uploadedFile && (
          <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between text-xs text-indigo-300">
            <div className="flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-indigo-400" />
              <span className="font-semibold text-white">{uploadedFile.name}</span>
              <span className="text-slate-400">({formatBytes(uploadedFile.size)})</span>
              <span className="px-2 py-0.5 rounded bg-indigo-900/50 text-[10px] font-mono">{uploadedFile.type}</span>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-slate-400 hover:text-red-400 text-xs"
            >
              Remove
            </button>
          </div>
        )}

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs"
            >
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side by Side Work Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {mode === 'encode' ? 'Plaintext / Raw Data to Encode' : 'Base64 String to Decode'}
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {inputText.length} chars ({formatBytes(new Blob([inputText]).size)})
              </span>
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative rounded-2xl bg-slate-950 border transition-all ${
                isDragging ? 'border-indigo-500 ring-2 ring-indigo-500/30 bg-indigo-950/20' : 'border-white/10'
              }`}
            >
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  mode === 'encode'
                    ? 'Enter text or drop a file here to encode to Base64...'
                    : 'Paste Base64 encoded string or Data URI here to decode...'
                }
                spellCheck="false"
                className="w-full h-80 p-4 bg-transparent text-white font-mono text-xs leading-5 resize-none focus:outline-none placeholder:text-slate-600"
              />

              {isDragging && (
                <div className="absolute inset-0 rounded-2xl backdrop-blur-sm bg-indigo-950/70 border-2 border-dashed border-indigo-400 flex flex-col items-center justify-center pointer-events-none">
                  <Upload className="w-8 h-8 text-indigo-400 animate-bounce mb-2" />
                  <span className="text-sm font-bold text-white">Drop file to load</span>
                </div>
              )}
            </div>
          </div>

          {/* Output Box */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                {mode === 'encode' ? 'Base64 Encoded Result' : 'Decoded Result'}
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {outputText.length} chars ({formatBytes(new Blob([outputText]).size)})
              </span>
            </div>

            <div className="rounded-2xl bg-slate-950 border border-white/10 overflow-hidden relative">
              <textarea
                readOnly
                value={outputText}
                placeholder="Conversion output will appear here in real-time..."
                spellCheck="false"
                className="w-full h-80 p-4 bg-transparent text-emerald-400 font-mono text-xs leading-5 resize-none focus:outline-none placeholder:text-slate-600 selection:bg-indigo-500 selection:text-white"
              />
            </div>
          </div>
        </div>

        {/* Media Preview (Decoded Image, PDF, Audio) */}
        {mode === 'decode' && mediaInfo.isImage && mediaInfo.previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Decoded Image Live Preview
              </h3>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-mono text-xs border border-white/5">
                {mediaInfo.mime}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center min-h-[220px]">
              <img
                src={mediaInfo.previewUrl}
                alt="Decoded Preview"
                className="max-h-72 max-w-full rounded-lg object-contain shadow-lg border border-white/10"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
