import React, { useEffect, useRef, useState } from 'react';

// A robust Editable component that prevents cursor jumping by managing local state 
// while typing, and only syncing up to the parent on blur.
const Editable = ({ as: Tag = 'div', value, onChange, className, style, placeholder = 'Type here...' }) => {
  const [innerValue, setInnerValue] = useState(value);
  const elementRef = useRef(null);

  // Sync from props when parent state changes (e.g., from the left form or local storage)
  useEffect(() => {
    if (elementRef.current && elementRef.current.innerText !== value && document.activeElement !== elementRef.current) {
      setInnerValue(value);
      elementRef.current.innerText = value || '';
    }
  }, [value]);

  const handleBlur = (e) => {
    const text = e.currentTarget.innerText;
    if (text !== value && onChange) {
      onChange(text);
    }
  };

  return (
    <Tag
      ref={elementRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onInput={(e) => setInnerValue(e.currentTarget.innerText)}
      className={`outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-400/50 focus:outline-dashed focus:outline-2 focus:outline-blue-400/50 cursor-text transition-all empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 ${className}`}
      style={style}
      data-placeholder={placeholder}
    >
      {innerValue}
    </Tag>
  );
};

// Helper for formatted multiline text (like experience descriptions)
// It uses a generic div with contentEditable that emits text with newlines.
const EditableTextarea = ({ value, onChange, className, style, placeholder = 'Type here...' }) => {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        if (onChange && e.currentTarget.innerText !== value) {
          onChange(e.currentTarget.innerText);
        }
      }}
      className={`outline-none hover:outline-dashed hover:outline-1 hover:outline-gray-400/50 focus:outline-dashed focus:outline-2 focus:outline-blue-400/50 cursor-text transition-all whitespace-pre-wrap empty:before:content-[attr(data-placeholder)] empty:before:opacity-40 ${className}`}
      style={style}
      data-placeholder={placeholder}
      dangerouslySetInnerHTML={{ __html: (value || '').replace(/\n/g, '<br>') }}
    />
  );
};

