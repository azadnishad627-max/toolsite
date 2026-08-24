import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Upload, Plus, Trash2, 
  Palette, LayoutTemplate, Briefcase, GraduationCap, User, Wrench
} from 'lucide-react';
import { TemplateModern, TemplateProfessional, TemplateCreative } from './ResumeTemplates';

const THEME_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#f59e0b', '#0f172a', '#0ea5e9'];
const TEMPLATES = [
  { id: 'modern', name: 'Modern Split', component: TemplateModern },
  { id: 'professional', name: 'Classic Pro', component: TemplateProfessional },
  { id: 'creative', name: 'Creative Bold', component: TemplateCreative },
];

export default function ResumeBuilder() {
  const [data, setData] = useState({
    personal: { name: '', jobTitle: '', email: '', phone: '', location: '', summary: '', photo: '' },
    experience: [],
    education: [],
    skills: [],
    themeColor: '#3b82f6',
    templateId: 'modern'
  });

  const [activeSection, setActiveSection] = useState('personal');
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `${data.personal.name || 'Resume'}_CV`,
  });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updatePersonal('photo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const updatePersonal = (field, value) => {
    setData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experience: [...prev.experience, { id: Date.now(), company: '', position: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, { id: Date.now(), institution: '', degree: '', year: '', score: '' }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const updateSkills = (e) => {
    const val = e.target.value;
    const skillsList = val.split(',').map(s => s.trim()).filter(Boolean);
    setData(prev => ({ ...prev, skills: skillsList }));
  };

  const SelectedTemplate = TEMPLATES.find(t => t.id === data.templateId)?.component || TemplateModern;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-blue-400" />
          Pro Resume Builder
        </h2>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Create ATS-friendly, beautiful PDF resumes. Data stays 100% in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANE - FORM */}
        <div className="lg:col-span-5 h-[80vh] overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
          
          {/* Design Controls */}
          <div className="bg-[#0f1423] p-5 rounded-2xl border border-white/10 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2 uppercase tracking-widest border-b border-white/5 pb-2">
              <Palette className="w-4 h-4 text-pink-400" /> Style & Theme
            </h3>
            
            <div>
              <label className="text-xs text-slate-400 mb-2 block">Template Style</label>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setData(prev => ({ ...prev, templateId: t.id }))}
                    className={`py-2 px-1 text-xs font-medium rounded-lg border transition-all ${
                      data.templateId === t.id 
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300' 
                        : 'border-white/10 hover:border-white/30 text-slate-400 hover:bg-white/5'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 mb-2 block">Theme Color</label>
              <div className="flex gap-2 flex-wrap">
                {THEME_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setData(prev => ({ ...prev, themeColor: color }))}
                    className={`w-8 h-8 rounded-full shadow-lg transition-transform ${data.themeColor === color ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0f1423]' : 'hover:scale-110'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
                <div className="relative">
                  <input 
                    type="color" 
                    value={data.themeColor} 
                    onChange={(e) => setData(prev => ({ ...prev, themeColor: e.target.value }))}
                    className="w-8 h-8 opacity-0 absolute inset-0 cursor-pointer"
                  />
                  <div className="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors">
                    <Plus className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Sections */}
          <div className="space-y-4">
            
            {/* Personal Info */}
            <div className="bg-[#0f1423] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <button onClick={() => setActiveSection('personal')} className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><User className="w-4 h-4 text-blue-400" /> Personal Info</h3>
              </button>
              <AnimatePresence>
                {activeSection === 'personal' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 pb-4 space-y-3">
                    <div className="flex gap-4 items-center">
                      <div className="relative w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0 group">
                        {data.personal.photo ? <img src={data.personal.photo} className="w-full h-full object-cover" /> : <User className="text-slate-500" />}
                        <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                          <Upload className="w-4 h-4 text-white" />
                          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>
                      </div>
                      <div className="flex-1 space-y-2">
                        <input type="text" placeholder="Full Name" value={data.personal.name} onChange={e => updatePersonal('name', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                        <input type="text" placeholder="Job Title (e.g. Frontend Developer)" value={data.personal.jobTitle} onChange={e => updatePersonal('jobTitle', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="email" placeholder="Email" value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                      <input type="text" placeholder="Phone" value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                    </div>
                    <input type="text" placeholder="Location (City, Country)" value={data.personal.location} onChange={e => updatePersonal('location', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
                    <textarea placeholder="Professional Summary" value={data.personal.summary} onChange={e => updatePersonal('summary', e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[80px]" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Experience */}
            <div className="bg-[#0f1423] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <button onClick={() => setActiveSection('experience')} className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Briefcase className="w-4 h-4 text-emerald-400" /> Work Experience</h3>
              </button>
              <AnimatePresence>
                {activeSection === 'experience' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 pb-4 space-y-4">
                    {data.experience.map((exp, index) => (
                      <div key={exp.id} className="relative p-3 bg-slate-900 border border-white/5 rounded-xl space-y-3">
                        <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        <div className="grid grid-cols-2 gap-3 pr-8">
                          <input type="text" placeholder="Job Title" value={exp.position} onChange={e => updateExperience(exp.id, 'position', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                          <input type="text" placeholder="Company" value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Start (e.g. Jan 2020)" value={exp.startDate} onChange={e => updateExperience(exp.id, 'startDate', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                          <input type="text" placeholder="End (e.g. Present)" value={exp.endDate} onChange={e => updateExperience(exp.id, 'endDate', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                        </div>
                        <textarea placeholder="Job Description (Use enters for bullets)" value={exp.description} onChange={e => updateExperience(exp.id, 'description', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white min-h-[60px]" />
                      </div>
                    ))}
                    <button onClick={addExperience} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/40 flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Add Experience
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Education */}
            <div className="bg-[#0f1423] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <button onClick={() => setActiveSection('education')} className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><GraduationCap className="w-4 h-4 text-purple-400" /> Education</h3>
              </button>
              <AnimatePresence>
                {activeSection === 'education' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 pb-4 space-y-4">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="relative p-3 bg-slate-900 border border-white/5 rounded-xl space-y-3">
                        <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        <input type="text" placeholder="Degree / Course" value={edu.degree} onChange={e => updateEducation(edu.id, 'degree', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white pr-8" />
                        <input type="text" placeholder="University / School" value={edu.institution} onChange={e => updateEducation(edu.id, 'institution', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Year" value={edu.year} onChange={e => updateEducation(edu.id, 'year', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                          <input type="text" placeholder="Score / CGPA" value={edu.score} onChange={e => updateEducation(edu.id, 'score', e.target.value)} className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white" />
                        </div>
                      </div>
                    ))}
                    <button onClick={addEducation} className="w-full py-2 border border-dashed border-white/20 rounded-xl text-xs text-slate-400 hover:text-white hover:border-white/40 flex items-center justify-center gap-1">
                      <Plus className="w-3 h-3" /> Add Education
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skills */}
            <div className="bg-[#0f1423] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <button onClick={() => setActiveSection('skills')} className="w-full p-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2"><Wrench className="w-4 h-4 text-orange-400" /> Skills</h3>
              </button>
              <AnimatePresence>
                {activeSection === 'skills' && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="px-4 pb-4">
                    <p className="text-xs text-slate-500 mb-2">Comma separated skills</p>
                    <textarea 
                      placeholder="e.g. JavaScript, React, Node.js, Project Management" 
                      value={data.skills.join(', ')} 
                      onChange={updateSkills} 
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white min-h-[80px]" 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* RIGHT PANE - LIVE PREVIEW & EXPORT */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex justify-between items-center bg-[#0f1423] p-4 rounded-2xl border border-white/10 shadow-xl">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Preview
            </div>
            <button 
              onClick={handlePrint}
              className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-400 hover:to-blue-400 text-white rounded-xl text-sm font-bold shadow-lg flex items-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> Download PDF
            </button>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 overflow-x-auto shadow-2xl flex justify-center custom-scrollbar">
            {/* A4 Paper Wrapper for Print. Scale it down slightly for view if needed */}
            <div className="bg-white shadow-2xl overflow-hidden origin-top" style={{ width: '794px', minHeight: '1122px' }}>
              <div ref={printRef} className="w-full h-full">
                <SelectedTemplate data={data} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
