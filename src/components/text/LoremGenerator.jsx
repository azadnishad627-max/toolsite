import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Copy,
  Check,
  RefreshCw,
  Download,
  Sparkles,
  Sliders,
  AlignLeft,
  Code,
  FileText,
  Layers,
  Hash
} from 'lucide-react';
import TiltCard from '../3d/TiltCard';

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
  'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat',
  'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id',
  'est', 'laborum', 'at', 'vero', 'eos', 'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus',
  'blanditiis', 'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores', 'quas', 'molestias',
  'excepturi', 'occaecati', 'provident', 'similique', 'militia', 'deserunt', 'animi', 'dolorum', 'fuga', 'harum',
  'quidem', 'rerum', 'facilis', 'expedita', 'distinctio', 'nam', 'libero', 'tempore', 'cum', 'soluta',
  'nobis', 'eligendi', 'optio', 'cumque', 'nihil', 'impedit', 'quo', 'minus', 'quod', 'maxime',
  'placeat', 'facere', 'possimus', 'omnis', 'assumenda', 'repellendus', 'temporibus', 'autem', 'quibusdam', 'officiis',
  'debitis', 'saepe', 'eveniet', 'voluptates', 'repudiandae', 'recusandae', 'itaque', 'earum', 'hic', 'tenetur',
  'sapiente', 'delectus', 'reiciendis', 'maiores', 'alias', 'consequatur', 'perferendis', 'doloribus', 'asperiores', 'repellat',
  'aenean', 'imperdiet', 'posuere', 'tortor', 'integer', 'viverra', 'fringilla', 'lacus', 'pellentesque', 'habitasse',
  'morbi', 'tristique', 'senectus', 'netus', 'malesuada', 'fames', 'turpis', 'egestas', 'porttitor', 'cursus',
  'vulputate', 'elementum', 'ultricies', 'interdum', 'faucibus', 'scelerisque', 'varius', 'placerat', 'dapibus', 'feugiat'
];

const CLASSIC_LEAD = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];

