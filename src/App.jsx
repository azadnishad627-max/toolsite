import React, { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingOrbs from './components/3d/FloatingOrbs';
import Hero3DScene from './components/3d/Hero3DScene';
import SavingsCounter from './components/common/SavingsCounter';
import ImageCompressor from './components/image/ImageCompressor';
import FormatConverter from './components/image/FormatConverter';
import ExifStripper from './components/image/ExifStripper';
import ImageResizer from './components/image/ImageResizer';
import PdfSuite from './components/pdf/PdfSuite';
import ColorPaletteExtractor from './components/tools/ColorPaletteExtractor';
import SocialDownloader from './components/tools/SocialDownloader';
import QrCodeStudio from './components/tools/QrCodeStudio';
import FaviconGenerator from './components/tools/FaviconGenerator';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [activeTab, setActiveTab] = useState('compress');
  const [totalSavedBytes, setTotalSavedBytes] = useState(0);

  const handleSavingsAdd = (bytes) => {
    setTotalSavedBytes((prev) => prev + bytes);
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* 3D Floating Orbs & Grid Atmosphere */}
      <FloatingOrbs />

      {/* Main Content Area */}
      <div className="relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-12">
          {/* 3D Hero Scene */}
          <Hero3DScene onSelectTab={setActiveTab} />

          {/* Active Tool Workbench Container */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'compress' && (
                  <ImageCompressor onSavingsAdd={handleSavingsAdd} />
                )}
                {activeTab === 'resize' && <ImageResizer />}
                {activeTab === 'pdf' && <PdfSuite />}
                {activeTab === 'social' && <SocialDownloader />}
                {activeTab === 'qr' && <QrCodeStudio />}
                {activeTab === 'convert' && <FormatConverter />}
                {activeTab === 'favicon' && <FaviconGenerator />}
                {activeTab === 'exif' && <ExifStripper />}
                {activeTab === 'palette' && <ColorPaletteExtractor />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Live Savings Counter & Confetti Trigger */}
      <SavingsCounter totalSavedBytes={totalSavedBytes} />

      {/* Footer */}
      <Footer />
    </div>
  );
}
