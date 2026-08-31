import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Sparkles, Layers, Cpu, QrCode, Film, Palette, Image, Type, FileText, ChevronDown, Hash, Code2, Calculator, KeyRound, AlignLeft, Clock, Percent, Binary, Pipette, Ruler, TextCursorInput } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header({ activeTab, setActiveTab }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Top-level direct nav items (most popular tools)
  const mainNav = [
    { id: 'compress', label: 'Compressor', icon: Sparkles },
    { id: 'bg-remove', label: 'AI BG Remover', icon: Image },
    { id: 'social', label: 'Downloader', icon: Film },
    { id: 'resume', label: 'CV Builder', icon: FileText },
  ];

  // Categorized dropdown menus
  const categories = [
    {
      label: '🖼️ Image',
      items: [
        { id: 'compress', label: 'Image Compressor', icon: Sparkles },
        { id: 'resize', label: 'Resize & Crop', icon: Cpu },
        { id: 'bg-remove', label: 'AI BG Remover', icon: Image },
        { id: 'convert', label: 'Format Converter', icon: Layers },
        { id: 'exif', label: 'EXIF Wiper', icon: ShieldCheck },
        { id: 'favicon', label: 'Favicon Generator', icon: Sparkles },
        { id: 'palette', label: 'Color Palette AI', icon: Palette },
      ],
    },
    {
      label: '📄 PDF & Docs',
      items: [
        { id: 'pdf-editor', label: 'PDF Editor', icon: Type },
        { id: 'pdf', label: 'PDF Studio (4-in-1)', icon: Layers },
        { id: 'resume', label: 'Resume Builder', icon: FileText },
      ],
    },
    {
      label: '📝 Text',
      items: [
        { id: 'word-counter', label: 'Word Counter', icon: Hash },
        { id: 'case-converter', label: 'Case Converter', icon: TextCursorInput },
        { id: 'lorem', label: 'Lorem Ipsum', icon: AlignLeft },
      ],
    },
    {
      label: '💻 Developer',
      items: [
        { id: 'json', label: 'JSON Formatter', icon: Code2 },
        { id: 'base64', label: 'Base64 Tool', icon: Binary },
        { id: 'qr', label: 'QR Code Studio', icon: QrCode },
      ],
    },
    {
      label: '🔧 Tools',
      items: [
        { id: 'password', label: 'Password Generator', icon: KeyRound },
        { id: 'color-picker', label: 'Color Picker', icon: Pipette },
        { id: 'unit-convert', label: 'Unit Converter', icon: Ruler },
        { id: 'percent-calc', label: '% Calculator', icon: Percent },
        { id: 'age-calc', label: 'Age Calculator', icon: Clock },
        { id: 'social', label: 'YT & Insta Downloader', icon: Film },
      ],
    },
  ];

  const handleSelect = (id) => {
    setActiveTab(id);
    setOpenDropdown(null);
  };

  // Check if current tab is inside a category
  const isTabInCategory = (cat) => cat.items.some(item => item.id === activeTab);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070913]/85 border-b border-white/10 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
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
              <p className="text-xs text-slate-400 font-medium">All-in-One Free Toolkit</p>
            </div>
          </div>

          {/* Mobile Status */}
          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-[11px]">Free</span>
          </div>
        </div>

        {/* Navigation: Main + Category Dropdowns */}
        <div ref={dropdownRef} className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {/* Main Quick Nav */}
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
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

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 mx-1 shrink-0" />

          {/* Category Dropdowns */}
          {categories.map((cat) => {
            const isOpen = openDropdown === cat.label;
            const hasActive = isTabInCategory(cat);
            return (
              <div key={cat.label} className="relative">
                <button
                  onClick={() => setOpenDropdown(isOpen ? null : cat.label)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1 ${
                    hasActive || isOpen
                      ? 'text-white bg-white/10 border border-white/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{cat.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 py-2 rounded-xl bg-[#0f1323] border border-white/10 shadow-2xl shadow-black/50 z-50"
                    >
                      {cat.items.map((item) => {
                        const Icon = item.icon;
                        const isActive2 = activeTab === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item.id)}
                            className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center gap-2.5 transition-all ${
                              isActive2
                                ? 'text-white bg-indigo-600/30'
                                : 'text-slate-300 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            <Icon className={`w-4 h-4 ${isActive2 ? 'text-cyan-400' : 'text-slate-500'}`} />
                            {item.label}
                            {isActive2 && <span className="ml-auto text-[10px] text-cyan-400 font-bold">●</span>}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Right Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">100% Free</span>
          </div>
        </div>
      </div>
    </header>
  );
}
