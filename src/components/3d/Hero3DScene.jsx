import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Sparkles, Lock, ArrowRight, Layers, Cpu } from 'lucide-react';

export default function Hero3DScene({ onSelectTab }) {
  const features = [
    { title: 'Zero-Upload Privacy', desc: 'No servers involved. Zero data leakage.', icon: Lock, color: 'emerald' },
    { title: 'Instant 0s Speed', desc: 'Hardware-accelerated processing in RAM.', icon: Zap, color: 'indigo' },
    { title: 'Unlimited & Free', desc: 'No file size paywalls or subscription limits.', icon: Sparkles, color: 'cyan' },
  ];

  return (
    <div className="relative py-12 md:py-16 text-center space-y-8 max-w-4xl mx-auto px-4">
      {/* 3D Floating Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-neon-indigo"
      >
        <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Next-Gen Private Media Workbench</span>
      </motion.div>

      {/* Main Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="space-y-4"
      >
        <h1 className="font-['Space_Grotesk'] text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Supercharge Media & PDFs. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Zero Server Uploads.
          </span>
        </h1>
        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Compress high-res images, convert WebP/PNG/JPG formats, merge & split PDFs, wipe EXIF metadata, and extract color swatches — entirely within your browser memory.
        </p>
      </motion.div>

      {/* Quick Launch Cards */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4"
      >
        {features.map((f, idx) => {
          const Icon = f.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl glass-panel-interactive text-left space-y-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-xs text-white">{f.title}</h3>
              <p className="text-[11px] text-slate-400">{f.desc}</p>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
