import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Type,
  Copy,
  Trash2,
  Check,
  Sparkles,
  Clipboard,
  ArrowRightLeft,
  RotateCcw,
  Sliders,
  AlignLeft,
  Hash,
  Share2
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

const SAMPLE_TEXT = "privamedia studio provides zero-upload client-side tools for developers and creators. transform any string into code identifiers, url slugs, or polished typography instantly!";

export default function CaseConverter() {
  const [text, setText] = useState('');
  const [history, setHistory] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  const [mainCopied, setMainCopied] = useState(false);

  // Push to undo history when modifying
  const updateTextWithHistory = (newText) => {
    if (newText !== text) {
      setHistory((prev) => [...prev.slice(-15), text]);
      setText(newText);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setText(previous);
  };

  // Conversion algorithms
  const toWords = (str) => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1 $2') // split camelCase
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const conversions = useMemo(() => {
    const raw = text;
    if (!raw) {
      return {
        uppercase: '',
        lowercase: '',
        titlecase: '',
        sentencecase: '',
        camelcase: '',
        pascalcase: '',
        snakecase: '',
        kebabcase: '',
        constantcase: '',
        dotcase: '',
        togglecase: '',
        altcase: '',
      };
    }

    const words = toWords(raw);

    // 1. UPPERCASE
    const uppercase = raw.toUpperCase();

    // 2. lowercase
    const lowercase = raw.toLowerCase();

    // 3. Title Case
    const titlecase = raw
      .toLowerCase()
      .replace(/(^|[^\w'])([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    // 4. Sentence case
    const sentencecase = raw
      .toLowerCase()
      .replace(/(^\s*|[.!?]\s+)([a-z])/g, (m, p1, p2) => p1 + p2.toUpperCase());

    // 5. camelCase
    const camelcase = words
      .map((w, i) =>
        i === 0
          ? w.toLowerCase()
          : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
      )
      .join('');

    // 6. PascalCase
    const pascalcase = words
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('');

    // 7. snake_case
    const snakecase = words.map((w) => w.toLowerCase()).join('_');

    // 8. kebab-case
    const kebabcase = words.map((w) => w.toLowerCase()).join('-');

    // 9. CONSTANT_CASE
    const constantcase = words.map((w) => w.toUpperCase()).join('_');

    // 10. dot.case
    const dotcase = words.map((w) => w.toLowerCase()).join('.');

    // 11. Toggle cAsE
    const togglecase = raw
      .split('')
      .map((char) =>
        char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
      )
      .join('');

    // 12. Alternating cAsE
    let isUpper = false;
    const altcase = raw
      .split('')
      .map((char) => {
        if (/[a-zA-Z]/.test(char)) {
          isUpper = !isUpper;
          return isUpper ? char.toUpperCase() : char.toLowerCase();
        }
        return char;
      })
      .join('');

    return {
      uppercase,
      lowercase,
      titlecase,
      sentencecase,
      camelcase,
      pascalcase,
      snakecase,
      kebabcase,
      constantcase,
      dotcase,
      togglecase,
      altcase,
    };
  }, [text]);

  const caseActions = [
    {
      id: 'uppercase',
      label: 'UPPERCASE',
      desc: 'ALL CAPITAL LETTERS',
      badge: 'PROD',
      val: conversions.uppercase,
      action: () => updateTextWithHistory(conversions.uppercase),
    },
    {
      id: 'lowercase',
      label: 'lowercase',
      desc: 'all small letters',
      badge: 'CLEAN',
      val: conversions.lowercase,
      action: () => updateTextWithHistory(conversions.lowercase),
    },
    {
      id: 'titlecase',
      label: 'Title Case',
      desc: 'Capitalizes Every Major Word',
      badge: 'HEADLINE',
      val: conversions.titlecase,
      action: () => updateTextWithHistory(conversions.titlecase),
    },
    {
      id: 'sentencecase',
      label: 'Sentence case',
      desc: 'Capitalizes first word of each sentence',
      badge: 'PROSE',
      val: conversions.sentencecase,
      action: () => updateTextWithHistory(conversions.sentencecase),
    },
    {
      id: 'camelcase',
      label: 'camelCase',
      desc: 'identifierForJavascriptVariables',
      badge: 'CODE',
      val: conversions.camelcase,
      action: () => updateTextWithHistory(conversions.camelcase),
    },
    {
      id: 'pascalcase',
      label: 'PascalCase',
      desc: 'IdentifierForReactComponents',
      badge: 'CODE',
      val: conversions.pascalcase,
      action: () => updateTextWithHistory(conversions.pascalcase),
    },
    {
      id: 'snakecase',
      label: 'snake_case',
      desc: 'python_and_database_identifiers',
      badge: 'DB/PY',
      val: conversions.snakecase,
      action: () => updateTextWithHistory(conversions.snakecase),
    },
    {
      id: 'kebabcase',
      label: 'kebab-case',
      desc: 'url-slug-and-css-class-names',
      badge: 'URL/CSS',
      val: conversions.kebabcase,
      action: () => updateTextWithHistory(conversions.kebabcase),
    },
    {
      id: 'constantcase',
      label: 'CONSTANT_CASE',
      desc: 'GLOBAL_ENVIRONMENT_VARIABLES',
      badge: 'ENV',
      val: conversions.constantcase,
      action: () => updateTextWithHistory(conversions.constantcase),
    },
    {
      id: 'dotcase',
      label: 'dot.case',
      desc: 'package.domain.subproperty.notation',
      badge: 'CONFIG',
      val: conversions.dotcase,
      action: () => updateTextWithHistory(conversions.dotcase),
    },
    {
      id: 'togglecase',
      label: 'Toggle cAsE',
      desc: 'iNVERTS THE CASE OF EVERY LETTER',
      badge: 'INVERT',
      val: conversions.togglecase,
      action: () => updateTextWithHistory(conversions.togglecase),
    },
    {
      id: 'altcase',
      label: 'aLtErNaTiNg',
      desc: 'mOcKiNg SpOnGeBoB cAsE',
      badge: 'MEME',
      val: conversions.altcase,
      action: () => updateTextWithHistory(conversions.altcase),
    },
  ];

  const handleCopyValue = async (val, id) => {
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleCopyMain = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setMainCopied(true);
      setTimeout(() => setMainCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      updateTextWithHistory(clipboardData);
    } catch (err) {
      console.error('Failed to paste', err);
    }
  };

  const handleCleanSpaces = () => {
    const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n\n').trim();
    updateTextWithHistory(cleaned);
  };

  // Metrics
  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lineCount = text ? text.split(/\r\n|\r|\n/).length : 0;

  return (
    <div className="space-y-8">
      {/* 3D Header Section */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Type className="w-4 h-4" />
              String Transformation Engine
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Text Case Converter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Switch effortlessly between programming identifiers, URL slugs, headlines, and typographic casing conventions in real time.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => updateTextWithHistory(SAMPLE_TEXT)}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Sample Text
            </button>
            <button
              onClick={handleCleanSpaces}
              disabled={!text}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                text
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Clean Spaces
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Main Textarea Area */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
              <Hash className="w-3.5 h-3.5 text-purple-400" />
              <strong className="text-white">{charCount.toLocaleString()}</strong> Characters
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
              <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
              <strong className="text-white">{wordCount.toLocaleString()}</strong> Words
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
              <Type className="w-3.5 h-3.5 text-cyan-400" />
              <strong className="text-white">{lineCount.toLocaleString()}</strong> Lines
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={handleUndo}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
                title="Undo last change"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Undo
              </button>
            )}
            <button
              onClick={handlePaste}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
              Paste
            </button>
            <button
              onClick={handleCopyMain}
              disabled={!text}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                mainCopied
                  ? 'bg-emerald-500 text-white'
                  : text
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              {mainCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {mainCopied ? 'Copied!' : 'Copy Current Text'}
            </button>
            <button
              onClick={() => updateTextWithHistory('')}
              disabled={!text}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                text
                  ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border-rose-500/20'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>

        {/* Textarea */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here to convert across all formats..."
          className="w-full h-44 px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-y leading-relaxed font-sans"
        />

        {/* Quick Transform Button Toolbar */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Click to Apply Case to Text
          </div>
          <div className="flex flex-wrap gap-2">
            {caseActions.map((c) => (
              <button
                key={c.id}
                onClick={c.action}
                disabled={!text}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  text
                    ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-white/10 hover:border-purple-500/40'
                    : 'bg-slate-800/30 text-slate-600 border border-white/5 cursor-not-allowed'
                }`}
              >
                <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Preview Cards Grid: Real-time converted values for all 12 formats with 1-click copy */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-['Space_Grotesk'] text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Live Converted Formats
          </h3>
          <span className="text-xs text-slate-400">Click any card's copy button for instant clipboard access</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {caseActions.map((item, idx) => {
            const hasValue = Boolean(item.val);
            const isItemCopied = copiedId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{item.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {item.badge}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopyValue(item.val, item.id)}
                    disabled={!hasValue}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                      isItemCopied
                        ? 'bg-emerald-500 text-white border-emerald-400'
                        : hasValue
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10'
                        : 'bg-slate-800/30 text-slate-600 border-white/5 cursor-not-allowed'
                    }`}
                    title="Copy this converted case"
                  >
                    {isItemCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3 text-cyan-400" />}
                    {isItemCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Output Preview Area */}
                <div
                  onClick={() => hasValue && updateTextWithHistory(item.val)}
                  className={`p-3 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono break-all line-clamp-3 min-h-[4rem] flex items-center cursor-pointer transition-colors ${
                    hasValue ? 'text-slate-200 hover:border-purple-500/50' : 'text-slate-600 italic'
                  }`}
                  title="Click to apply this format into the editor"
                >
                  {item.val || `Preview will appear here in ${item.label}...`}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