/* =========================================================
   TEMPLATE 1: MODERN SPLIT
========================================================= */
export const TemplateModern = ({ data, onChangePersonal, onChangeExperience, onChangeEducation }) => {
  const { personal, experience, education, skills, themeColor } = data;
  
  return (
    <div className="w-full h-full flex bg-white text-slate-800 font-sans" style={{ minHeight: '1122px' }}>
      {/* Left Sidebar */}
      <div className="w-1/3 text-white p-8" style={{ backgroundColor: themeColor }}>
        {personal.photo && (
          <div className="flex justify-center mb-6">
            <img src={personal.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white/20" />
          </div>
        )}
        <Editable as="h1" value={personal.name} onChange={(v) => onChangePersonal('name', v)} className="text-3xl font-bold mb-2 tracking-tight" placeholder="Your Name" />
        <Editable as="h2" value={personal.jobTitle} onChange={(v) => onChangePersonal('jobTitle', v)} className="text-lg text-white/80 font-medium mb-8" placeholder="Professional Title" />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Contact</h3>
            <div className="text-sm space-y-2 text-white/90 break-all">
              <Editable value={personal.email} onChange={(v) => onChangePersonal('email', v)} placeholder="Email" />
              <Editable value={personal.phone} onChange={(v) => onChangePersonal('phone', v)} placeholder="Phone" className="break-words" />
              <Editable value={personal.location} onChange={(v) => onChangePersonal('location', v)} placeholder="Location" className="break-words" />
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-8">
        <div className="mb-8">
          <h3 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Profile</h3>
          <EditableTextarea value={personal.summary} onChange={(v) => onChangePersonal('summary', v)} className="text-sm text-gray-600 leading-relaxed min-h-[40px]" placeholder="Write a short professional summary here..." />
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold border-b-2 mb-4 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Experience</h3>
          <div className="space-y-5">
            {experience.map((exp, i) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1 gap-4">
                  <Editable as="h4" value={exp.position} onChange={(v) => onChangeExperience(exp.id, 'position', v)} className="font-bold text-gray-800 flex-1" placeholder="Job Title" />
                  <div className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600 shrink-0 flex gap-1 items-center">
                    <Editable as="span" value={exp.startDate} onChange={(v) => onChangeExperience(exp.id, 'startDate', v)} placeholder="Start" />
                    -
                    <Editable as="span" value={exp.endDate} onChange={(v) => onChangeExperience(exp.id, 'endDate', v)} placeholder="End" />
                  </div>
                </div>
                <Editable value={exp.company} onChange={(v) => onChangeExperience(exp.id, 'company', v)} className="text-sm font-medium" style={{ color: themeColor }} placeholder="Company Name" />
                <EditableTextarea value={exp.description} onChange={(v) => onChangeExperience(exp.id, 'description', v)} className="text-sm text-gray-600 mt-2 leading-relaxed min-h-[40px]" placeholder="Describe your responsibilities..." />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold border-b-2 mb-4 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Education</h3>
          <div className="space-y-4">
            {education.map((edu, i) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1 gap-4">
                  <Editable as="h4" value={edu.degree} onChange={(v) => onChangeEducation(edu.id, 'degree', v)} className="font-bold text-gray-800 flex-1" placeholder="Degree / Course" />
                  <Editable as="span" value={edu.year} onChange={(v) => onChangeEducation(edu.id, 'year', v)} className="text-xs text-gray-500 font-medium shrink-0" placeholder="Year" />
                </div>
                <Editable value={edu.institution} onChange={(v) => onChangeEducation(edu.id, 'institution', v)} className="text-sm font-medium" style={{ color: themeColor }} placeholder="Institution Name" />
                <div className="flex gap-1 text-sm text-gray-600 mt-1">
                  <span>Score:</span>
                  <Editable as="span" value={edu.score} onChange={(v) => onChangeEducation(edu.id, 'score', v)} placeholder="e.g. 85%" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE 2: CLASSIC PRO
========================================================= */
export const TemplateProfessional = ({ data, onChangePersonal, onChangeExperience, onChangeEducation }) => {
  const { personal, experience, education, skills, themeColor } = data;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-serif p-10" style={{ minHeight: '1122px' }}>
      <div className="text-center border-b-4 pb-6 mb-6" style={{ borderColor: themeColor }}>
        {personal.photo && (
          <img src={personal.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
        )}
        <Editable as="h1" value={personal.name} onChange={(v) => onChangePersonal('name', v)} className="text-4xl font-bold uppercase tracking-widest text-gray-900 mb-2" style={{ color: themeColor }} placeholder="Your Name" />
        <Editable as="h2" value={personal.jobTitle} onChange={(v) => onChangePersonal('jobTitle', v)} className="text-xl text-gray-600 mb-3" placeholder="Professional Title" />
        <div className="text-sm text-gray-500 flex justify-center flex-wrap gap-4 break-all">
          <Editable as="span" value={personal.email} onChange={(v) => onChangePersonal('email', v)} placeholder="Email" />
          <span>•</span>
          <Editable as="span" value={personal.phone} onChange={(v) => onChangePersonal('phone', v)} placeholder="Phone" className="break-words" />
          <span>•</span>
          <Editable as="span" value={personal.location} onChange={(v) => onChangePersonal('location', v)} placeholder="Location" className="break-words" />
        </div>
      </div>

      <div className="mb-6 text-center">
        <EditableTextarea value={personal.summary} onChange={(v) => onChangePersonal('summary', v)} className="text-sm text-gray-700 leading-relaxed italic min-h-[40px] inline-block w-full text-center" placeholder="Write a brief professional summary here..." />
      </div>

      <div className="flex gap-8">
        <div className="w-2/3">
          <h3 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: themeColor }}>Experience</h3>
          <div className="space-y-6">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1 gap-2">
                  <Editable as="h4" value={exp.position} onChange={(v) => onChangeExperience(exp.id, 'position', v)} className="font-bold text-gray-900 text-lg flex-1" placeholder="Job Title" />
                  <div className="text-sm font-semibold text-gray-500 flex gap-1 shrink-0">
                    <Editable as="span" value={exp.startDate} onChange={(v) => onChangeExperience(exp.id, 'startDate', v)} placeholder="Start" /> - <Editable as="span" value={exp.endDate} onChange={(v) => onChangeExperience(exp.id, 'endDate', v)} placeholder="End" />
                  </div>
                </div>
                <Editable value={exp.company} onChange={(v) => onChangeExperience(exp.id, 'company', v)} className="text-sm font-bold text-gray-600 italic mb-2" placeholder="Company Name" />
                <EditableTextarea value={exp.description} onChange={(v) => onChangeExperience(exp.id, 'description', v)} className="text-sm text-gray-700 leading-relaxed min-h-[40px]" placeholder="Job details..." />
              </div>
            ))}
          </div>
        </div>

        <div className="w-1/3">
          <h3 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: themeColor }}>Education</h3>
          <div className="space-y-5 mb-8">
            {education.map((edu) => (
              <div key={edu.id}>
                <Editable as="h4" value={edu.degree} onChange={(v) => onChangeEducation(edu.id, 'degree', v)} className="font-bold text-gray-900" placeholder="Degree" />
                <Editable value={edu.institution} onChange={(v) => onChangeEducation(edu.id, 'institution', v)} className="text-sm text-gray-600 italic" placeholder="Institution" />
                <Editable value={edu.year} onChange={(v) => onChangeEducation(edu.id, 'year', v)} className="text-sm text-gray-500 mt-1" placeholder="Year" />
                <div className="flex gap-1 text-sm text-gray-700 mt-1">
                  <span>Score:</span> <Editable as="span" value={edu.score} onChange={(v) => onChangeEducation(edu.id, 'score', v)} placeholder="GPA" />
                </div>
              </div>
            ))}
          </div>

          {skills.length > 0 && (
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: themeColor }}>Skills</h3>
              <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                {skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE 3: CREATIVE BOLD
========================================================= */
export const TemplateCreative = ({ data, onChangePersonal, onChangeExperience, onChangeEducation }) => {
  const { personal, experience, education, skills, themeColor } = data;

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 font-sans" style={{ minHeight: '1122px' }}>
      <div className="p-10 text-white flex items-center gap-8 rounded-br-[80px]" style={{ backgroundColor: themeColor }}>
        {personal.photo && (
          <img src={personal.photo} alt="Profile" className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
        )}
        <div className="flex-1">
          <Editable as="h1" value={personal.name} onChange={(v) => onChangePersonal('name', v)} className="text-4xl font-extrabold tracking-tight mb-2" placeholder="Your Name" />
          <Editable as="h2" value={personal.jobTitle} onChange={(v) => onChangePersonal('jobTitle', v)} className="text-xl font-medium text-white/90 mb-4" placeholder="Professional Title" />
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80 break-words">
            <span className="flex items-center gap-1">📍 <Editable value={personal.location} onChange={(v) => onChangePersonal('location', v)} placeholder="Location" /></span>
            <span className="flex items-center gap-1 break-all">✉️ <Editable value={personal.email} onChange={(v) => onChangePersonal('email', v)} placeholder="Email" /></span>
            <span className="flex items-center gap-1">📞 <Editable value={personal.phone} onChange={(v) => onChangePersonal('phone', v)} placeholder="Phone" /></span>
          </div>
        </div>
      </div>

      <div className="p-10 grid grid-cols-12 gap-8">
        <div className="col-span-4 space-y-8">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>About Me</h3>
            <EditableTextarea value={personal.summary} onChange={(v) => onChangePersonal('summary', v)} className="text-sm text-gray-600 leading-relaxed min-h-[60px]" placeholder="Professional summary..." />
          </div>
          
          {skills.length > 0 && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="col-span-8 space-y-8">
          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: themeColor }}>
              <span className="w-8 h-8 rounded-lg bg-current flex items-center justify-center text-white text-sm">💼</span>
              Experience
            </h3>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {experience.map((exp) => (
                <div key={exp.id} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <span className="absolute top-6 -left-3 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: themeColor }}></span>
                  <div className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-flex text-white gap-1" style={{ backgroundColor: themeColor }}>
                    <Editable as="span" value={exp.startDate} onChange={(v) => onChangeExperience(exp.id, 'startDate', v)} placeholder="Start" /> - <Editable as="span" value={exp.endDate} onChange={(v) => onChangeExperience(exp.id, 'endDate', v)} placeholder="End" />
                  </div>
                  <Editable as="h4" value={exp.position} onChange={(v) => onChangeExperience(exp.id, 'position', v)} className="font-bold text-xl text-gray-900" placeholder="Job Title" />
                  <Editable value={exp.company} onChange={(v) => onChangeExperience(exp.id, 'company', v)} className="text-sm font-medium text-gray-500 mb-3" placeholder="Company Name" />
                  <EditableTextarea value={exp.description} onChange={(v) => onChangeExperience(exp.id, 'description', v)} className="text-sm text-gray-600 leading-relaxed min-h-[40px]" placeholder="Job description..." />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: themeColor }}>
              <span className="w-8 h-8 rounded-lg bg-current flex items-center justify-center text-white text-sm">🎓</span>
              Education
            </h3>
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4" style={{ borderLeftColor: themeColor }}>
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <Editable as="h4" value={edu.degree} onChange={(v) => onChangeEducation(edu.id, 'degree', v)} className="font-bold text-lg text-gray-900 flex-1" placeholder="Degree" />
                    <Editable as="span" value={edu.year} onChange={(v) => onChangeEducation(edu.id, 'year', v)} className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded shrink-0" placeholder="Year" />
                  </div>
                  <Editable value={edu.institution} onChange={(v) => onChangeEducation(edu.id, 'institution', v)} className="text-sm font-medium text-gray-600" placeholder="Institution" />
                  <div className="flex gap-1 text-sm text-gray-500 mt-2">
                    <span>Score:</span>
                    <Editable as="span" value={edu.score} onChange={(v) => onChangeEducation(edu.id, 'score', v)} className="font-semibold text-gray-700" placeholder="GPA/Score" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE 4: CANVA DARK SIDEBAR
========================================================= */
export const TemplateCanvaDark = ({ data, onChangePersonal, onChangeExperience, onChangeEducation }) => {
  const { personal, experience, education, skills, themeColor } = data;
  
  return (
    <div className="w-full h-full flex bg-white text-gray-800 font-sans" style={{ minHeight: '1122px' }}>
      <div className="w-[35%] bg-[#1a1a1a] text-white p-8 border-r-8" style={{ borderRightColor: themeColor }}>
        {personal.photo && (
          <div className="flex justify-center mb-10 mt-4">
            <img src={personal.photo} alt="Profile" className="w-40 h-40 rounded-full object-cover border-2 border-white" />
          </div>
        )}
        
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-2">Contact</h3>
            <div className="text-xs space-y-3 text-white/90 break-all">
              <div className="flex flex-col"><strong className="block text-white mb-0.5">Phone</strong><Editable value={personal.phone} onChange={(v) => onChangePersonal('phone', v)} placeholder="Phone" className="break-words" /></div>
              <div className="flex flex-col"><strong className="block text-white mb-0.5">Email</strong><Editable value={personal.email} onChange={(v) => onChangePersonal('email', v)} placeholder="Email" /></div>
              <div className="flex flex-col"><strong className="block text-white mb-0.5">Address</strong><Editable value={personal.location} onChange={(v) => onChangePersonal('location', v)} placeholder="Address" className="break-words" /></div>
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-2">Expertise</h3>
              <ul className="text-xs text-white/90 space-y-2 list-disc list-inside">
                {skills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="w-[65%] pt-12 pr-10 pb-10">
        <div className="p-8 -ml-8 mb-8 shadow-sm" style={{ backgroundColor: themeColor }}>
          <Editable as="h1" value={personal.name} onChange={(v) => onChangePersonal('name', v)} className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-1" placeholder="YOUR NAME" />
          <Editable as="h2" value={personal.jobTitle} onChange={(v) => onChangePersonal('jobTitle', v)} className="text-lg font-bold uppercase tracking-widest text-gray-800" placeholder="PROFESSIONAL TITLE" />
        </div>

        <EditableTextarea value={personal.summary} onChange={(v) => onChangePersonal('summary', v)} className="text-xs text-gray-700 leading-relaxed mb-8 ml-8 min-h-[40px]" placeholder="Professional summary here..." />

        <div className="ml-8 space-y-8">
          <h3 className="inline-block px-2 py-1 font-bold text-sm uppercase mb-4 text-gray-900" style={{ backgroundColor: themeColor + '80' }}>
            Work Experience
          </h3>
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <Editable as="h4" value={exp.position} onChange={(v) => onChangeExperience(exp.id, 'position', v)} className="font-bold text-sm text-gray-900" placeholder="Job Title" />
                <div className="text-xs text-gray-600 mb-2 font-medium flex gap-1 items-center">
                  <Editable as="span" value={exp.company} onChange={(v) => onChangeExperience(exp.id, 'company', v)} placeholder="Company" /> | 
                  <Editable as="span" value={exp.startDate} onChange={(v) => onChangeExperience(exp.id, 'startDate', v)} placeholder="Start" /> – 
                  <Editable as="span" value={exp.endDate} onChange={(v) => onChangeExperience(exp.id, 'endDate', v)} placeholder="End" />
                </div>
                <EditableTextarea value={exp.description} onChange={(v) => onChangeExperience(exp.id, 'description', v)} className="text-xs text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-200 min-h-[30px]" placeholder="Responsibilities..." />
              </div>
            ))}
          </div>

          <h3 className="inline-block px-2 py-1 font-bold text-sm uppercase mb-4 text-gray-900 mt-8" style={{ backgroundColor: themeColor + '80' }}>
            Education
          </h3>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id}>
                <Editable as="h4" value={edu.degree} onChange={(v) => onChangeEducation(edu.id, 'degree', v)} className="font-bold text-sm text-gray-900" placeholder="Degree" />
                <div className="text-xs text-gray-600 mb-1 font-medium flex gap-1 items-center">
                  <Editable as="span" value={edu.institution} onChange={(v) => onChangeEducation(edu.id, 'institution', v)} placeholder="Institution" /> | 
                  <Editable as="span" value={edu.year} onChange={(v) => onChangeEducation(edu.id, 'year', v)} placeholder="Year" />
                </div>
                <div className="flex gap-1 text-xs text-gray-700">
                  <span>GPA/Score:</span>
                  <Editable as="span" value={edu.score} onChange={(v) => onChangeEducation(edu.id, 'score', v)} placeholder="Score" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TEMPLATE 5: CANVA WAVE HEADER
========================================================= */
export const TemplateCanvaWave = ({ data, onChangePersonal, onChangeExperience, onChangeEducation }) => {
  const { personal, experience, education, skills, themeColor } = data;
  
  return (
    <div className="w-full h-full relative bg-white text-gray-800 font-sans overflow-hidden" style={{ minHeight: '1122px' }}>
      <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '180px' }}>
        <path fill={themeColor} fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,154.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
      </svg>
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '140px' }}>
        <path fill={themeColor} fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,250.7C672,277,768,267,864,234.7C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      <div className="relative z-10 pt-10 px-12 flex items-center gap-8 mb-8">
        {personal.photo ? (
          <img src={personal.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/50 border-4 border-white shadow-lg flex items-center justify-center text-gray-500 font-bold">Photo</div>
        )}
        <div className="pt-8 flex-1">
          <Editable as="h1" value={personal.name} onChange={(v) => onChangePersonal('name', v)} className="text-4xl font-serif font-bold uppercase text-gray-800 tracking-wider" style={{ color: themeColor }} placeholder="Your Name" />
          <Editable as="h2" value={personal.jobTitle} onChange={(v) => onChangePersonal('jobTitle', v)} className="text-sm font-bold tracking-widest text-gray-600 uppercase mt-2" placeholder="Professional Title" />
        </div>
      </div>

      <div className="relative z-10 px-12 grid grid-cols-12 gap-10">
        <div className="col-span-5 space-y-6">
          <div>
            <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>About Me</h3>
            <EditableTextarea value={personal.summary} onChange={(v) => onChangePersonal('summary', v)} className="text-[11px] text-gray-700 leading-relaxed text-justify min-h-[40px]" placeholder="Summary..." />
          </div>

          <div>
            <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Contact</h3>
            <div className="text-[11px] text-gray-700 space-y-2 break-all">
              <div className="flex items-center gap-2 font-medium">📞 <Editable as="span" value={personal.phone} onChange={(v) => onChangePersonal('phone', v)} placeholder="Phone" className="break-words" /></div>
              <div className="flex items-center gap-2 font-medium">✉️ <Editable as="span" value={personal.email} onChange={(v) => onChangePersonal('email', v)} placeholder="Email" /></div>
              <div className="flex items-center gap-2 font-medium">📍 <Editable as="span" value={personal.location} onChange={(v) => onChangePersonal('location', v)} placeholder="Location" className="break-words" /></div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Education</h3>
            <div className="space-y-3 text-[11px] text-gray-700">
              {education.map((edu) => (
                <div key={edu.id}>
                  <Editable as="strong" value={edu.degree} onChange={(v) => onChangeEducation(edu.id, 'degree', v)} className="block text-gray-900 text-xs mb-0.5" placeholder="Degree" />
                  <Editable as="span" value={edu.institution} onChange={(v) => onChangeEducation(edu.id, 'institution', v)} className="block font-medium" placeholder="Institution" />
                  <Editable as="span" value={edu.year} onChange={(v) => onChangeEducation(edu.id, 'year', v)} className="block text-gray-500" placeholder="Year" />
                </div>
              ))}
            </div>
          </div>

          {skills.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Skills</h3>
              <ul className="text-[11px] text-gray-700 space-y-1 font-medium list-disc list-inside">
                {skills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div className="col-span-7 space-y-6">
          <div>
            <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-4 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Experience</h3>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <Editable as="h4" value={exp.position} onChange={(v) => onChangeExperience(exp.id, 'position', v)} className="font-bold text-sm text-gray-900" placeholder="Job Title" />
                  <div className="text-[11px] text-gray-600 font-semibold mb-2 flex gap-1 items-center">
                    <Editable as="span" value={exp.company} onChange={(v) => onChangeExperience(exp.id, 'company', v)} placeholder="Company" /> | 
                    <Editable as="span" value={exp.startDate} onChange={(v) => onChangeExperience(exp.id, 'startDate', v)} placeholder="Start" /> - 
                    <Editable as="span" value={exp.endDate} onChange={(v) => onChangeExperience(exp.id, 'endDate', v)} placeholder="End" />
                  </div>
                  <EditableTextarea value={exp.description} onChange={(v) => onChangeExperience(exp.id, 'description', v)} className="text-[11px] text-gray-700 leading-relaxed space-y-1 min-h-[40px]" placeholder="Job details..." />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
