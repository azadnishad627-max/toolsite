import React, { useState, useMemo } from 'react';
import {
  Braces,
  Copy,
  Check,
  Trash2,
  Minimize2,
  Maximize2,
  Sparkles,
  Download,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Code2,
  FileJson,
  Search,
  Clipboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';
import { formatBytes } from '../../utils/formatters';

// Sample JSON templates for quick testing
const SAMPLES = {
  user: {
    id: "usr_9481a7b",
    name: "Alex Rivera",
    email: "alex.rivera@privamedia.io",
    verified: true,
    roles: ["admin", "editor", "developer"],
    profile: {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      bio: "Full-stack engineer passionate about client-side privacy tools.",
      stats: {
        projectsCreated: 42,
        storageUsedMb: 128.5,
        reputation: 980
      }
    },
    settings: {
      theme: "dark",
      notifications: {
        email: true,
        push: false,
        sms: null
      },
      twoFactorEnabled: true
    }
  },
  apiResponse: {
    status: 200,
    message: "Data retrieved successfully",
    timestamp: "2026-08-31T07:41:24Z",
    pagination: {
      page: 1,
      limit: 10,
      totalRecords: 142,
      totalPages: 15
    },
    data: [
      { id: 101, title: "Image Compressor", category: "image", active: true, rating: 4.9 },
      { id: 102, title: "Base64 Suite", category: "dev", active: true, rating: 4.8 },
      { id: 103, title: "Color Intelligence", category: "tools", active: true, rating: 5.0 }
    ]
  }
};

/**
 * Calculates recursion depth and total key count of an object
 */
function analyzeJson(obj) {
  let keysCount = 0;
  let maxDepth = 0;

  function traverse(current, depth) {
    if (depth > maxDepth) maxDepth = depth;

    if (Array.isArray(current)) {
      current.forEach((item) => {
        if (typeof item === 'object' && item !== null) {
          traverse(item, depth + 1);
        }
      });
    } else if (typeof current === 'object' && current !== null) {
      const keys = Object.keys(current);
      keysCount += keys.length;
      keys.forEach((key) => {
        const val = current[key];
        if (typeof val === 'object' && val !== null) {
          traverse(val, depth + 1);
        }
      });
    }
  }

  if (typeof obj === 'object' && obj !== null) {
    traverse(obj, 1);
  }

  return { keysCount, maxDepth };
}

/**
 * Tokenizes JSON string into syntax highlighted React spans
 */
function SyntaxHighlightedJson({ jsonString }) {
  const lines = useMemo(() => {
    if (!jsonString) return [];
    return jsonString.split('\n');
  }, [jsonString]);

  const highlightLine = (line) => {
    // Regex matching tokens: string keys, string values, numbers, booleans, null, punctuation
    const tokenRegex = /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?|[{}[\],:])/g;

    const elements = [];
    let lastIndex = 0;
    let match;

    while ((match = tokenRegex.exec(line)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        elements.push(line.slice(lastIndex, matchIndex));
      }

      const token = match[0];
      let className = 'text-slate-300';

      if (/^"/.test(token)) {
        if (/:$/.test(token)) {
          // Object key
          className = 'text-sky-400 font-semibold';
        } else {
          // String value
          className = 'text-emerald-400';
        }
      } else if (/true|false/.test(token)) {
        className = 'text-purple-400 font-semibold';
      } else if (/null/.test(token)) {
        className = 'text-rose-400 italic';
      } else if (/^-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?$/.test(token)) {
        className = 'text-amber-400';
      } else if (/[{}[\],]/.test(token)) {
        className = 'text-slate-500';
      }

      elements.push(
        <span key={matchIndex} className={className}>
          {token}
        </span>
      );

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(line.slice(lastIndex));
    }

    return elements;
  };

  return (
    <pre className="font-mono text-xs leading-5 select-text overflow-x-auto whitespace-pre">
      {lines.map((line, idx) => (
        <div key={idx} className="table-row hover:bg-white/[0.02]">
          <span className="table-cell select-none pr-4 text-right text-slate-600 font-mono text-[11px] w-8">
            {idx + 1}
          </span>
          <span className="table-cell">{highlightLine(line)}</span>
        </div>
      ))}
    </pre>
  );
}

