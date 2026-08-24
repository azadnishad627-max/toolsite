import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Type, Square, Trash2, ChevronLeft, ChevronRight, Move, Palette, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Configure pdfjs worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

const FONT_OPTIONS = [
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times Roman', value: 'TimesRoman' },
  { label: 'Courier', value: 'Courier' },
];

const FONT_MAP = {
  Helvetica: StandardFonts.Helvetica,
  TimesRoman: StandardFonts.TimesRoman,
  Courier: StandardFonts.Courier,
};

export default function PdfEditor() {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.5);
  const [pdfDimensions, setPdfDimensions] = useState({ width: 0, height: 0 });

  // Edit state
  const [tool, setTool] = useState('text'); // 'text', 'whiteout', 'select'
  const [elements, setElements] = useState({}); // { pageNum: [elements] }
  const [selectedId, setSelectedId] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [saving, setSaving] = useState(false);

  // Text controls
  const [fontSize, setFontSize] = useState(14);
  const [fontColor, setFontColor] = useState('#000000');
  const [fontFamily, setFontFamily] = useState('Helvetica');

  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load PDF
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    setPdfFile(file);
    setElements({});
    setSelectedId(null);
    setCurrentPage(1);

    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
  };

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const page = await pdfDoc.getPage(currentPage);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPdfDimensions({ width: viewport.width, height: viewport.height });

      const ctx = canvas.getContext('2d');
      if (!cancelled) {
        await page.render({ canvasContext: ctx, viewport }).promise;
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, scale]);

  // Click handler on overlay to add elements
  const handleOverlayClick = (e) => {
    if (tool === 'select') {
      setSelectedId(null);
      return;
    }

    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now().toString();

    const newElement = {
      id,
      type: tool, // 'text' or 'whiteout'
      x, y,
      text: tool === 'text' ? 'Type here...' : '',
      fontSize,
      fontColor,
      fontFamily,
      width: tool === 'whiteout' ? 150 : undefined,
      height: tool === 'whiteout' ? 24 : undefined,
    };

    setElements((prev) => ({
      ...prev,
      [currentPage]: [...(prev[currentPage] || []), newElement],
    }));
    setSelectedId(id);
    setTool('select');
  };

  // Update element text
  const updateElementText = (id, newText) => {
    setElements((prev) => {
      const pageEls = (prev[currentPage] || []).map((el) =>
        el.id === id ? { ...el, text: newText } : el
      );
      return { ...prev, [currentPage]: pageEls };
    });
  };

  // Update element property
  const updateElement = (id, props) => {
    setElements((prev) => {
      const pageEls = (prev[currentPage] || []).map((el) =>
        el.id === id ? { ...el, ...props } : el
      );
      return { ...prev, [currentPage]: pageEls };
    });
  };

  // Delete selected element
  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => {
      const pageEls = (prev[currentPage] || []).filter((el) => el.id !== selectedId);
      return { ...prev, [currentPage]: pageEls };
    });
    setSelectedId(null);
  };

  // Drag element
  const handleMouseDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    setTool('select');
    const rect = overlayRef.current.getBoundingClientRect();
    const el = (elements[currentPage] || []).find((el) => el.id === id);
    if (!el) return;
    setDragging({ id, offsetX: e.clientX - rect.left - el.x, offsetY: e.clientY - rect.top - el.y });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const rect = overlayRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragging.offsetX;
    const y = e.clientY - rect.top - dragging.offsetY;
    updateElement(dragging.id, { x, y });
  }, [dragging, currentPage]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      // Touch support
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  const handleTouchMove = useCallback((e) => {
    if (!dragging || !e.touches[0]) return;
    const touch = e.touches[0];
    const rect = overlayRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left - dragging.offsetX;
    const y = touch.clientY - rect.top - dragging.offsetY;
    updateElement(dragging.id, { x, y });
  }, [dragging, currentPage]);

  // Resize whiteout box
  const handleResizeMouseDown = (e, id) => {
    e.stopPropagation();
    e.preventDefault();
    const el = (elements[currentPage] || []).find((el) => el.id === id);
    if (!el) return;
    const startX = e.clientX || e.touches?.[0]?.clientX;
    const startY = e.clientY || e.touches?.[0]?.clientY;
    const startW = el.width || 150;
    const startH = el.height || 24;

    const onMove = (ev) => {
      const cx = ev.clientX || ev.touches?.[0]?.clientX;
      const cy = ev.clientY || ev.touches?.[0]?.clientY;
      updateElement(id, {
        width: Math.max(30, startW + (cx - startX)),
        height: Math.max(12, startH + (cy - startY)),
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove);
    window.addEventListener('touchend', onUp);
  };

  // ── SAVE EDITED PDF ──
  const savePdf = async () => {
    if (!pdfFile) return;
    setSaving(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDocLib = await PDFDocument.load(arrayBuffer);

      // Embed fonts we need
      const embeddedFonts = {};
      for (const [key, val] of Object.entries(FONT_MAP)) {
        embeddedFonts[key] = await pdfDocLib.embedFont(val);
      }

      // Apply edits to each page
      for (const [pageNumStr, pageElements] of Object.entries(elements)) {
        const pageNum = parseInt(pageNumStr);
        const page = pdfDocLib.getPage(pageNum - 1);
        const { width: pdfW, height: pdfH } = page.getSize();
        const scaleX = pdfW / pdfDimensions.width;
        const scaleY = pdfH / pdfDimensions.height;

        for (const el of pageElements) {
          const pdfX = el.x * scaleX;
          // PDF Y is from bottom, canvas Y is from top
          const pdfY = pdfH - (el.y * scaleY);

          if (el.type === 'whiteout') {
            const w = (el.width || 150) * scaleX;
            const h = (el.height || 24) * scaleY;
            page.drawRectangle({
              x: pdfX,
              y: pdfY - h,
              width: w,
              height: h,
              color: rgb(1, 1, 1), // White
              borderWidth: 0,
            });
          }

          if (el.type === 'text' && el.text && el.text !== 'Type here...') {
            const font = embeddedFonts[el.fontFamily] || embeddedFonts.Helvetica;
            const adjustedFontSize = el.fontSize * scaleX;

            // Parse hex color to RGB
            const hex = el.fontColor || '#000000';
            const r = parseInt(hex.slice(1, 3), 16) / 255;
            const g = parseInt(hex.slice(3, 5), 16) / 255;
            const b = parseInt(hex.slice(5, 7), 16) / 255;

            page.drawText(el.text, {
              x: pdfX,
              y: pdfY - adjustedFontSize,
              size: adjustedFontSize,
              font,
              color: rgb(r, g, b),
            });
          }
        }
      }

      const pdfBytes = await pdfDocLib.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = pdfFile.name.replace('.pdf', '-edited.pdf');
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const currentElements = elements[currentPage] || [];
  const selectedElement = currentElements.find((el) => el.id === selectedId);
  const hasEdits = Object.values(elements).some((arr) => arr.length > 0);

  // ── RENDER ──
  if (!pdfFile) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Type className="w-6 h-6 text-indigo-400" />
            PDF Editor
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Upload any PDF, add or replace text, whiteout sections, and download a clean edited copy.
            100% private — your PDF never leaves your device.
          </p>
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-indigo-500/30 rounded-2xl bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors p-12 text-center cursor-pointer group flex flex-col items-center"
        >
          <input type="file" className="hidden" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} />
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8 text-indigo-400" />
          </div>
          <p className="text-slate-300 font-medium text-lg">Click to upload a PDF</p>
          <p className="text-slate-500 text-sm mt-2">Your file stays 100% in your browser</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-4">
      {/* ── TOOLBAR ── */}
      <div className="bg-[#0f1423] border border-white/10 rounded-2xl p-3 flex flex-wrap items-center gap-2 md:gap-4">
        {/* Tool Buttons */}
        <div className="flex items-center gap-1.5">
          <ToolBtn active={tool === 'text'} onClick={() => setTool('text')} icon={<Type className="w-4 h-4" />} label="Add Text" />
          <ToolBtn active={tool === 'whiteout'} onClick={() => setTool('whiteout')} icon={<Square className="w-4 h-4" />} label="Whiteout" />
          <ToolBtn active={tool === 'select'} onClick={() => setTool('select')} icon={<Move className="w-4 h-4" />} label="Select" />
        </div>

        <div className="w-px h-6 bg-white/10 hidden md:block" />

        {/* Font Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              if (selectedId) updateElement(selectedId, { fontFamily: e.target.value });
            }}
            className="bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none"
          >
            {FONT_OPTIONS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <div className="flex items-center gap-1">
            <button onClick={() => { const s = Math.max(8, fontSize - 2); setFontSize(s); if (selectedId) updateElement(selectedId, { fontSize: s }); }}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400">
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs text-slate-300 w-6 text-center">{fontSize}</span>
            <button onClick={() => { const s = Math.min(72, fontSize + 2); setFontSize(s); if (selectedId) updateElement(selectedId, { fontSize: s }); }}
              className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400">
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <input
            type="color"
            value={fontColor}
            onChange={(e) => {
              setFontColor(e.target.value);
              if (selectedId) updateElement(selectedId, { fontColor: e.target.value });
            }}
            className="w-7 h-7 rounded-lg border border-white/10 cursor-pointer bg-transparent"
            title="Text Color"
          />
        </div>

        <div className="w-px h-6 bg-white/10 hidden md:block" />

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {selectedId && (
            <button onClick={deleteSelected} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          )}
          <button
            onClick={savePdf}
            disabled={!hasEdits || saving}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            {saving ? 'Saving...' : 'Download Edited PDF'}
          </button>
        </div>
      </div>

      {/* ── PAGE NAV ── */}
      <div className="flex items-center justify-center gap-4">
        <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <span className="text-sm text-slate-400">Page {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 text-xs flex items-center gap-1">
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── PDF CANVAS + OVERLAY ── */}
      <div className="flex justify-center overflow-auto max-h-[70vh] bg-slate-900/50 rounded-2xl border border-white/5 p-4">
        <div ref={containerRef} className="relative inline-block shadow-2xl" style={{ cursor: tool === 'text' ? 'text' : tool === 'whiteout' ? 'crosshair' : 'default' }}>
          <canvas ref={canvasRef} className="block rounded" />
          
          {/* Overlay for interactions */}
          <div
            ref={overlayRef}
            className="absolute inset-0"
            onClick={handleOverlayClick}
            style={{ width: pdfDimensions.width, height: pdfDimensions.height }}
          >
            {currentElements.map((el) => (
              <div key={el.id}>
                {el.type === 'whiteout' && (
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => e.stopPropagation() }, el.id);
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); setTool('select'); }}
                    className={`absolute bg-white ${selectedId === el.id ? 'ring-2 ring-indigo-500' : ''}`}
                    style={{ left: el.x, top: el.y, width: el.width || 150, height: el.height || 24, cursor: 'move' }}
                  >
                    {selectedId === el.id && (
                      <div
                        onMouseDown={(e) => handleResizeMouseDown(e, el.id)}
                        onTouchStart={(e) => handleResizeMouseDown(e.touches[0], el.id)}
                        className="absolute bottom-0 right-0 w-3 h-3 bg-indigo-500 cursor-se-resize rounded-tl"
                      />
                    )}
                  </div>
                )}
                {el.type === 'text' && (
                  <div
                    onMouseDown={(e) => handleMouseDown(e, el.id)}
                    onTouchStart={(e) => {
                      const touch = e.touches[0];
                      handleMouseDown({ ...e, clientX: touch.clientX, clientY: touch.clientY, stopPropagation: () => e.stopPropagation() }, el.id);
                    }}
                    onClick={(e) => { e.stopPropagation(); setSelectedId(el.id); setTool('select'); }}
                    className={`absolute ${selectedId === el.id ? 'ring-2 ring-indigo-500 bg-white/5' : ''}`}
                    style={{ left: el.x, top: el.y, cursor: 'move' }}
                  >
                    <input
                      type="text"
                      value={el.text}
                      onChange={(e) => updateElementText(el.id, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-transparent border-none outline-none min-w-[60px]"
                      style={{
                        fontSize: el.fontSize + 'px',
                        color: el.fontColor,
                        fontFamily: el.fontFamily === 'TimesRoman' ? 'Times New Roman' : el.fontFamily,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hint */}
      <p className="text-center text-xs text-slate-500">
        {tool === 'text' && '👆 Click anywhere on the PDF to add text'}
        {tool === 'whiteout' && '👆 Click on text you want to cover with a white box'}
        {tool === 'select' && '👆 Click an element to select, drag to move'}
      </p>
    </motion.div>
  );
}

function ToolBtn({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
        active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
      }`}
    >
      {icon} {label}
    </button>
  );
}
