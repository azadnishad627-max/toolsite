import React, { useState, useRef } from 'react';
import { 
  BookOpen, Sparkles, PenTool, Brain, HelpCircle, FileText, Download, 
  Printer, CheckCircle2, XCircle, ChevronRight, Layers, GraduationCap, 
  RotateCcw, Copy, Check, Share2, Award, Zap, ArrowRight, Eye, ShieldCheck,
  RefreshCw, FileCheck, Lightbulb, AlertTriangle, Languages, CheckCheck,
  Maximize, FileSpreadsheet, Compass, FileDown, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import TiltCard from '../3d/TiltCard';

// Quick Preset topics for 1-click test
const QUICK_TOPICS = [
  {
    title: "प्रकाश संश्लेषण (Photosynthesis & Light Reactions)",
    grade: "Class 10 Biology",
    lang: "Hindi",
    icon: "🌱"
  },
  {
    title: "Newton's 3 Laws of Motion & Momentum",
    grade: "Class 11 Physics",
    lang: "English",
    icon: "⚡"
  },
  {
    title: "Human Digestive System & Enzymes",
    grade: "Class 10 Biology",
    lang: "Hinglish",
    icon: "🩺"
  },
  {
    title: "The French Revolution & Key Timeline",
    grade: "Class 9 History",
    lang: "English",
    icon: "🏛️"
  }
];

export default function StudyNotesStudio() {
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [grade, setGrade] = useState('Class 10-12');
  const [language, setLanguage] = useState('Hindi'); // 'Hindi' | 'English' | 'Hinglish'
  const [isLoading, setIsLoading] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing chapter topic...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Handwritten Notebook Styling Controls
  const [handwritingFont, setHandwritingFont] = useState("'Kalam', cursive");
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Royal Blue Ink
  const [headingColor, setHeadingColor] = useState('#991b1b'); // Dark Crimson Red
  const [highlightBg, setHighlightBg] = useState('#fef08a'); // Pastel Yellow
  const [copiedSection, setCopiedSection] = useState(null);

  // MCQ Selection inside notebook
  const [userAnswers, setUserAnswers] = useState({});

  const notebookRef = useRef(null);

  const handleGenerate = async (presetTopic = null) => {
    const searchTopic = presetTopic ? presetTopic.title : topic;
    const searchGrade = presetTopic ? presetTopic.grade : grade;
    const searchLang = presetTopic ? presetTopic.lang : language;

    if (!searchTopic.trim() && !content.trim()) {
      setError('Please enter a chapter topic or paste content.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUserAnswers({});
    setLoadingStep('Connecting to NVIDIA AI Brain...');

    const stepTimer1 = setTimeout(() => setLoadingStep(`Drafting In-Depth Handwritten Notes in ${searchLang}...`), 2000);
    const stepTimer2 = setTimeout(() => setLoadingStep('Drawing Concept Diagrams & Visual Flowchart...'), 4500);
    const stepTimer3 = setTimeout(() => setLoadingStep('Embedding MCQs & Exam Questions into Notebook...'), 7000);

    try {
      const res = await fetch('/api/ai/study-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: searchTopic.trim(),
          content: content.trim(),
          grade: searchGrade,
          language: searchLang
        })
      });

      const data = await res.json();
      if (data.success && data.data) {
        setResult(data.data);
      } else {
        throw new Error(data.error || 'Failed to generate study notes.');
      }
    } catch (err) {
      setError(err.message || 'Server is busy. Please try again.');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setIsLoading(false);
    }
  };

  // Direct Client-Side A4 PDF Download
  const handleDownloadPdf = async () => {
    if (!notebookRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = notebookRef.current;
      
      // Capture at high 2x scale for sharp text rendering
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 794
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

      const imgProps = pdf.getImageProperties(imgData);
      const calculatedHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = calculatedHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight);
      heightLeft -= pdfHeight;

      // Multi-page slicing if content is long
      while (heightLeft > 0) {
        position = heightLeft - calculatedHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, calculatedHeight);
        heightLeft -= pdfHeight;
      }

      const cleanFileName = (result?.chapterTitle || 'study_notes')
        .replace(/[^a-zA-Z0-9_\u0900-\u097F]/g, '_')
        .slice(0, 30);
      
      pdf.save(`${cleanFileName}_handwritten_A4.pdf`);
    } catch (err) {
      console.error('PDF Export Error:', err);
      // Fallback to print if canvas fails
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Safe Notes Copy String
  const getNotesCopyText = () => {
    if (!result) return '';
    let full = `=== ${result.chapterTitle} ===\nSubject: ${result.subject}\n\n${result.keyTakeaway}\n\n`;
    
    if (Array.isArray(result.handwrittenNotes)) {
      full += result.handwrittenNotes.map(n => {
        const pts = Array.isArray(n?.bulletPoints) ? n.bulletPoints.map(p => `• ${p}`).join('\n') : '';
        return `${n?.heading || ''}\n${pts}\n${n?.highlightNote ? `[Exam Tip: ${n.highlightNote}]` : ''}`;
      }).join('\n\n');
    }

    if (Array.isArray(result.examQuestions)) {
      full += '\n\n=== EXAM QUESTIONS ===\n' + result.examQuestions.map((q, i) => `Q${i+1} (${q.marks}M): ${q.question}\nAns: ${q.answer}`).join('\n\n');
    }

    return full;
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" /> Powered by NVIDIA NIM Llama 3.2 AI
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              AI Handwritten Study Notes & Exam Studio
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Turn any chapter into a <strong>Real A4 Handwritten Notebook Assignment</strong> with Pen Ink, Diagrams, MCQs & Model Answers in Hindi or English — with 1-Click direct PDF download!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-cyan-400" />
              <span>Hindi / English / Hinglish</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <FileDown className="w-4 h-4 text-emerald-400" />
              <span>Direct A4 PDF Export</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Input / Topic Generator Workbench */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
        <div className="space-y-4">
          
          {/* Row 1: Language Selector Pills (Very Prominent) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Languages className="w-4 h-4 text-amber-400" /> Select Notes Language (भाषा चुनें):
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'Hindi', label: '🇮🇳 हिन्दी (Pure Hindi Notes)', desc: 'देवनागरी लिपि में संपूर्ण हस्तलिखित नोट्स' },
                { id: 'English', label: '🇬🇧 English (Standard Academic)', desc: 'Full English textbook handwritten assignment' },
                { id: 'Hinglish', label: '🇮🇳 Hinglish (Easy Mixed Hindi+Eng)', desc: 'Student-friendly Roman Hindi mixed notes' }
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    language === lang.id
                      ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-neon-indigo'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-between">
                    <span>{lang.label}</span>
                    {language === lang.id && <span className="text-cyan-400 font-bold">✓ Active</span>}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{lang.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Topic + Grade Level */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-2">
            {/* Topic Input */}
            <div className="md:col-span-8 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Chapter Name / Topic:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={language === 'Hindi' ? "उदा. प्रकाश संश्लेषण (Photosynthesis), गति के नियम, मानव पाचन तंत्र..." : "e.g. Photosynthesis, Newton's Laws of Motion, Human Digestive System..."}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Class / Grade Level */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Grade / Target Exam:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="Class 9-10">Class 9 - 10 (Secondary Board)</option>
                <option value="Class 11-12">Class 11 - 12 (Higher Secondary)</option>
                <option value="NEET / JEE">NEET / JEE / Medical / Eng</option>
                <option value="UPSC / Govt Exam">UPSC / SSC / State Boards</option>
                <option value="College / University">College / B.Sc / B.Tech</option>
              </select>
            </div>
          </div>

          {/* Optional Text Content */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Paste Chapter Notes or Book Text (Optional):</span>
              <span className="text-[11px] text-slate-500">Leave blank for automatic topic-based generation</span>
            </label>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Book ke kisi page ka text ya syllabus points yahan paste kar sakte hain..."
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Quick Presets & Generate Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400">⚡ 1-Click Try:</span>
              {QUICK_TOPICS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => { setTopic(q.title); setGrade(q.grade); setLanguage(q.lang); handleGenerate(q); }}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-white/10 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                >
                  <span>{q.icon}</span> <span>{q.title.split(' ')[0]}</span> <span className="text-[10px] text-cyan-400 font-semibold">({q.lang})</span>
                </button>
              ))}
            </div>

            <button
              disabled={isLoading || (!topic.trim() && !content.trim())}
              onClick={() => handleGenerate()}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:opacity-90 disabled:opacity-50 text-white shadow-neon-indigo transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating with NVIDIA AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Complete Handwritten Notes & PDF
                </>
              )}
            </button>
          </div>

          {/* Loading Animation Progress Bar */}
          {isLoading && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-center space-y-3">
              <div className="flex items-center justify-center gap-3 text-sm font-bold text-cyan-300">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                <span>{loadingStep}</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400"
                  initial={{ width: "10%" }}
                  animate={{ width: "95%" }}
                  transition={{ duration: 10, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-slate-400">NVIDIA Neural Engine is writing your handwritten notebook assignment in {language}...</p>
            </motion.div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* 📖 ALL-IN-ONE REALISTIC HANDWRITTEN NOTEBOOK WORKBENCH */}
      {result && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Action & Customization Toolbar */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex flex-wrap items-center justify-between gap-4">
            {/* Styling controls */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              {/* Font picker */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Handwriting:</span>
                <select
                  value={handwritingFont}
                  onChange={(e) => setHandwritingFont(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs font-semibold"
                >
                  <option value="'Kalam', cursive">Kalam (Real Hindi & Eng Student Pen)</option>
                  <option value="'Mukta', sans-serif">Mukta (Clean Devanagari Print)</option>
                  <option value="'Caveat', cursive">Caveat (Cursive Flow)</option>
                  <option value="'Patrick Hand', cursive">Patrick Hand (Ballpoint)</option>
                  <option value="'Indie Flower', cursive">Indie Flower (Casual)</option>
                </select>
              </div>

              {/* Ink color picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Ink:</span>
                {[
                  { label: 'Royal Blue Ink', color: '#1e3a8a' },
                  { label: 'Gel Indigo', color: '#312e81' },
                  { label: 'Midnight Black', color: '#09090b' },
                  { label: 'Dark Teal', color: '#134e4a' }
                ].map((c) => (
                  <button
                    key={c.color}
                    title={c.label}
                    onClick={() => setInkColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      inkColor === c.color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-80'
                    }`}
                  />
                ))}
              </div>

              {/* Heading color */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-medium">Headings:</span>
                {[
                  { color: '#991b1b', label: 'Crimson Red' },
                  { color: '#065f46', label: 'Forest Green' },
                  { color: '#1e3a8a', label: 'Deep Blue' },
                  { color: '#000000', label: 'Black' }
                ].map((c) => (
                  <button
                    key={c.color}
                    title={c.label}
                    onClick={() => setHeadingColor(c.color)}
                    style={{ backgroundColor: c.color }}
                    className={`w-5 h-5 rounded-full border transition-all ${
                      headingColor === c.color ? 'border-white scale-110 shadow' : 'border-transparent opacity-80'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Direct Download & Copy Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => copyToClipboard(getNotesCopyText(), 'all-notes')}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 border border-white/10 transition-all"
              >
                {copiedSection === 'all-notes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSection === 'all-notes' ? 'Copied!' : 'Copy Text'}
              </button>

              {/* DIRECT PDF DOWNLOAD BUTTON */}
              <button
                disabled={isExportingPdf}
                onClick={handleDownloadPdf}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all"
              >
                {isExportingPdf ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Generating A4 PDF...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4" />
                    ⬇ Download A4 PDF
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 📄 THE COMPLETE A4 NOTEBOOK (Everything Handwritten Inside) */}
          <div className="flex justify-center overflow-x-auto py-2">
            <div 
              ref={notebookRef}
              style={{
                fontFamily: handwritingFont,
                color: inkColor,
                width: '100%',
                maxWidth: '794px',
                minHeight: '1123px',
                background: '#ffffff',
                backgroundImage: `
                  linear-gradient(90deg, transparent 79px, #fca5a5 80px, #fca5a5 81px, transparent 82px),
                  linear-gradient(#e2e8f0 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 32px',
                lineHeight: '32px',
                boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)'
              }}
              className="rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-300 select-text transition-all space-y-8"
            >
              {/* Punch Hole Rings on Left */}
              <div className="absolute left-4 top-12 bottom-12 flex flex-col justify-between pointer-events-none opacity-30">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-slate-900 shadow-inner border border-slate-400"></div>
                ))}
              </div>

              {/* Page Header (Date, Subject, Page No) */}
              <div className="pl-16 flex items-center justify-between border-b-2 border-rose-300 pb-2 text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-4">
                  <span><strong>Subject / विषय:</strong> {result.subject || 'General Studies'}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span><strong>Date / दिनांक:</strong> {new Date().toLocaleDateString('en-GB')}</span>
                  <span><strong>Page / पृष्ठ:</strong> 01</span>
                </div>
              </div>

              {/* Main Content Area (Indented past red margin) */}
              <div className="pl-16 space-y-8">
                
                {/* Chapter Title Banner */}
                <div className="text-center pb-2">
                  <h1 
                    style={{ color: headingColor }}
                    className="text-2xl sm:text-3xl font-bold tracking-wide uppercase inline-block border-b-2 border-rose-400 pb-1"
                  >
                    ★ {result.chapterTitle} ★
                  </h1>
                  {result.keyTakeaway && (
                    <p className="text-lg italic mt-2 opacity-90 text-slate-700">
                      "{result.keyTakeaway}"
                    </p>
                  )}
                </div>

                {/* ─── SECTION 1: CORE THEORY & HANDWRITTEN NOTES ─── */}
                {Array.isArray(result.handwrittenNotes) && result.handwrittenNotes.map((sec, idx) => (
                  <div key={idx} className="space-y-2.5">
                    {/* Heading */}
                    <h2 
                      style={{ color: headingColor }}
                      className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                    >
                      <span className="underline">{sec?.heading || `Section ${idx + 1}`}</span>
                    </h2>

                    {/* Bullet Points */}
                    <ul className="space-y-1.5 text-lg sm:text-xl pl-4">
                      {Array.isArray(sec?.bulletPoints) ? (
                        sec.bulletPoints.map((pt, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2.5">
                            <span className="text-rose-500 font-bold">➤</span>
                            <span>{String(pt)}</span>
                          </li>
                        ))
                      ) : (
                        <li className="flex items-start gap-2.5">
                          <span className="text-rose-500 font-bold">➤</span>
                          <span>{String(sec?.bulletPoints || '')}</span>
                        </li>
                      )}
                    </ul>

                    {/* Highlighted Exam Fact Box */}
                    {sec?.highlightNote && (
                      <div 
                        style={{ backgroundColor: highlightBg }}
                        className="p-3 rounded-lg border-l-4 border-amber-500 text-slate-900 font-bold text-base sm:text-lg shadow-xs my-2"
                      >
                        📌 {sec.highlightNote}
                      </div>
                    )}
                  </div>
                ))}

                {/* ─── SECTION 2: HAND-DRAWN CONCEPT DIAGRAM & FLOWCHART BOX ─── */}
                {result.diagram && Array.isArray(result.diagram.steps) && result.diagram.steps.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 
                      style={{ color: headingColor }}
                      className="text-xl sm:text-2xl font-bold flex items-center gap-2 border-b border-rose-300 pb-1"
                    >
                      <span>📐 {result.diagram.title || 'Concept Diagram & Process Flow / संकल्पना आरेख'}</span>
                    </h2>

                    {/* Hand-Drawn Flowchart Box */}
                    <div className="p-5 rounded-2xl border-2 border-dashed border-slate-400 bg-slate-50/80 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {result.diagram.steps.map((step, sIdx) => (
                          <div 
                            key={sIdx}
                            className="p-3.5 rounded-xl border-2 border-slate-400 bg-white shadow-xs space-y-1 relative"
                          >
                            <div className="flex items-center justify-between text-sm font-bold text-rose-600">
                              <span>[Stage {sIdx + 1}]</span>
                              <span className="text-xs bg-amber-100 px-2 py-0.5 rounded text-slate-800 font-mono">Step {sIdx + 1}</span>
                            </div>
                            <div className="font-bold text-base text-slate-900">{step?.step}</div>
                            <div className="text-sm text-slate-700 leading-snug">{step?.detail}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-center text-xs text-slate-500 italic">
                        (Figure 1.1: Step-by-step Conceptual Architecture & Mechanism)
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── SECTION 3: EXPECTED EXAM QUESTIONS (2 & 5 MARKS) ─── */}
                {Array.isArray(result.examQuestions) && result.examQuestions.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 
                      style={{ color: headingColor }}
                      className="text-xl sm:text-2xl font-bold flex items-center gap-2 border-b border-rose-300 pb-1"
                    >
                      <span>✍️ Important Exam Questions & Answers / महत्वपूर्ण प्रश्नोत्तर</span>
                    </h2>

                    <div className="space-y-4">
                      {result.examQuestions.map((q, qIdx) => (
                        <div key={qIdx} className="p-4 rounded-xl border border-slate-300 bg-slate-50/50 space-y-1.5">
                          <div className="flex items-start justify-between gap-2 font-bold text-base sm:text-lg">
                            <span style={{ color: headingColor }}>Q{qIdx + 1}. {q?.question}</span>
                            <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full shrink-0 font-sans">
                              [{q?.marks || 2} Marks]
                            </span>
                          </div>
                          <div className="text-base sm:text-lg text-slate-800 pl-4 border-l-2 border-rose-300">
                            <strong>Ans:</strong> {q?.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── SECTION 4: PRACTICE MCQS WITH HANDWRITTEN CHECKBOXES ─── */}
                {Array.isArray(result.mcqs) && result.mcqs.length > 0 && (
                  <div className="space-y-4 pt-4">
                    <h2 
                      style={{ color: headingColor }}
                      className="text-xl sm:text-2xl font-bold flex items-center gap-2 border-b border-rose-300 pb-1"
                    >
                      <span>🎯 Practice MCQs & Key / वस्तुनिष्ठ प्रश्न</span>
                    </h2>

                    <div className="space-y-3">
                      {result.mcqs.map((mcq, mIdx) => (
                        <div key={mIdx} className="space-y-1 text-base sm:text-lg">
                          <div className="font-bold">
                            {mIdx + 1}. {mcq?.question}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pl-4 text-base">
                            {Array.isArray(mcq?.options) && mcq.options.map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center gap-2">
                                <span className="font-bold font-mono">({String.fromCharCode(65 + oIdx)})</span>
                                <span>{String(opt)}</span>
                                {oIdx === mcq.correctIndex && (
                                  <span className="text-emerald-700 font-bold text-xs bg-emerald-100 px-1.5 rounded">✓ Ans</span>
                                )}
                              </div>
                            ))}
                          </div>
                          {mcq?.explanation && (
                            <div className="text-sm text-slate-600 pl-4 italic">
                              💡 {mcq.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Signature & Verification Stamp */}
                <div className="pt-8 border-t-2 border-rose-300 flex items-center justify-between text-sm font-semibold text-slate-700">
                  <span>Verified Assignment & Notes</span>
                  <span>Teacher's Signature / हस्ताक्षर: _____________</span>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