/**
 * Interactive Collapsible JSON Tree Node
 */
function JsonTreeNode({ keyName, value, depth = 0, defaultOpen = true, searchTerm = '' }) {
  const [isOpen, setIsOpen] = useState(depth < 2 || defaultOpen);
  const isObject = value !== null && typeof value === 'object';
  const isArray = Array.isArray(value);

  const keys = isObject ? Object.keys(value) : [];
  const itemCount = isArray ? value.length : keys.length;

  const matchesSearch = useMemo(() => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    if (keyName && String(keyName).toLowerCase().includes(term)) return true;
    if (!isObject && String(value).toLowerCase().includes(term)) return true;
    return false;
  }, [keyName, value, isObject, searchTerm]);

  // Render Primitive Values
  const renderPrimitive = (val) => {
    if (val === null) return <span className="text-rose-400 italic font-mono">null</span>;
    if (typeof val === 'boolean') return <span className="text-purple-400 font-bold font-mono">{String(val)}</span>;
    if (typeof val === 'number') return <span className="text-amber-400 font-mono">{val}</span>;
    if (typeof val === 'string') return <span className="text-emerald-400 font-mono">"{val}"</span>;
    return <span className="text-slate-400 font-mono">{String(val)}</span>;
  };

  return (
    <div className={`text-xs font-mono my-0.5 ${!matchesSearch && searchTerm ? 'opacity-30' : 'opacity-100'}`}>
      <div className="flex items-center gap-1.5 py-0.5 px-1.5 rounded-lg hover:bg-white/[0.04] transition-colors group">
        {isObject ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-0.5 text-slate-500 hover:text-indigo-400 rounded focus:outline-none transition-colors"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <span className="w-3.5 inline-block" />
        )}

        {keyName !== undefined && (
          <span className="text-sky-400 font-semibold group-hover:text-sky-300">
            "{keyName}":
          </span>
        )}

        {isObject ? (
          <span
            onClick={() => setIsOpen(!isOpen)}
            className="cursor-pointer text-slate-400 text-[11px] flex items-center gap-1"
          >
            <span className="text-slate-300 font-bold">{isArray ? '[' : '{'}</span>
            {!isOpen && (
              <span className="px-1.5 py-0.2 bg-slate-800 text-slate-400 rounded text-[10px] border border-white/5">
                {itemCount} {isArray ? (itemCount === 1 ? 'item' : 'items') : (itemCount === 1 ? 'key' : 'keys')}
              </span>
            )}
            {!isOpen && <span className="text-slate-300 font-bold">{isArray ? ']' : '}'}</span>}
          </span>
        ) : (
          renderPrimitive(value)
        )}
      </div>

      {isObject && isOpen && (
        <div className="pl-4 border-l border-white/10 ml-2 space-y-0.5">
          {isArray
            ? value.map((item, idx) => (
                <JsonTreeNode
                  key={idx}
                  keyName={idx}
                  value={item}
                  depth={depth + 1}
                  defaultOpen={depth < 2}
                  searchTerm={searchTerm}
                />
              ))
            : keys.map((k) => (
                <JsonTreeNode
                  key={k}
                  keyName={k}
                  value={value[k]}
                  depth={depth + 1}
                  defaultOpen={depth < 2}
                  searchTerm={searchTerm}
                />
              ))}
          <div className="text-slate-500 pl-2">{isArray ? ']' : '}'}</div>
        </div>
      )}
    </div>
  );
}

