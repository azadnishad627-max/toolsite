import React, { useEffect, useState } from 'react';
import { Sparkles, HardDriveDownload, ArrowDownRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { formatBytes } from '../../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

export default function SavingsCounter({ totalSavedBytes = 0 }) {
  const [prevSaved, setPrevSaved] = useState(0);

  useEffect(() => {
    if (totalSavedBytes > prevSaved && totalSavedBytes > 500 * 1024) { // > 500KB saved
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#6366F1', '#06B6D4', '#10B981', '#F59E0B'],
      });
    }
    setPrevSaved(totalSavedBytes);
  }, [totalSavedBytes]);

  if (totalSavedBytes <= 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative group cursor-default">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500 via-emerald-500 to-cyan-500 opacity-70 blur-md group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#090D16] border border-white/20 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-[1px] flex items-center justify-center">
              <div className="w-full h-full bg-[#090D16] rounded-[11px] flex items-center justify-center">
                <HardDriveDownload className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Session Storage Saved
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-['Space_Grotesk'] text-lg font-bold text-white tracking-tight">
                  {formatBytes(totalSavedBytes)}
                </span>
                <span className="text-xs text-emerald-400 font-semibold flex items-center">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Free Saved
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
