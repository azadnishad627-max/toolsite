import React, { useState } from 'react';
import { Layers, Scissors, FileImage, Image as ImageIcon } from 'lucide-react';
import PdfMerger from './PdfMerger';
import PdfSplitter from './PdfSplitter';
import ImagesToPdf from './ImagesToPdf';
import PdfToImages from './PdfToImages';
import TiltCard from '../3d/TiltCard';

export default function PdfSuite() {
  const [subTab, setSubTab] = useState('merge'); // 'merge', 'split', 'img2pdf', 'pdf2img'

  const tabs = [
    { id: 'merge', label: 'Merge PDFs', icon: Layers },
    { id: 'split', label: 'Split & Extract', icon: Scissors },
    { id: 'img2pdf', label: 'JPEG to PDF', icon: FileImage },
    { id: 'pdf2img', label: 'PDF to JPEG / PNG', icon: ImageIcon },
  ];

  return (
    <div className="space-y-8">
      <TiltCard glowColor="indigo" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs tracking-wider uppercase">
              <Layers className="w-4 h-4" />
              Comprehensive Document Suite
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              Zero-Upload PDF Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Merge documents, extract specific pages, convert images into PDFs, or render PDF pages into high-res JPGs.
            </p>
          </div>

          {/* Sub-tabs Selector */}
          <div className="flex flex-wrap items-center gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = subTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSubTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-neon-indigo'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </TiltCard>

      {/* Render Subtab */}
      {subTab === 'merge' && <PdfMerger />}
      {subTab === 'split' && <PdfSplitter />}
      {subTab === 'img2pdf' && <ImagesToPdf />}
      {subTab === 'pdf2img' && <PdfToImages />}
    </div>
  );
}