export default function JsonFormatter() {
  const [inputJson, setInputJson] = useState(JSON.stringify(SAMPLES.user, null, 2));
  const [indentSpaces, setIndentSpaces] = useState(2);
  const [viewMode, setViewMode] = useState('code'); // 'code' | 'tree'
  const [treeSearch, setTreeSearch] = useState('');
  const [copied, setCopied] = useState(false);

  // Parsing & Validation
  const validation = useMemo(() => {
    if (!inputJson.trim()) {
      return { isValid: false, parsed: null, error: null, formatted: '', line: null, col: null };
    }

    try {
      const parsed = JSON.parse(inputJson);
      const formatted = JSON.stringify(parsed, null, indentSpaces);
      const stats = analyzeJson(parsed);
      const sizeBytes = new Blob([inputJson]).size;
      const formattedSizeBytes = new Blob([formatted]).size;
      const lineCount = formatted.split('\n').length;

      return {
        isValid: true,
        parsed,
        error: null,
        formatted,
        stats: {
          ...stats,
          sizeBytes,
          formattedSizeBytes,
          lineCount,
          type: Array.isArray(parsed) ? 'Array' : typeof parsed === 'object' && parsed !== null ? 'Object' : typeof parsed
        }
      };
    } catch (err) {
      let line = null;
      let col = null;
      // Extract line & col from error message if available
      const lineMatch = err.message.match(/line (\d+) column (\d+)/i) || err.message.match(/position (\d+)/i);

      if (lineMatch) {
        if (lineMatch[2]) {
          line = parseInt(lineMatch[1], 10);
          col = parseInt(lineMatch[2], 10);
        } else if (lineMatch[1]) {
          const pos = parseInt(lineMatch[1], 10);
          const linesUpToPos = inputJson.slice(0, pos).split('\n');
          line = linesUpToPos.length;
          col = linesUpToPos[linesUpToPos.length - 1].length + 1;
        }
      }

      return {
        isValid: false,
        parsed: null,
        error: err.message,
        line,
        col,
        formatted: ''
      };
    }
  }, [inputJson, indentSpaces]);

  // Actions
  const handleFormat = () => {
    if (validation.isValid) {
      setInputJson(JSON.stringify(validation.parsed, null, indentSpaces));
    }
  };

  const handleMinify = () => {
    if (validation.isValid) {
      setInputJson(JSON.stringify(validation.parsed));
    }
  };

  const handleCopy = () => {
    const textToCopy = validation.isValid ? validation.formatted : inputJson;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setInputJson(text);
    } catch (err) {
      console.error('Clipboard paste failed:', err);
    }
  };

  const handleDownload = () => {
    if (!validation.isValid) return;
    const blob = new Blob([validation.formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSample = (sampleKey) => {
    setInputJson(JSON.stringify(SAMPLES[sampleKey], null, 2));
  };

  const handleClear = () => {
    setInputJson('');
  };

  return (
    <div className="space-y-8">
      {/* 3D TiltCard Header */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <Braces className="w-4 h-4" />
              Client-Side Developer Intelligence
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              JSON Formatter & Validator
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Beautify, minify, validate, and inspect complex JSON data with syntax highlighting, collapsible trees, and instant error locator.
            </p>
          </div>

          {/* Quick Actions Header Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadSample('user')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Load Sample
            </button>
            <button
              onClick={handlePaste}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Clipboard className="w-3.5 h-3.5 text-cyan-400" /> Paste
            </button>
            {validation.isValid && (
              <button
                onClick={handleDownload}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download JSON
              </button>
            )}
          </div>
        </div>
      </TiltCard>

      {/* Main Workbench */}
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleFormat}
              disabled={!validation.isValid}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shadow-sm"
            >
              <Maximize2 className="w-3.5 h-3.5" /> Format (Beautify)
            </button>

            <button
              onClick={handleMinify}
              disabled={!validation.isValid}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Minify
            </button>

            <div className="h-6 w-px bg-white/10 hidden sm:block" />

            {/* Indent Selector */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              <span className="text-[11px] text-slate-400 px-2">Indent:</span>
              <button
                onClick={() => setIndentSpaces(2)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  indentSpaces === 2 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => setIndentSpaces(4)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  indentSpaces === 4 ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                4 Spaces
              </button>
            </div>
          </div>

          {/* View Mode & Output Utilities */}
          <div className="flex items-center gap-2">
            {/* View Mode Switch */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'code' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" /> Code
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'tree' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" /> Tree View
              </button>
            </div>

            <button
              onClick={handleCopy}
              disabled={!inputJson.trim()}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-white/10 transition-all"
              title="Clear input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status & Stats Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Validity Status */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                !inputJson.trim()
                  ? 'bg-slate-800 text-slate-400'
                  : validation.isValid
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}
            >
              {!inputJson.trim() ? (
                <FileJson className="w-4 h-4" />
              ) : validation.isValid ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Status</span>
              <span
                className={`text-xs font-bold ${
                  !inputJson.trim()
                    ? 'text-slate-400'
                    : validation.isValid
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {!inputJson.trim() ? 'Empty' : validation.isValid ? 'Valid JSON' : 'Invalid'}
              </span>
            </div>
          </div>

          {/* Key Count */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total Keys</span>
            <span className="text-base font-bold text-white font-mono">
              {validation.isValid ? validation.stats.keysCount : '-'}
            </span>
          </div>

          {/* Depth Level */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Max Depth</span>
            <span className="text-base font-bold text-white font-mono">
              {validation.isValid ? `${validation.stats.maxDepth} levels` : '-'}
            </span>
          </div>

          {/* File Size */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Size</span>
            <span className="text-base font-bold text-cyan-400 font-mono">
              {validation.isValid ? formatBytes(validation.stats.formattedSizeBytes) : '-'}
            </span>
          </div>

          {/* Line Count */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Lines</span>
            <span className="text-base font-bold text-white font-mono">
              {validation.isValid ? validation.stats.lineCount : '-'}
            </span>
          </div>

          {/* Root Type */}
          <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-white/10">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Root Type</span>
            <span className="text-xs font-bold text-purple-400 uppercase mt-0.5 block">
              {validation.isValid ? validation.stats.type : '-'}
            </span>
          </div>
        </div>

        {/* Validation Error Banner */}
        <AnimatePresence>
          {!validation.isValid && validation.error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs"
            >
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-rose-200">
                  JSON Syntax Error {validation.line ? `at Line ${validation.line}, Column ${validation.col}` : ''}
                </div>
                <div className="font-mono text-rose-300/90 text-[11px] bg-rose-950/40 p-2 rounded-lg border border-rose-500/20">
                  {validation.error}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor & Viewer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5 text-indigo-400" /> Input JSON
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {inputJson.length} chars
              </span>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-white/10 overflow-hidden focus-within:border-indigo-500 transition-all">
              <textarea
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder='Paste or type raw JSON here... e.g. {"key": "value"}'
                spellCheck="false"
                className="w-full h-[450px] p-4 bg-transparent text-white font-mono text-xs leading-5 resize-none focus:outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {/* Formatted Output / Tree View Panel */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                {viewMode === 'code' ? (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <FolderTree className="w-3.5 h-3.5 text-sky-400" />
                )}
                {viewMode === 'code' ? 'Highlighted Formatted JSON' : 'Interactive JSON Tree'}
              </label>

              {viewMode === 'tree' && validation.isValid && (
                <div className="relative">
                  <input
                    type="text"
                    value={treeSearch}
                    onChange={(e) => setTreeSearch(e.target.value)}
                    placeholder="Filter keys or values..."
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 w-36 sm:w-44"
                  />
                  <Search className="w-3 h-3 text-slate-500 absolute right-2 top-2 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="h-[450px] rounded-2xl bg-slate-950 border border-white/10 p-4 overflow-auto scrollbar-thin">
              {validation.isValid ? (
                viewMode === 'code' ? (
                  <SyntaxHighlightedJson jsonString={validation.formatted} />
                ) : (
                  <div className="py-1">
                    <JsonTreeNode
                      value={validation.parsed}
                      depth={0}
                      defaultOpen={true}
                      searchTerm={treeSearch}
                    />
                  </div>
                )
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                  <Braces className="w-10 h-10 mb-2 opacity-30 text-indigo-400" />
                  <p className="text-xs font-medium text-slate-400">
                    {!inputJson.trim()
                      ? 'Enter JSON in the left panel to view formatted output.'
                      : 'Fix the syntax error to view formatted output and interactive tree.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
