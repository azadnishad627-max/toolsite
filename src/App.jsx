import React, { useState, lazy, Suspense } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import FloatingOrbs from './components/3d/FloatingOrbs';
import Hero3DScene from './components/3d/Hero3DScene';
import SavingsCounter from './components/common/SavingsCounter';
import { motion, AnimatePresence } from 'framer-motion';

// Lazy load tools to split the bundle and make the initial load super fast and smooth
const ImageCompressor = lazy(() => import('./components/image/ImageCompressor'));
const FormatConverter = lazy(() => import('./components/image/FormatConverter'));
const ExifStripper = lazy(() => import('./components/image/ExifStripper'));
const ImageResizer = lazy(() => import('./components/image/ImageResizer'));
const BackgroundRemover = lazy(() => import('./components/image/BackgroundRemover'));
const PdfSuite = lazy(() => import('./components/pdf/PdfSuite'));
const ResumeBuilder = lazy(() => import('./components/resume/ResumeBuilder'));
const PdfEditor = lazy(() => import('./components/pdf/PdfEditor'));
const ColorPaletteExtractor = lazy(() => import('./components/tools/ColorPaletteExtractor'));
const SocialDownloader = lazy(() => import('./components/tools/SocialDownloader'));
const QrCodeStudio = lazy(() => import('./components/tools/QrCodeStudio'));
const FaviconGenerator = lazy(() => import('./components/tools/FaviconGenerator'));

// Batch 1: New Tools
const WordCounter = lazy(() => import('./components/text/WordCounter'));
const CaseConverter = lazy(() => import('./components/text/CaseConverter'));
const LoremGenerator = lazy(() => import('./components/text/LoremGenerator'));
const PasswordGenerator = lazy(() => import('./components/tools/PasswordGenerator'));
const AgeCalculator = lazy(() => import('./components/tools/AgeCalculator'));
const JsonFormatter = lazy(() => import('./components/dev/JsonFormatter'));
const Base64Tool = lazy(() => import('./components/dev/Base64Tool'));
const ColorPickerTool = lazy(() => import('./components/tools/ColorPickerTool'));
const UnitConverter = lazy(() => import('./components/tools/UnitConverter'));
const PercentageCalc = lazy(() => import('./components/tools/PercentageCalc'));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('compress');
  const [totalSavedBytes, setTotalSavedBytes] = useState(0);

  const handleSavingsAdd = (bytes) => {
    setTotalSavedBytes((prev) => prev + bytes);
  };

  return (
    <div className="relative min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* 3D Floating Orbs & Grid Atmosphere */}
      <FloatingOrbs />

      {/* Main Content Area */}
      <div className="relative z-10">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-12">
          {/* 3D Hero Scene */}
          <Hero3DScene onSelectTab={setActiveTab} />

          {/* Active Tool Workbench Container */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Suspense fallback={<LoadingSpinner />}>
                  {activeTab === 'compress' && (
                    <ImageCompressor onSavingsAdd={handleSavingsAdd} />
                  )}
                  {activeTab === 'resize' && <ImageResizer />}
                  {activeTab === 'bg-remove' && <BackgroundRemover />}
                  {activeTab === 'pdf-editor' && <PdfEditor />}
                  {activeTab === 'pdf' && <PdfSuite />}
                  {activeTab === 'resume' && <ResumeBuilder />}
                  {activeTab === 'social' && <SocialDownloader />}
                  {activeTab === 'qr' && <QrCodeStudio />}
                  {activeTab === 'convert' && <FormatConverter />}
                  {activeTab === 'favicon' && <FaviconGenerator />}
                  {activeTab === 'exif' && <ExifStripper />}
                  {activeTab === 'palette' && <ColorPaletteExtractor />}
                  {/* Batch 1: New Tools */}
                  {activeTab === 'word-counter' && <WordCounter />}
                  {activeTab === 'case-converter' && <CaseConverter />}
                  {activeTab === 'lorem' && <LoremGenerator />}
                  {activeTab === 'password' && <PasswordGenerator />}
                  {activeTab === 'age-calc' && <AgeCalculator />}
                  {activeTab === 'json' && <JsonFormatter />}
                  {activeTab === 'base64' && <Base64Tool />}
                  {activeTab === 'color-picker' && <ColorPickerTool />}
                  {activeTab === 'unit-convert' && <UnitConverter />}
                  {activeTab === 'percent-calc' && <PercentageCalc />}
                </Suspense>
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
