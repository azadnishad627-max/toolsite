import React, { useState, useRef } from 'react';
import { 
  BookOpen, Sparkles, PenTool, Brain, HelpCircle, FileText, Download, 
  Printer, CheckCircle2, XCircle, ChevronRight, Layers, GraduationCap, 
  RotateCcw, Copy, Check, Share2, Award, Zap, ArrowRight, Eye, ShieldCheck,
  RefreshCw, FileCheck, Lightbulb, AlertTriangle, Languages, CheckCheck,
  Maximize, FileSpreadsheet, Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../3d/TiltCard';

// Quick Preset topics for 1-click test
const QUICK_TOPICS = [
  {
    title: "प्रकाश संश्लेषण एवं प्रकाश अभिक्रियाएँ (Photosynthesis)",
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
  const [language, setLanguage] = useState('English'); // 'English' | 'Hindi' | 'Hinglish'
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('Analyzing chapter topic...');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Active View Tab
  const [activeTab, setActiveTab] = useState('handwritten'); // 'handwritten' | 'diagram' | 'quiz' | 'questions'

  // Handwritten Notebook Styling Controls
  const [handwritingFont, setHandwritingFont] = useState("'Kalam', cursive");
  const [inkColor, setInkColor] = useState('#1e3a8a'); // Royal Blue Ink
  const [headingColor, setHeadingColor] = useState('#991b1b'); // Dark Crimson
  const [highlightBg, setHighlightBg] = useState('#fef08a'); // Pastel Yellow
  const [copiedSection, setCopiedSection] = useState(null);

  // MCQ Quiz State
  const [userAnswers, setUserAnswers] = useState({});
  const [showExplanations, setShowExplanations] = useState({});

  const printAreaRef = useRef(null);

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
    setShowExplanations({});
    setLoadingStep('Connecting to NVIDIA AI Vision & Reasoning Engine...');

    const stepTimer1 = setTimeout(() => setLoadingStep('Drafting Detailed Handwritten Notes in selected language...'), 2000);
    const stepTimer2 = setTimeout(() => setLoadingStep('Constructing Visual Concept Flowcharts & Diagrams...'), 5000);
    const stepTimer3 = setTimeout(() => setLoadingStep('Designing 5 High-Yield MCQs & 2/5-Mark Exam Questions...'), 7500);

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
        setActiveTab('handwritten');
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

  const handleQuizSelect = (qIdx, optIdx) => {
    if (userAnswers[qIdx] !== undefined) return;
    setUserAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
    setShowExplanations(prev => ({ ...prev, [qIdx]: true }));
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Safe Score calculation
  const mcqList = Array.isArray(result?.mcqs) ? result.mcqs : [];
  const score = mcqList.reduce((acc, mcq, qIdx) => {
    return userAnswers[qIdx] === mcq?.correctIndex ? acc + 1 : acc;
  }, 0);

  // Safe Notes Copy String
  const getNotesCopyText = () => {
    if (!result || !Array.isArray(result.handwrittenNotes)) return '';
    return result.handwrittenNotes.map(n => {
      const pts = Array.isArray(n?.bulletPoints) ? n.bulletPoints.join('\n') : '';
      return `${n?.heading || ''}\n${pts}\n${n?.highlightNote || ''}`;
    }).join('\n\n');
  };

  return (
    <div className="space-y-8">
      {/* Print Stylesheet for Pristine A4 Paper Output */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #a4-print-notebook, #a4-print-notebook * {
            visibility: visible;
          }
          #a4-print-notebook {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: none !important;
            padding: 20mm !important;
            margin: 0 !important;
            background: #ffffff !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <TiltCard glowColor="purple" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs tracking-wider uppercase">
              <Sparkles className="w-4 h-4" /> Powered by NVIDIA NIM Llama 3.2 AI
            </div>
            <h2 className="font-['Space_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">
              AI Study Notes & Exam Master
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Generate <strong>A4 Handwritten Notebook Assignment Notes, Visual Concept Flowcharts, Interactive MCQs & 2/5-Mark Exam Questions</strong> — in pure Hindi, English, or Hinglish!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-cyan-400" />
              <span>Hindi / English / Hinglish</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>A4 Print Ready</span>
            </div>
          </div>
        </div>
      </TiltCard>

      {/* Input / Topic Generator Workbench */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
        <div className="space-y-4">
          
          {/* Row 1: Topic + Grade + Language Selector */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Topic Input */}
            <div className="md:col-span-6 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Chapter Name / Topic:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. प्रकाश संश्लेषण (Photosynthesis), Newton's Laws, French Revolution..."
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Language Selector */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-amber-400" /> Notes Language:
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                <option value="English">🇬🇧 English (Standard Academic)</option>
                <option value="Hindi">🇮🇳 हिन्दी (Pure Hindi Notes)</option>
                <option value="Hinglish">🇮🇳 Hinglish (Easy Mixed Hindi+Eng)</option>
              </select>
            </div>

            {/* Class / Grade Level */}
            <div className="md:col-span-3 space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Grade / Target Exam:</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-3 rounded-xl bg-slate-950 border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Class 9-10">Class 9 - 10 (Secondary)</option>
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
              <span>Paste Chapter Notes, Textbook Page or Syllabus Text (Optional):</span>
              <span className="text-[11px] text-slate-500">Leave blank for automatic topic-based generation</span>
            </label>
            <textarea
              rows={2}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Book ke kisi page ka text ya extra points yahan paste kar sakte hain..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
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
                  <span>{q.icon}</span> <span>{q.title.split(' ')[0]}</span> <span className="text-[10px] opacity-60">({q.lang})</span>
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
                  Generate A4 Notes & Quiz
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
                  transition={{ duration: 12, ease: "linear" }}
                />
              </div>
              <p className="text-xs text-slate-400">NVIDIA Neural Engine is structuring high-yield exam points, diagrams & questions in {language}...</p>
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

      {/* Generated Study Materials Studio */}
      {result && !isLoading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-white/10">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveTab('handwritten')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'handwritten'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PenTool className="w-4 h-4" /> 📝 A4 Handwritten Assignment
              </button>

              <button
                onClick={() => setActiveTab('diagram')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'diagram'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4" /> 📊 Concept Diagram
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'quiz'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> 🎯 MCQ Quiz ({mcqList.length})
              </button>

              <button
                onClick={() => setActiveTab('questions')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  activeTab === 'questions'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-neon-indigo'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Award className="w-4 h-4" /> 📋 2/5-Mark Exam Questions
              </button>
            </div>

            <div className="flex items-center gap-2 px-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" /> 🖨️ Print / Save A4 PDF
              </button>
            </div>
          </div>

          {/* ─── TAB 1: REALISTIC A4 HANDWRITTEN RULED NOTEBOOK ─── */}
          {activeTab === 'handwritten' && (
            <div className="space-y-4">
              {/* Notebook Toolbar Controls */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  {/* Font picker */}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Handwriting Style:</span>
                    <select
                      value={handwritingFont}
                      onChange={(e) => setHandwritingFont(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-white text-xs font-semibold"
                    >
                      <option value="'Kalam', cursive">Kalam (Hindi & English Student Pen)</option>
                      <option value="'Mukta', sans-serif">Mukta (Clean Devanagari / Print)</option>
                      <option value="'Caveat', cursive">Caveat (Cursive Flow)</option>
                      <option value="'Patrick Hand', cursive">Patrick Hand (Neat Ballpoint)</option>
                      <option value="'Indie Flower', cursive">Indie Flower (Casual)</option>
                    </select>
                  </div>

                  {/* Ink color picker */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Pen Ink:</span>
                    {[
                      { label: 'Royal Blue (Ballpoint)', color: '#1e3a8a' },
                      { label: 'Gel Pen Indigo', color: '#312e81' },
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

                  {/* Heading highlight color */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Heading Pen:</span>
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

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    📄 A4 Proportions: 794×1123px
                  </span>
                  <button
                    onClick={() => copyToClipboard(getNotesCopyText(), 'all-notes')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 border border-white/10"
                  >
                    {copiedSection === 'all-notes' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSection === 'all-notes' ? 'Copied!' : 'Copy Text'}
                  </button>
                </div>
              </div>

              {/* 📖 The Realistic A4 Ruled Paper Notebook Canvas */}
              <div className="flex justify-center overflow-x-auto py-2">
                <div 
                  id="a4-print-notebook"
                  ref={printAreaRef}
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
                  className="rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-slate-300 select-text transition-all"
                >
                  {/* Punch Hole Rings on Left */}
                  <div className="absolute left-4 top-12 bottom-12 flex flex-col justify-between pointer-events-none opacity-30">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="w-4 h-4 rounded-full bg-slate-900 shadow-inner border border-slate-400"></div>
                    ))}
                  </div>

                  {/* Page Header (Date, Subject, Page No) */}
                  <div className="pl-16 flex items-center justify-between border-b-2 border-rose-300 pb-2 mb-6 text-sm font-semibold text-slate-800">
                    <div className="flex items-center gap-4">
                      <span><strong>Subject / विषय:</strong> {result.subject || 'General Studies'}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <span><strong>Date / दिनांक:</strong> {new Date().toLocaleDateString('en-GB')}</span>
                      <span><strong>Page / पृष्ठ:</strong> 01</span>
                    </div>
                  </div>

                  {/* Main Handwritten Content */}
                  <div className="pl-16 space-y-8">
                    {/* Chapter Big Title */}
                    <div className="text-center pb-4">
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

                    {/* Sections */}
                    {Array.isArray(result.handwrittenNotes) && result.handwrittenNotes.map((sec, idx) => (
                      <div key={idx} className="space-y-3">
                        {/* Heading */}
                        <h2 
                          style={{ color: headingColor }}
                          className="text-xl sm:text-2xl font-bold flex items-center gap-2"
                        >
                          <span className="underline">{sec?.heading || `Section ${idx + 1}`}</span>
                        </h2>

                        {/* Bullet Points */}
                        <ul className="space-y-2 text-lg sm:text-xl pl-4">
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

                    {/* Bottom Student Sign Box */}
                    <div className="pt-8 border-t border-rose-200 flex items-center justify-between text-xs text-slate-600">
                      <span>Verified Assignment Notes</span>
                      <span>Teacher's Sign / हस्ताक्षर: _____________</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── TAB 2: VISUAL CONCEPT FLOWCHART / DIAGRAM ─── */}
          {activeTab === 'diagram' && (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Visual Concept Architecture & Process Flow
                </div>
                <h3 className="text-xl font-bold text-white font-['Space_Grotesk']">
                  {result.diagram?.title || `${result.chapterTitle} — Concept Flowchart`}
                </h3>
              </div>

              {/* Graphical Process Timeline */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {Array.isArray(result.diagram?.steps) && result.diagram.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="p-5 rounded-2xl bg-slate-950 border border-indigo-500/20 relative space-y-3 hover:border-indigo-500/60 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold text-sm flex items-center justify-center shadow-md">
                        {idx + 1}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-cyan-300 border border-indigo-500/20">
                        Stage {idx + 1}
                      </span>
                    </div>

                    <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {step?.step || `Stage ${idx + 1}`}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step?.detail || ''}
                    </p>

                    {idx < (result.diagram.steps.length - 1) && (
                      <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-slate-900 border border-white/20 text-white text-xs flex items-center justify-center">
                        →
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── TAB 3: INTERACTIVE MCQ QUIZ ─── */}
          {activeTab === 'quiz' && (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" /> Practice Exam Quiz (MCQs)
                  </h3>
                  <p className="text-xs text-slate-400">Click any option to test your understanding in {language}</p>
                </div>

                {/* Score Pill */}
                <div className="px-5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-white text-xs font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Score: {score} / {mcqList.length}</span>
                </div>
              </div>

              {/* MCQs List */}
              <div className="space-y-6">
                {mcqList.map((mcq, qIdx) => {
                  const isAnswered = userAnswers[qIdx] !== undefined;
                  const selectedOpt = userAnswers[qIdx];
                  const isCorrect = selectedOpt === mcq?.correctIndex;
                  const options = Array.isArray(mcq?.options) ? mcq.options : [];

                  return (
                    <div key={qIdx} className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm font-bold text-white flex items-start gap-2">
                          <span className="text-cyan-400 font-mono">Q{qIdx + 1}.</span>
                          <span>{mcq?.question}</span>
                        </h4>

                        {isAnswered && (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0 ${
                            isCorrect ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {isCorrect ? '+1 Correct' : 'Incorrect'}
                          </span>
                        )}
                      </div>

                      {/* 4 Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {options.map((opt, optIdx) => {
                          let btnStyle = 'bg-slate-900 text-slate-300 border-white/10 hover:border-indigo-500/50';

                          if (isAnswered) {
                            if (optIdx === mcq.correctIndex) {
                              btnStyle = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60 font-bold';
                            } else if (optIdx === selectedOpt && !isCorrect) {
                              btnStyle = 'bg-rose-500/20 text-rose-300 border-rose-500/60 font-bold';
                            } else {
                              btnStyle = 'bg-slate-900/50 text-slate-500 border-white/5 opacity-50';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              disabled={isAnswered}
                              onClick={() => handleQuizSelect(qIdx, optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center gap-2.5 ${btnStyle}`}
                            >
                              <span className="w-5 h-5 rounded-md bg-white/10 text-white font-mono text-[10px] flex items-center justify-center shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span>{String(opt)}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation Reveal */}
                      {showExplanations[qIdx] && mcq?.explanation && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 space-y-1">
                          <strong className="text-cyan-300 block flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Explanation / व्याख्या:
                          </strong>
                          <p>{mcq.explanation}</p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── TAB 4: 2-MARK & 5-MARK EXAM QUESTIONS ─── */}
          {activeTab === 'questions' && (
            <div className="p-6 md:p-8 rounded-3xl bg-slate-900/80 border border-white/10 space-y-6">
              <div className="space-y-1 pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" /> Most Expected Board / Exam Questions (महत्वपूर्ण प्रश्न)
                </h3>
                <p className="text-xs text-slate-400">High-yield short (2-mark) and long (5-mark) questions with ideal model answers</p>
              </div>

              <div className="space-y-4">
                {Array.isArray(result.examQuestions) && result.examQuestions.map((q, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm font-bold text-white flex items-start gap-2">
                        <span className="text-cyan-400 font-mono">Q{idx + 1}.</span>
                        <span>{q?.question}</span>
                      </h4>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                        q?.marks === 5 ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}>
                        {q?.marks || 2} Marks
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-white/5 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                      <strong className="text-emerald-400 block mb-1">Model Answer / आदर्श उत्तर:</strong>
                      {q?.answer}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
