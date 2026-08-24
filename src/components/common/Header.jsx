import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Layers, Cpu, QrCode, Film, Palette, Image } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({ activeTab, setActiveTab }) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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

  const navItems = [
    { id: 'compress', label: 'Compressor', icon: Sparkles },
    { id: 'bg-remove', label: 'AI BG Remover', icon: Image },
    { id: 'resize', label: 'Resize & Crop', icon: Cpu },
    { id: 'pdf', label: 'PDF Studio (4-in-1)', icon: Layers },
    { id: 'social', label: 'YT & Insta Downloader', icon: Film },
    { id: 'qr', label: 'QR Code Studio', icon: QrCode },
    { id: 'convert', label: 'Converter', icon: Layers },
    { id: 'favicon', label: 'Favicons', icon: Sparkles },
    { id: 'exif', label: 'EXIF Wiper', icon: ShieldCheck },
    { id: 'palette', label: 'Color AI', icon: Palette },
  ];

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
                  Zero-Upload Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">100% Client-Side Privacy Workbench</p>
            </div>
          </div>

          {/* Privacy & Offline Live Status Badge */}
          <div className="flex md:hidden items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-medium text-[11px]">0 Bytes Sent</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
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
        </div>

        {/* Right Status */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium">100% In-Browser</span>
          </div>
        </div>
      </div>
    </header>
  );
}
