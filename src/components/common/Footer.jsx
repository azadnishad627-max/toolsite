import React from 'react';
import { ShieldCheck, Heart, Sparkles, Lock, Cpu, Globe } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#070913]/90 backdrop-blur-md py-12 px-4 lg:px-8 text-center relative z-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Lock className="w-3.5 h-3.5" /> 100% Client-Side Private
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-indigo-400 font-semibold">
            <Cpu className="w-3.5 h-3.5" /> HTML5 Canvas & Web Worker Accelerated
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Globe className="w-3.5 h-3.5" /> Works Offline & No Account Needed
          </span>
        </div>

        <div className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
          PrivaMedia Studio is an open-source, zero-upload privacy media workbench. All compression, conversion, EXIF stripping, and PDF handling occur exclusively in your browser memory.
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
          Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for creator privacy & ultra-fast workflows
        </div>
      </div>
    </footer>
  );
}
