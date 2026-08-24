import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { removeBackground } from '@imgly/background-removal';
import { downloadSingleFile } from '../../utils/imageProcessor';

export default function BackgroundRemover() {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [processedUrl, setProcessedUrl] = useState(null);
  const [status, setStatus] = useState('idle'); // 'idle', 'loading-model', 'processing', 'success', 'error'
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      resetState();
      setFile(selectedFile);
      setOriginalUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      resetState();
      setFile(droppedFile);
      setOriginalUrl(URL.createObjectURL(droppedFile));
    }
  }, []);

  const resetState = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedUrl(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImage = async () => {
    if (!file) return;

    setStatus('loading-model');
    setProgress(0);
    setErrorMessage('');

    try {
      const config = {
        progress: (key, current, total) => {
          // Calculate progress percentage for model downloading
          const p = Math.round((current / total) * 100);
          setProgress(p);
          if (p === 100 && status !== 'processing') {
             setStatus('processing');
          }
        }
      };

      // Call imgly background removal
      const imageBlob = await removeBackground(file, config);
      
      const newUrl = URL.createObjectURL(imageBlob);
      setProcessedUrl(newUrl);
      setStatus('success');
      
    } catch (err) {
      console.error('BG Removal Error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Failed to remove background. Ensure you have a stable internet connection for the initial model download.');
    }
  };

  const handleDownload = () => {
    if (processedUrl) {
      const fileName = file.name.replace(/\.[^/.]+$/, "") + "-nobg.png";
      downloadSingleFile(processedUrl, fileName);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-400" />
          AI Background Remover
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Instantly remove backgrounds using Edge AI. The model runs 100% locally in your browser. 
          Your images never leave your device.
        </p>
      </div>

      {!file ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="border-2 border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors p-12 text-center cursor-pointer group flex flex-col items-center"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-300 font-medium text-lg">Click or drag an image here</p>
          <p className="text-slate-500 text-sm mt-2">Supports JPG, PNG, WEBP (Runs fully offline after first load)</p>
        </div>
      ) : (
        <div className="bg-[#0f1423] border border-white/10 rounded-2xl p-6 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Original Image */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> Original
              </h3>
              <div className="aspect-square bg-slate-900 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                <img src={originalUrl} alt="Original" className="max-w-full max-h-full object-contain" />
              </div>
            </div>

            {/* Processed Image */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" /> Removed Background
              </h3>
              <div className="aspect-square bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMWEyMDI3Ii8+PHJlY3QgeD0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFmMjU0MiIvPjxyZWN0IHk9IjEwIiB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIGZpbGw9IiMxZjI1NDIiLz48cmVjdCB4PSIxMCIgeT0iMTAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0iIzFhMjAyNyIvPjwvc3ZnPg==')] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center relative">
                
                {status === 'idle' && (
                  <button 
                    onClick={processImage}
                    className="absolute z-10 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Remove Background
                  </button>
                )}

                {(status === 'loading-model' || status === 'processing') && (
                  <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    <div className="w-full max-w-xs space-y-2">
                      <p className="text-sm font-medium text-slate-200">
                        {status === 'loading-model' 
                          ? 'Loading AI Model (Once per device)...' 
                          : 'Extracting subject...'}
                      </p>
                      {status === 'loading-model' && progress > 0 && (
                        <div className="w-full bg-slate-800 rounded-full h-2.5">
                          <div className="bg-indigo-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                      )}
                      {status === 'loading-model' && (
                        <p className="text-[10px] text-slate-400">This requires internet the first time only (~40MB).</p>
                      )}
                    </div>
                  </div>
                )}

                {status === 'success' && (
                  <img src={processedUrl} alt="Processed" className="max-w-full max-h-full object-contain" />
                )}

                {status === 'error' && (
                  <div className="absolute inset-0 z-10 bg-black/60 flex flex-col items-center justify-center p-6 text-center text-red-400">
                    <AlertCircle className="w-10 h-10 mb-2" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-6 flex flex-wrap gap-4 items-center justify-between border-t border-white/5 pt-6">
            <button
              onClick={resetState}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Start Over
            </button>
            
            {status === 'success' && (
              <button
                onClick={handleDownload}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:shadow-lg hover:shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download Transparent PNG
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
