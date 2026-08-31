import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Copy,
  Trash2,
  Check,
  Clock,
  Mic,
  BarChart2,
  Sparkles,
  Clipboard,
  BookOpen,
  Hash,
  AlignLeft,
  PieChart,
  Download
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

const SAMPLE_TEXT = `PrivaMedia Studio is a privacy-first, client-side digital workstation built for modern creators, developers, and power users. Everything you process—from high-resolution images, multi-page PDF documents, and dynamic QR codes to rich text analytics and cryptographic passwords—runs 100% locally within your browser engine.

No data packets ever leave your machine. No telemetry trackers, no cloud uploads, and zero subscription paywalls. Enjoy maximum security and lightning-fast web-assembly performance.`;

// Common English Stop Words to filter out for keyword density
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'can\'t',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s',
  'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you',
  'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export default function WordCounter() {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);
  const [filterStopWords, setFilterStopWords] = useState(true);
  const [showTopCount, setShowTopCount] = useState(5);

  // Core Metrics calculation
  const stats = useMemo(() => {
    const raw = text;
    const charCount = raw.length;
    const charNoSpaces = raw.replace(/\s/g, '').length;
    const trimmed = raw.trim();

    // Words
    const wordsArray = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const wordCount = wordsArray.length;

    // Sentences (split on ., !, ?)
    const sentences = raw.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const sentenceCount = sentences.length;

    // Paragraphs (split on double or single newlines with content)
    const paragraphs = raw.split(/\n+/).filter((p) => p.trim().length > 0);
    const paragraphCount = paragraphs.length;

    // Lines
    const lines = raw ? raw.split(/\r\n|\r|\n/) : [];
    const lineCount = lines.length;

    // Character breakdowns
    const letters = (raw.match(/[a-zA-Z]/g) || []).length;
    const digits = (raw.match(/[0-9]/g) || []).length;
    const spaces = (raw.match(/\s/g) || []).length;
    const specialChars = charCount - (letters + digits + spaces);

    // Reading & Speaking times
    // Avg reading speed: 200 wpm
    const readMinutes = wordCount / 200;
    const readTotalSecs = Math.round(readMinutes * 60);
    const readMin = Math.floor(readTotalSecs / 60);
    const readSec = readTotalSecs % 60;
    const readingTimeStr =
      wordCount === 0
        ? '0 sec'
        : readMin === 0
        ? `${readSec} sec`
        : `${readMin}m ${readSec}s`;

    // Avg speaking speed: 130 wpm
    const speakMinutes = wordCount / 130;
    const speakTotalSecs = Math.round(speakMinutes * 60);
    const speakMin = Math.floor(speakTotalSecs / 60);
    const speakSec = speakTotalSecs % 60;
    const speakingTimeStr =
      wordCount === 0
        ? '0 sec'
        : speakMin === 0
        ? `${speakSec} sec`
        : `${speakMin}m ${speakSec}s`;

    // Average word & sentence length
    const avgWordLength = wordCount > 0 ? (charNoSpaces / wordCount).toFixed(1) : '0';
    const avgSentenceLength = sentenceCount > 0 ? Math.round(wordCount / sentenceCount) : 0;

    // Unique words
    const cleanWords = wordsArray.map((w) =>
      w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, '')
    ).filter(Boolean);

    const uniqueWordsCount = new Set(cleanWords).size;

    // Keyword Frequency
    const freqMap = {};
    cleanWords.forEach((word) => {
      if (filterStopWords && STOP_WORDS.has(word)) return;
      if (word.length <= 1 && !/^[a-z0-9]$/i.test(word)) return;
      freqMap[word] = (freqMap[word] || 0) + 1;
    });

    const sortedKeywords = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, showTopCount)
      .map(([word, count]) => ({
        word,
        count,
        percentage: wordCount > 0 ? ((count / wordCount) * 100).toFixed(1) : 0,
      }));

    return {
      charCount,
      charNoSpaces,
      wordCount,
      sentenceCount,
      paragraphCount,
      lineCount,
      letters,
      digits,
      spaces,
      specialChars,
      readingTimeStr,
      speakingTimeStr,
      avgWordLength,
      avgSentenceLength,
      uniqueWordsCount,
      topKeywords: sortedKeywords,
      totalKeywordsCount: Object.keys(freqMap).length,
    };
  }, [text, filterStopWords, showTopCount]);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handlePaste = async () => {
    try {
      const clipboardData = await navigator.clipboard.readText();
      setText(clipboardData);
    } catch (err) {
      console.error('Failed to paste from clipboard', err);
    }
  };

  const handleClear = () => {
    setText('');
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  const handleExportReport = () => {
    const report = `PRIVAMEDIA STUDIO - TEXT ANALYSIS REPORT
==========================================
Date: ${new Date().toLocaleString()}

SUMMARY METRICS:
- Total Words: ${stats.wordCount}
- Characters (with spaces): ${stats.charCount}
- Characters (without spaces): ${stats.charNoSpaces}
- Sentences: ${stats.sentenceCount}
- Paragraphs: ${stats.paragraphCount}
- Total Lines: ${stats.lineCount}
- Unique Words: ${stats.uniqueWordsCount}
- Avg Word Length: ${stats.avgWordLength} chars
- Avg Sentence Length: ${stats.avgSentenceLength} words

TIME ESTIMATES:
- Estimated Reading Time (200 WPM): ${stats.readingTimeStr}
- Estimated Speaking Time (130 WPM): ${stats.speakingTimeStr}

CHARACTER COMPOSITION:
- Letters: ${stats.letters}
- Digits: ${stats.digits}
- Whitespace: ${stats.spaces}
- Symbols/Punctuation: ${stats.specialChars}

TOP FREQUENT KEYWORDS:
${stats.topKeywords.map((k, i) => `${i + 1}. "${k.word}": ${k.count} times (${k.percentage}%)`).join('\n')}
==========================================
`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Text_Analysis_Report_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* 3D Header Section */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <FileText className="w-4 h-4" />
              Real-Time Typography & Analytics
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Word & Character Counter
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Inspect comprehensive text statistics, character variations, reading and speech pacing metrics, and keyword density completely client-side.
            </p>
          </div>

          {/* Header Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Sample Text
            </button>
            <button
              onClick={handleExportReport}
              disabled={!text}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                text
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[
          { label: 'Words', value: stats.wordCount.toLocaleString(), icon: FileText, color: 'text-indigo-400', border: 'border-indigo-500/20' },
          { label: 'Chars (All)', value: stats.charCount.toLocaleString(), icon: Hash, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'No Spaces', value: stats.charNoSpaces.toLocaleString(), icon: AlignLeft, color: 'text-purple-400', border: 'border-purple-500/20' },
          { label: 'Sentences', value: stats.sentenceCount.toLocaleString(), icon: BookOpen, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Paragraphs', value: stats.paragraphCount.toLocaleString(), icon: BarChart2, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Lines', value: stats.lineCount.toLocaleString(), icon: Hash, color: 'text-pink-400', border: 'border-pink-500/20' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`p-4 rounded-2xl bg-slate-900/80 border ${item.border} flex flex-col justify-between hover:bg-slate-900 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</span>
                <Icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="mt-3">
                <span className={`text-2xl md:text-3xl font-bold font-['Space_Grotesk'] text-white`}>
                  {item.value}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Layout: Textarea & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Text Input Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-white">Your Text Document</label>
                <span className="text-xs px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Live Sync
                </span>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePaste}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
                  title="Paste from clipboard"
                >
                  <Clipboard className="w-3.5 h-3.5 text-indigo-400" />
                  Paste
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!text}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : text
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!text}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/10 transition-all flex items-center gap-1.5 ${
                    text
                      ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border-rose-500/20'
                      : 'bg-slate-800/40 text-slate-500 cursor-not-allowed'
                  }`}
                  title="Clear text"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Main Textarea */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to get instant word counts, speech estimates, keyword analytics, and readability metrics..."
                className="w-full h-80 px-4 py-3.5 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all resize-y leading-relaxed font-sans scrollbar-thin"
              />
            </div>

            {/* Bottom Live Status Bar */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/5">
              <div>
                {stats.uniqueWordsCount} unique words ({stats.wordCount > 0 ? Math.round((stats.uniqueWordsCount / stats.wordCount) * 100) : 0}% diversity)
              </div>
              <div className="flex items-center gap-4">
                <span>Avg Word: <strong className="text-slate-200">{stats.avgWordLength}</strong> chars</span>
                <span>Avg Sentence: <strong className="text-slate-200">{stats.avgSentenceLength}</strong> words</span>
              </div>
            </div>
          </div>

          {/* Reading & Speaking Estimation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Reading Time */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reading Time</span>
                <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white mt-0.5">
                  {stats.readingTimeStr}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Estimated at average 200 words per minute</p>
              </div>
            </div>

            {/* Speaking Time */}
            <div className="p-5 rounded-2xl bg-slate-900/70 border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Speaking Time</span>
                <h4 className="text-xl font-bold font-['Space_Grotesk'] text-white mt-0.5">
                  {stats.speakingTimeStr}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Estimated at speech pace 130 words per minute</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Keyword Frequency & Character Distribution */}
        <div className="space-y-6">
          {/* Top Frequent Keywords */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-sm text-white">Most Frequent Words</h3>
              </div>
              <span className="text-xs text-purple-300 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Top {stats.topKeywords.length}
              </span>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center justify-between text-xs bg-slate-950 p-2.5 rounded-xl border border-white/5">
              <span className="text-slate-400">Ignore Common Stopwords</span>
              <button
                type="button"
                onClick={() => setFilterStopWords(!filterStopWords)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  filterStopWords ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                    filterStopWords ? 'translate-x-4.5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Keywords List */}
            {stats.topKeywords.length > 0 ? (
              <div className="space-y-3">
                {stats.topKeywords.map((item, idx) => (
                  <div key={item.word} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-200 font-mono">
                          {item.word}
                        </span>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        <span className="text-purple-300 font-bold">{item.count}</span> ({item.percentage}%)
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, Math.max(8, Number(item.percentage) * 3))}%` }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 text-xs">
                {text ? 'No significant keywords found with current filter.' : 'Enter text above to compute keyword frequency.'}
              </div>
            )}
          </div>

          {/* Character Breakdown Distribution */}
          <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-sm text-white">Character Breakdown</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { label: 'Letters (a-z, A-Z)', count: stats.letters, color: 'bg-indigo-500' },
                { label: 'Digits (0-9)', count: stats.digits, color: 'bg-cyan-500' },
                { label: 'Whitespace & Tabs', count: stats.spaces, color: 'bg-amber-500' },
                { label: 'Symbols & Punctuation', count: stats.specialChars, color: 'bg-purple-500' },
              ].map((row) => {
                const pct = stats.charCount > 0 ? ((row.count / stats.charCount) * 100).toFixed(1) : 0;
                return (
                  <div key={row.label} className="space-y-1">
                    <div className="flex items-center justify-between text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${row.color}`} />
                        <span>{row.label}</span>
                      </div>
                      <span className="font-mono text-slate-400">
                        {row.count} <span className="text-[10px] text-slate-500">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${row.color} rounded-full`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
