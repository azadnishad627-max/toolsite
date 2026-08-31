import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  Pipette,
  Layers,
  Code,
  RefreshCw,
  History,
  Info,
  CheckCircle2,
  Sliders,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';

// Color Conversion Math Helpers
function hexToRgb(hex) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('');
  }
  if (c.length !== 6) return null;
  const num = parseInt(c, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r, g, b) {
  const clamp = (val) => Math.max(0, Math.min(255, Math.round(Number(val) || 0)));
  const toHex = (c) => clamp(c).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsl(r, g, b) {
  r = Math.max(0, Math.min(255, r)) / 255;
  g = Math.max(0, Math.min(255, g)) / 255;
  b = Math.max(0, Math.min(255, b)) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToRgb(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r1 = 0, g1 = 0, b1 = 0;

  if (h >= 0 && h < 60) {
    r1 = c; g1 = x; b1 = 0;
  } else if (h >= 60 && h < 120) {
    r1 = x; g1 = c; b1 = 0;
  } else if (h >= 120 && h < 180) {
    r1 = 0; g1 = c; b1 = x;
  } else if (h >= 180 && h < 240) {
    r1 = 0; g1 = x; b1 = c;
  } else if (h >= 240 && h < 300) {
    r1 = x; g1 = 0; b1 = c;
  } else {
    r1 = c; g1 = 0; b1 = x;
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

function getLuminance(r, g, b) {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export default function ColorPickerTool() {
  const [hex, setHex] = useState('#6366F1');
  const [rgb, setRgb] = useState({ r: 99, g: 102, b: 241 });
  const [hsl, setHsl] = useState({ h: 239, s: 84, l: 67 });
  const [copiedKey, setCopiedKey] = useState(null);
  const [recentColors, setRecentColors] = useState([
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#10B981',
    '#F59E0B'
  ]);

  // Push to recent history on stable color change
  const addToRecent = useCallback((newHex) => {
    setRecentColors((prev) => {
      const filtered = prev.filter((c) => c.toUpperCase() !== newHex.toUpperCase());
      return [newHex.toUpperCase(), ...filtered].slice(0, 12);
    });
  }, []);

  // Update all color representations from HEX
  const applyHex = (newHex, addToHistory = true) => {
    let clean = newHex.trim();
    if (!clean.startsWith('#')) clean = '#' + clean;
    const parsedRgb = hexToRgb(clean);
    if (parsedRgb) {
      const normalizedHex = rgbToHex(parsedRgb.r, parsedRgb.g, parsedRgb.b);
      setHex(normalizedHex);
      setRgb(parsedRgb);
      setHsl(rgbToHsl(parsedRgb.r, parsedRgb.g, parsedRgb.b));
      if (addToHistory) addToRecent(normalizedHex);
    } else {
      setHex(newHex);
    }
  };

  // Update from RGB inputs
  const applyRgb = (r, g, b) => {
    const clampedR = Math.max(0, Math.min(255, parseInt(r, 10) || 0));
    const clampedG = Math.max(0, Math.min(255, parseInt(g, 10) || 0));
    const clampedB = Math.max(0, Math.min(255, parseInt(b, 10) || 0));
    const newRgb = { r: clampedR, g: clampedG, b: clampedB };
    const newHex = rgbToHex(clampedR, clampedG, clampedB);
    setRgb(newRgb);
    setHex(newHex);
    setHsl(rgbToHsl(clampedR, clampedG, clampedB));
    addToRecent(newHex);
  };

  // Update from HSL inputs
  const applyHsl = (h, s, l) => {
    const clampedH = ((parseInt(h, 10) || 0) % 360 + 360) % 360;
    const clampedS = Math.max(0, Math.min(100, parseInt(s, 10) || 0));
    const clampedL = Math.max(0, Math.min(100, parseInt(l, 10) || 0));
    const newHsl = { h: clampedH, s: clampedS, l: clampedL };
    const calculatedRgb = hslToRgb(clampedH, clampedS, clampedL);
    const newHex = rgbToHex(calculatedRgb.r, calculatedRgb.g, calculatedRgb.b);
    setHsl(newHsl);
    setRgb(calculatedRgb);
    setHex(newHex);
    addToRecent(newHex);
  };

  // Random Color Generator
  const generateRandomColor = () => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    applyRgb(r, g, b);
  };

  // EyeDropper API (Chromium feature)
  const handleEyeDropper = async () => {
    if (window.EyeDropper) {
      try {
        const eyeDropper = new window.EyeDropper();
        const result = await eyeDropper.open();
        if (result && result.sRGBHex) {
          applyHex(result.sRGBHex);
        }
      } catch (e) {
        // User cancelled or unsupported
      }
    }
  };

  // Copy helper
  const copyValue = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Contrast & Luminance Calculations
  const contrastStats = useMemo(() => {
    const lum = getLuminance(rgb.r, rgb.g, rgb.b);
    const whiteLum = 1.0;
    const blackLum = 0.0;

    const ratioWhite = (whiteLum + 0.05) / (lum + 0.05);
    const ratioBlack = (lum + 0.05) / (blackLum + 0.05);

    const bestTextColor = lum > 0.4 ? '#000000' : '#FFFFFF';
    return {
      luminance: (lum * 100).toFixed(1),
      ratioWhite: ratioWhite.toFixed(2),
      ratioBlack: ratioBlack.toFixed(2),
      bestTextColor,
      isDark: lum <= 0.4
    };
  }, [rgb]);

  // Color Harmonies
  const harmonies = useMemo(() => {
    const { h, s, l } = hsl;
    const makeHex = (deg, sat = s, light = l) => {
      const rgbVal = hslToRgb((deg % 360 + 360) % 360, sat, light);
      return rgbToHex(rgbVal.r, rgbVal.g, rgbVal.b);
    };

    return {
      complementary: [hex, makeHex(h + 180)],
      analogous: [makeHex(h - 30), hex, makeHex(h + 30)],
      triadic: [hex, makeHex(h + 120), makeHex(h + 240)],
      tetradic: [hex, makeHex(h + 90), makeHex(h + 180), makeHex(h + 270)],
      shades: [
        makeHex(h, s, 20),
        makeHex(h, s, 35),
        hex,
        makeHex(h, s, 65),
        makeHex(h, s, 80)
      ]
    };
  }, [hex, hsl]);

  // Code Snippets
  const codeSnippets = useMemo(() => {
    const rgbString = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    const hslString = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    return [
      { id: 'hex', label: 'HEX Code', code: hex },
      { id: 'rgb', label: 'RGB Function', code: rgbString },
      { id: 'hsl', label: 'HSL Function', code: hslString },
      { id: 'css-color', label: 'CSS Property', code: `color: ${hex};` },
      { id: 'css-bg', label: 'CSS Background', code: `background-color: ${hex};` },
      { id: 'tailwind', label: 'Tailwind Class', code: `bg-[${hex}]` }
    ];
  }, [hex, rgb, hsl]);

  return (
    <div className="space-y-8">
      {/* 3D TiltCard Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Palette className="w-4 h-4" />
              Harmonic Color Intelligence
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Color Picker & Converter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Convert, synchronize, and generate harmonic color schemes across HEX, RGB, and HSL spaces with WCAG contrast metrics and one-click CSS export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {typeof window !== 'undefined' && 'EyeDropper' in window && (
              <button
                onClick={handleEyeDropper}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Pipette className="w-3.5 h-3.5" /> Eyedropper
              </button>
            )}

            <button
              onClick={generateRandomColor}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Random Color
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Main Color Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Color Preview Swatch & Contrast Metrics */}
        <div className="lg:col-span-5 space-y-6">
          {/* Giant Color Swatch Card */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Color Preview
              </span>

              {/* Native Color Picker Overlay Button */}
              <label className="relative cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-xs text-slate-200 transition-all">
                <Pipette className="w-3 h-3 text-indigo-400" /> Pick Native
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => applyHex(e.target.value)}
                  className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                />
              </label>
            </div>

            {/* Visual Swatch */}
            <motion.div
              animate={{ backgroundColor: hex }}
              transition={{ duration: 0.15 }}
              className="w-full h-48 rounded-2xl shadow-2xl border border-white/20 relative flex flex-col items-center justify-center overflow-hidden group cursor-pointer"
              onClick={() => copyValue('swatch', hex)}
            >
              <div
                className="px-4 py-2 rounded-xl backdrop-blur-md bg-black/30 text-white font-mono text-base font-bold shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform"
                style={{ color: contrastStats.bestTextColor }}
              >
                {hex}
                {copiedKey === 'swatch' ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Copy className="w-4 h-4 opacity-70" />
                )}
              </div>
              <span className="text-[11px] font-medium mt-2 opacity-80" style={{ color: contrastStats.bestTextColor }}>
                {copiedKey === 'swatch' ? 'Copied to Clipboard!' : 'Click swatch to copy HEX'}
              </span>
            </motion.div>

            {/* Accessibility & Contrast Info */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">vs White (#FFF)</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      Number(contrastStats.ratioWhite) >= 4.5
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {Number(contrastStats.ratioWhite) >= 4.5 ? 'AA Pass' : 'Fail'}
                  </span>
                </div>
                <span className="text-lg font-bold text-white font-mono">{contrastStats.ratioWhite}:1</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">vs Black (#000)</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      Number(contrastStats.ratioBlack) >= 4.5
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {Number(contrastStats.ratioBlack) >= 4.5 ? 'AA Pass' : 'Fail'}
                  </span>
                </div>
                <span className="text-lg font-bold text-white font-mono">{contrastStats.ratioBlack}:1</span>
              </div>
            </div>
          </div>

          {/* Recent Colors History */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" /> Recent Colors
              </span>
              <button
                onClick={() => setRecentColors([hex])}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Clear History
              </button>
            </div>

            <div className="flex flex-wrap gap-2.5">
              {recentColors.map((c, idx) => (
                <button
                  key={idx}
                  onClick={() => applyHex(c, false)}
                  className={`w-9 h-9 rounded-xl border transition-all hover:scale-110 shadow-sm relative ${
                    hex.toUpperCase() === c.toUpperCase() ? 'border-white ring-2 ring-indigo-500' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sync Inputs, Sliders, and Harmonies */}
        <div className="lg:col-span-7 space-y-6">
          {/* Color Values & Sliders Form */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Color Channels & Adjustments
            </h3>

            {/* HEX Input Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-400" /> HEX Value
                </label>
                <button
                  onClick={() => copyValue('hex-val', hex)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'hex-val' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'hex-val' ? 'Copied' : 'Copy'}
                </button>
              </div>
              <input
                type="text"
                value={hex}
                onChange={(e) => applyHex(e.target.value)}
                maxLength={7}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white font-mono text-sm uppercase focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* RGB Inputs & Sliders */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  RGB Channels (Red, Green, Blue)
                </label>
                <button
                  onClick={() => copyValue('rgb-val', `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'rgb-val' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'rgb-val' ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* R Slider & Input */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-rose-400">R</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => applyRgb(e.target.value, rgb.g, rgb.b)}
                  className="col-span-7 accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.r}
                  onChange={(e) => applyRgb(e.target.value, rgb.g, rgb.b)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* G Slider & Input */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-emerald-400">G</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => applyRgb(rgb.r, e.target.value, rgb.b)}
                  className="col-span-7 accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.g}
                  onChange={(e) => applyRgb(rgb.r, e.target.value, rgb.b)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* B Slider & Input */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-sky-400">B</span>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => applyRgb(rgb.r, rgb.g, e.target.value)}
                  className="col-span-7 accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={rgb.b}
                  onChange={(e) => applyRgb(rgb.r, rgb.g, e.target.value)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* HSL Inputs & Sliders */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  HSL Channels (Hue, Saturation, Lightness)
                </label>
                <button
                  onClick={() => copyValue('hsl-val', `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  {copiedKey === 'hsl-val' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copiedKey === 'hsl-val' ? 'Copied' : 'Copy'}
                </button>
              </div>

              {/* Hue */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-amber-400">H (°)</span>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => applyHsl(e.target.value, hsl.s, hsl.l)}
                  className="col-span-7 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={hsl.h}
                  onChange={(e) => applyHsl(e.target.value, hsl.s, hsl.l)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Saturation */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-purple-400">S (%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => applyHsl(hsl.h, e.target.value, hsl.l)}
                  className="col-span-7 accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hsl.s}
                  onChange={(e) => applyHsl(hsl.h, e.target.value, hsl.l)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Lightness */}
              <div className="grid grid-cols-12 gap-3 items-center">
                <span className="col-span-2 text-xs font-bold text-cyan-400">L (%)</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => applyHsl(hsl.h, hsl.s, e.target.value)}
                  className="col-span-7 accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={hsl.l}
                  onChange={(e) => applyHsl(hsl.h, hsl.s, e.target.value)}
                  className="col-span-3 px-2 py-1 text-center rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Harmonic Palettes */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-5">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" /> Harmonic Color Palettes
            </h3>

            {/* Complementary */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Complementary (180°)</span>
              <div className="grid grid-cols-2 gap-2">
                {harmonies.complementary.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => applyHex(c)}
                    className="h-10 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: c, color: hexToRgb(c)?.r * 0.299 + hexToRgb(c)?.g * 0.587 + hexToRgb(c)?.b * 0.114 > 150 ? '#000' : '#FFF' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Analogous */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Analogous (±30°)</span>
              <div className="grid grid-cols-3 gap-2">
                {harmonies.analogous.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => applyHex(c)}
                    className="h-10 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: c, color: hexToRgb(c)?.r * 0.299 + hexToRgb(c)?.g * 0.587 + hexToRgb(c)?.b * 0.114 > 150 ? '#000' : '#FFF' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Triadic */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Triadic (120° / 240°)</span>
              <div className="grid grid-cols-3 gap-2">
                {harmonies.triadic.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => applyHex(c)}
                    className="h-10 rounded-xl border border-white/10 flex items-center justify-center font-mono text-xs font-bold transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: c, color: hexToRgb(c)?.r * 0.299 + hexToRgb(c)?.g * 0.587 + hexToRgb(c)?.b * 0.114 > 150 ? '#000' : '#FFF' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Monochromatic Tints & Shades */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Monochromatic Shades</span>
              <div className="grid grid-cols-5 gap-2">
                {harmonies.shades.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => applyHex(c)}
                    className="h-9 rounded-xl border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold transition-all hover:scale-105"
                    style={{ backgroundColor: c, color: hexToRgb(c)?.r * 0.299 + hexToRgb(c)?.g * 0.587 + hexToRgb(c)?.b * 0.114 > 150 ? '#000' : '#FFF' }}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Code Export Cards */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-indigo-400" /> CSS & Design Token Snippets
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {codeSnippets.map((snippet) => (
            <div
              key={snippet.id}
              onClick={() => copyValue(snippet.id, snippet.code)}
              className="p-3.5 rounded-xl bg-slate-950 border border-white/10 hover:border-indigo-500/50 cursor-pointer transition-all flex items-center justify-between group"
            >
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">{snippet.label}</span>
                <code className="text-xs font-mono text-cyan-300 mt-0.5 block">{snippet.code}</code>
              </div>
              <button className="p-1.5 text-slate-500 group-hover:text-white transition-colors">
                {copiedKey === snippet.id ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
