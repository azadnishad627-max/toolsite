import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Layers, Cpu, QrCode, Film, Palette, Image, Type, FileText, Hash, Code2, Calculator, KeyRound, AlignLeft, Clock, Percent, Binary, Pipette, Ruler, TextCursorInput, Lock, Wand2, GraduationCap, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ activeTab, setActiveTab }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [filterCat, setFilterCat] = useState('all');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const allTools = [
    // Featured / Hot
    { id: 'study-notes', label: '📚 AI Study Notes (NEW)', icon: GraduationCap, cat: 'study' },
    { id: 'enhancer', label: 'AI Photo Enhancer', icon: Wand2, cat: 'image' },
    // Image Tools
    { id: 'compress', label: 'Compressor', icon: Sparkles, cat: 'image' },
    { id: 'resize', label: 'Resize & Crop', icon: Cpu, cat: 'image' },
    { id: 'bg-remove', label: 'AI BG Remover', icon: Image, cat: 'image' },
    { id: 'convert', label: 'Format Converter', icon: Layers, cat: 'image' },
    { id: 'exif', label: 'EXIF Wiper', icon: ShieldCheck, cat: 'image' },
    { id: 'favicon', label: 'Favicon Gen', icon: Sparkles, cat: 'image' },
    { id: 'palette', label: 'Color Palette', icon: Palette, cat: 'image' },
    // PDF & Docs
    { id: 'pdf-editor', label: 'PDF Editor', icon: Type, cat: 'pdf' },
    { id: 'pdf', label: 'PDF Suite', icon: Layers, cat: 'pdf' },
    { id: 'resume', label: 'CV Builder', icon: FileText, cat: 'pdf' },
    // Text
    { id: 'word-counter', label: 'Word Counter', icon: Hash, cat: 'text' },
    { id: 'case-converter', label: 'Case Converter', icon: TextCursorInput, cat: 'text' },
    { id: 'lorem', label: 'Lorem Ipsum', icon: AlignLeft, cat: 'text' },
    // Developer
    { id: 'json', label: 'JSON Formatter', icon: Code2, cat: 'dev' },
    { id: 'base64', label: 'Base64 Tool', icon: Binary, cat: 'dev' },
    { id: 'qr', label: 'QR Code', icon: QrCode, cat: 'dev' },
    // Tools & Calculators
    { id: 'social', label: 'YT & Insta', icon: Film, cat: 'tools' },
    { id: 'password', label: 'Password Gen', icon: KeyRound, cat: 'tools' },
    { id: 'color-picker', label: 'Color Picker', icon: Pipette, cat: 'tools' },
    { id: 'unit-convert', label: 'Unit Converter', icon: Ruler, cat: 'tools' },
    { id: 'percent-calc', label: '% Calculator', icon: Percent, cat: 'tools' },
    { id: 'age-calc', label: 'Age Calculator', icon: Clock, cat: 'tools' },
  ];

  const categoryFilters = [
    { id: 'all', label: 'All (24)' },
    { id: 'study', label: '📚 AI Study (HOT)' },
    { id: 'image', label: '🖼️ Image' },
    { id: 'pdf', label: '📄 PDF' },
    { id: 'text', label: '📝 Text' },
    { id: 'dev', label: '💻 Dev' },
    { id: 'tools', label: '🔧 Tools' },
  ];

  const filteredTools = filterCat === 'all' ? allTools : allTools.filter(t => t.cat === filterCat);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070913]/85 border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-3">
        {/* Top Row: Brand + Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.6, type: 'spring' }}
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] shadow-neon-indigo cursor-pointer"
              onClick={() => setActiveTab('compress')}
            >
              <div className="w-full h-full bg-[#090D16] rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </motion.div>
            <div className="cursor-pointer" onClick={() => setActiveTab('compress')}>
              <div className="flex items-center gap-2">
                <span className="font-['Space_Grotesk'] font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  PrivaMedia
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  22 Tools
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium hidden sm:block">All-in-One Free Toolkit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium">100% Free</span>
            </div>
          </div>
        </div>

        {/* Category Filter Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {categoryFilters.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id)}
              className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                filterCat === c.id
                  ? 'bg-indigo-600/80 text-white border border-indigo-400/40'
                  : 'text-slate-400 hover:text-white bg-white/5 border border-transparent'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Tools Scroll Row */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
          {filteredTools.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-xl border border-indigo-400/40 shadow-neon-indigo -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