export default function LoremGenerator() {
  const [unit, setUnit] = useState('paragraphs'); // 'paragraphs', 'sentences', 'words'
  const [count, setCount] = useState(3);
  const [startWithLorem, setStartWithLorem] = useState(true);
  const [format, setFormat] = useState('text'); // 'text', 'html', 'json', 'markdown'
  const [generatedText, setGeneratedText] = useState('');
  const [copied, setCopied] = useState(false);

  // Helper to pick random word
  const getRandomWord = () => {
    const idx = Math.floor(Math.random() * LOREM_WORDS.length);
    return LOREM_WORDS[idx];
  };

  // Generate a random sentence
  const generateSentence = (isFirstSentence = false) => {
    const sentenceLength = Math.floor(Math.random() * 9) + 8; // 8 to 16 words
    let words = [];

    if (isFirstSentence && startWithLorem) {
      words = [...CLASSIC_LEAD];
      while (words.length < sentenceLength) {
        words.push(getRandomWord());
      }
    } else {
      for (let i = 0; i < sentenceLength; i++) {
        words.push(getRandomWord());
      }
    }

    // Capitalize first word
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Maybe add a comma in middle
    if (words.length > 8 && Math.random() > 0.4) {
      const commaIdx = Math.floor(words.length / 2);
      words[commaIdx] = words[commaIdx] + ',';
    }

    return words.join(' ') + '.';
  };

  // Generate a paragraph of sentences
  const generateParagraph = (isFirstParagraph = false) => {
    const numSentences = Math.floor(Math.random() * 4) + 4; // 4 to 7 sentences
    const sentences = [];
    for (let i = 0; i < numSentences; i++) {
      sentences.push(generateSentence(isFirstParagraph && i === 0));
    }
    return sentences.join(' ');
  };

  // Main Generator logic
  const handleGenerate = () => {
    let result = '';

    if (unit === 'words') {
      const targetCount = Math.max(1, Math.min(1000, count));
      let words = [];
      if (startWithLorem) {
        for (let i = 0; i < Math.min(targetCount, CLASSIC_LEAD.length); i++) {
          words.push(CLASSIC_LEAD[i]);
        }
      }
      while (words.length < targetCount) {
        words.push(getRandomWord());
      }
      if (words.length > 0) {
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
      }

      if (format === 'html') {
        result = `<p>${words.join(' ')}.</p>`;
      } else if (format === 'json') {
        result = JSON.stringify(words, null, 2);
      } else {
        result = words.join(' ') + '.';
      }
    } else if (unit === 'sentences') {
      const targetCount = Math.max(1, Math.min(100, count));
      const sentences = [];
      for (let i = 0; i < targetCount; i++) {
        sentences.push(generateSentence(i === 0));
      }

      if (format === 'html') {
        result = sentences.map((s) => `<p>${s}</p>`).join('\n');
      } else if (format === 'json') {
        result = JSON.stringify(sentences, null, 2);
      } else if (format === 'markdown') {
        result = sentences.join('\n\n');
      } else {
        result = sentences.join(' ');
      }
    } else {
      // Paragraphs
      const targetCount = Math.max(1, Math.min(20, count));
      const paragraphs = [];
      for (let i = 0; i < targetCount; i++) {
        paragraphs.push(generateParagraph(i === 0));
      }

      if (format === 'html') {
        result = paragraphs.map((p) => `<p>\n  ${p}\n</p>`).join('\n\n');
      } else if (format === 'json') {
        result = JSON.stringify(paragraphs, null, 2);
      } else if (format === 'markdown') {
        result = paragraphs.join('\n\n');
      } else {
        result = paragraphs.join('\n\n');
      }
    }

    setGeneratedText(result);
  };

  // Re-generate automatically when inputs change
  useEffect(() => {
    handleGenerate();
  }, [unit, count, startWithLorem, format]);

  // Adjust count bounds when changing unit
  const handleUnitChange = (newUnit) => {
    setUnit(newUnit);
    if (newUnit === 'paragraphs') {
      setCount((c) => Math.min(20, Math.max(1, c)));
    } else if (newUnit === 'sentences') {
      setCount((c) => Math.min(100, Math.max(1, c > 20 ? c : 5)));
    } else if (newUnit === 'words') {
      setCount((c) => Math.min(1000, Math.max(1, c < 10 ? 50 : c)));
    }
  };

  const handleCopy = async () => {
    if (!generatedText) return;
    try {
      await navigator.clipboard.writeText(generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    if (!generatedText) return;
    const extension = format === 'html' ? 'html' : format === 'json' ? 'json' : format === 'markdown' ? 'md' : 'txt';
    const mimeType = format === 'html' ? 'text/html' : format === 'json' ? 'application/json' : 'text/plain';
    const blob = new Blob([generatedText], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lorem_ipsum_${count}_${unit}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Metrics
  const metrics = useMemo(() => {
    const textOnly = generatedText.replace(/<[^>]*>/g, '').trim();
    const words = textOnly ? textOnly.split(/\s+/).length : 0;
    const chars = generatedText.length;
    const paragraphs = generatedText.split(/\n\n+/).filter(Boolean).length;
    return { words, chars, paragraphs };
  }, [generatedText]);

  const limits = {
    paragraphs: { min: 1, max: 20, presets: [1, 3, 5, 10, 20] },
    sentences: { min: 1, max: 100, presets: [5, 10, 25, 50, 100] },
    words: { min: 1, max: 1000, presets: [25, 50, 100, 250, 500] },
  };

  return (
    <div className="space-y-8">
      {/* 3D Header Section */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs tracking-wider uppercase">
              <FileCode className="w-4 h-4" />
              Dummy Text Generator
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Lorem Ipsum Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Generate placeholder copy in classical Latin with precision paragraph counts, HTML markup tags, Markdown, or JSON data arrays.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerate}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-neon-indigo transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-roll Content
            </button>
          </div>
        </div>
      </TiltCard>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-6">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-sm text-white">Generator Settings</h3>
          </div>

          {/* Unit Switcher */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Generation Unit</label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-white/10">
              {[
                { id: 'paragraphs', label: 'Paragraphs' },
                { id: 'sentences', label: 'Sentences' },
                { id: 'words', label: 'Words' },
              ].map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleUnitChange(u.id)}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${
                    unit === u.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount Slider & Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Amount ({unit})</label>
              <input
                type="number"
                min={limits[unit].min}
                max={limits[unit].max}
                value={count}
                onChange={(e) => setCount(Math.max(limits[unit].min, Math.min(limits[unit].max, Number(e.target.value) || 1)))}
                className="w-20 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-white text-xs font-mono text-center focus:border-purple-500 focus:outline-none"
              />
            </div>
            <input
              type="range"
              min={limits[unit].min}
              max={limits[unit].max}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-2 rounded-lg cursor-pointer"
            />
            {/* Presets */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {limits[unit].presets.map((p) => (
                <button
                  key={p}
                  onClick={() => setCount(p)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    count === p
                      ? 'bg-purple-600 text-white font-bold'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Format Selector */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="text-xs font-semibold text-slate-300">Output Structure</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'text', label: 'Plain Text', icon: AlignLeft },
                { id: 'html', label: 'HTML <p>', icon: Code },
                { id: 'markdown', label: 'Markdown', icon: FileText },
                { id: 'json', label: 'JSON Array', icon: Layers },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.id}
                    onClick={() => setFormat(f.id)}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-2 ${
                      format === f.id
                        ? 'bg-purple-500/20 text-purple-200 border-purple-500/40'
                        : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-white/5'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-purple-400" />
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start with Lorem Toggle */}
          <div className="pt-2 border-t border-white/5">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 hover:bg-slate-800/60 border border-white/5 cursor-pointer transition-colors">
              <div className="space-y-0.5">
                <span className="text-xs font-medium text-slate-200">Start with 'Lorem ipsum'</span>
                <p className="text-[10px] text-slate-500">Include classic Cicero opening</p>
              </div>
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={(e) => setStartWithLorem(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600 bg-slate-900 border-white/10 cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Output Column */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/70 border border-white/10 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                <Hash className="w-3.5 h-3.5 text-purple-400" />
                <strong className="text-white">{metrics.chars.toLocaleString()}</strong> Characters
              </span>
              <span className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-white/5">
                <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                <strong className="text-white">{metrics.words.toLocaleString()}</strong> Words
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
              <button
                onClick={handleCopy}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  copied
                    ? 'bg-emerald-500 text-white border-emerald-400 shadow-neon-cyan'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-transparent'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
            </div>
          </div>

          {/* Output Content Area */}
          <div className="relative">
            <textarea
              readOnly
              value={generatedText}
              className="w-full h-96 p-4 rounded-xl bg-slate-950 border border-white/10 text-slate-200 text-sm font-serif leading-relaxed focus:outline-none focus:border-purple-500 resize-y scrollbar-thin select-all font-mono"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-white/5">
            <span>Vocabulary Pool: 120+ classical Latin terms</span>
            <span>100% Client-Side generation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
