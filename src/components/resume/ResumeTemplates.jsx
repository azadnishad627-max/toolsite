import React from 'react';

// Helper to render newlines as <br />
const formatText = (text) => {
  if (!text) return null;
  return text.split('\n').map((str, i) => (
    <React.Fragment key={i}>
      {str}
      <br />
    </React.Fragment>
  ));
};

export const TemplateModern = ({ data }) => {
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
        <h1 className="text-3xl font-bold mb-2 tracking-tight">{personal.name || 'Your Name'}</h1>
        <h2 className="text-lg text-white/80 font-medium mb-8">{personal.jobTitle || 'Professional Title'}</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 border-b border-white/20 pb-1">Contact</h3>
            <div className="text-sm space-y-2 text-white/90">
              <p>{personal.email}</p>
              <p>{personal.phone}</p>
              <p>{personal.location}</p>
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
        {personal.summary && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 mb-3 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Profile</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{personal.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold border-b-2 mb-4 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Experience</h3>
            <div className="space-y-5">
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800">{exp.position}</h4>
                    <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded text-gray-600">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: themeColor }}>{exp.company}</div>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{formatText(exp.description)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {education.length > 0 && (
          <div>
            <h3 className="text-xl font-bold border-b-2 mb-4 pb-1" style={{ borderColor: themeColor, color: themeColor }}>Education</h3>
            <div className="space-y-4">
              {education.map((edu, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-gray-800">{edu.degree}</h4>
                    <span className="text-xs text-gray-500 font-medium">{edu.year}</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: themeColor }}>{edu.institution}</div>
                  {edu.score && <p className="text-sm text-gray-600 mt-1">Score: {edu.score}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const TemplateProfessional = ({ data }) => {
  const { personal, experience, education, skills, themeColor } = data;

  return (
    <div className="w-full h-full bg-white text-slate-800 font-serif p-10" style={{ minHeight: '1122px' }}>
      {/* Header */}
      <div className="text-center border-b-4 pb-6 mb-6" style={{ borderColor: themeColor }}>
        {personal.photo && (
          <img src={personal.photo} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
        )}
        <h1 className="text-4xl font-bold uppercase tracking-widest text-gray-900 mb-2" style={{ color: themeColor }}>{personal.name || 'Your Name'}</h1>
        <h2 className="text-xl text-gray-600 mb-3">{personal.jobTitle || 'Professional Title'}</h2>
        <div className="text-sm text-gray-500 flex justify-center flex-wrap gap-4">
          <span>{personal.email}</span>
          <span>•</span>
          <span>{personal.phone}</span>
          <span>•</span>
          <span>{personal.location}</span>
        </div>
      </div>

      {personal.summary && (
        <div className="mb-6">
          <p className="text-sm text-gray-700 leading-relaxed text-center italic">"{personal.summary}"</p>
        </div>
      )}

      {/* Two Column Layout for Body */}
      <div className="flex gap-8">
        <div className="w-2/3">
          {experience.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: themeColor }}>Experience</h3>
              <div className="space-y-6">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-gray-900 text-lg">{exp.position}</h4>
                      <span className="text-sm font-semibold text-gray-500">{exp.startDate} - {exp.endDate}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-600 italic mb-2">{exp.company}</div>
                    <p className="text-sm text-gray-700 leading-relaxed">{formatText(exp.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="w-1/3">
          {education.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold uppercase tracking-widest mb-4 border-b border-gray-300 pb-2" style={{ color: themeColor }}>Education</h3>
              <div className="space-y-5">
                {education.map((edu, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-gray-900">{edu.degree}</h4>
                    <div className="text-sm text-gray-600 italic">{edu.institution}</div>
                    <div className="text-sm text-gray-500 mt-1">{edu.year}</div>
                    {edu.score && <div className="text-sm text-gray-700 mt-1">Score: {edu.score}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

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

export const TemplateCreative = ({ data }) => {
  const { personal, experience, education, skills, themeColor } = data;

  return (
    <div className="w-full h-full bg-slate-50 text-slate-800 font-sans" style={{ minHeight: '1122px' }}>
      {/* Top Banner */}
      <div className="p-10 text-white flex items-center gap-8 rounded-br-[80px]" style={{ backgroundColor: themeColor }}>
        {personal.photo && (
          <img src={personal.photo} alt="Profile" className="w-32 h-32 rounded-2xl object-cover border-4 border-white/30 shadow-xl" />
        )}
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">{personal.name || 'Your Name'}</h1>
          <h2 className="text-xl font-medium text-white/90 mb-4">{personal.jobTitle || 'Professional Title'}</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/80">
            <span className="flex items-center gap-1">📍 {personal.location}</span>
            <span className="flex items-center gap-1">✉️ {personal.email}</span>
            <span className="flex items-center gap-1">📞 {personal.phone}</span>
          </div>
        </div>
      </div>

      <div className="p-10 grid grid-cols-12 gap-8">
        <div className="col-span-4 space-y-8">
          {personal.summary && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>About Me</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{personal.summary}</p>
            </div>
          )}
          
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
          {experience.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="w-8 h-8 rounded-lg bg-current flex items-center justify-center text-white text-sm">💼</span>
                Experience
              </h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {experience.map((exp, i) => (
                  <div key={i} className="relative bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <span className="absolute top-6 -left-3 w-6 h-6 rounded-full border-4 border-white" style={{ backgroundColor: themeColor }}></span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block text-white" style={{ backgroundColor: themeColor }}>{exp.startDate} - {exp.endDate}</span>
                    <h4 className="font-bold text-xl text-gray-900">{exp.position}</h4>
                    <div className="text-sm font-medium text-gray-500 mb-3">{exp.company}</div>
                    <p className="text-sm text-gray-600 leading-relaxed">{formatText(exp.description)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2" style={{ color: themeColor }}>
                <span className="w-8 h-8 rounded-lg bg-current flex items-center justify-center text-white text-sm">🎓</span>
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 border-l-4" style={{ borderLeftColor: themeColor }}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-gray-900">{edu.degree}</h4>
                      <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded">{edu.year}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-600">{edu.institution}</div>
                    {edu.score && <div className="text-sm text-gray-500 mt-2">Score: <span className="font-semibold text-gray-700">{edu.score}</span></div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TemplateCanvaDark = ({ data }) => {
  const { personal, experience, education, skills, themeColor } = data;
  
  return (
    <div className="w-full h-full flex bg-white text-gray-800 font-sans" style={{ minHeight: '1122px' }}>
      {/* Left Dark Sidebar */}
      <div className="w-[35%] bg-[#1a1a1a] text-white p-8 border-r-8" style={{ borderRightColor: themeColor }}>
        {personal.photo && (
          <div className="flex justify-center mb-10 mt-4">
            <img src={personal.photo} alt="Profile" className="w-40 h-40 rounded-full object-cover border-2 border-white" />
          </div>
        )}
        
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/30 pb-2">Contact</h3>
            <div className="text-xs space-y-3 text-white/90">
              <div><strong className="block text-white mb-0.5">Phone</strong>{personal.phone}</div>
              <div><strong className="block text-white mb-0.5">Email</strong>{personal.email}</div>
              <div><strong className="block text-white mb-0.5">Address</strong>{personal.location}</div>
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

      {/* Right Content */}
      <div className="w-[65%] pt-12 pr-10 pb-10">
        {/* Colored Header Block */}
        <div className="p-8 -ml-8 mb-8 shadow-sm" style={{ backgroundColor: themeColor }}>
          <h1 className="text-4xl font-black uppercase tracking-tight text-gray-900 mb-1">{personal.name || 'Your Name'}</h1>
          <h2 className="text-lg font-bold uppercase tracking-widest text-gray-800">{personal.jobTitle || 'Professional Title'}</h2>
        </div>

        {personal.summary && (
          <p className="text-xs text-gray-700 leading-relaxed mb-8 ml-8">{personal.summary}</p>
        )}

        <div className="ml-8 space-y-8">
          {experience.length > 0 && (
            <div>
              <h3 className="inline-block px-2 py-1 font-bold text-sm uppercase mb-4 text-gray-900" style={{ backgroundColor: themeColor + '80' }}>
                Work Experience
              </h3>
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-sm text-gray-900">{exp.position}</h4>
                    <div className="text-xs text-gray-600 mb-2 font-medium">{exp.company} | {exp.startDate} – {exp.endDate}</div>
                    <div className="text-xs text-gray-700 leading-relaxed pl-3 border-l-2 border-gray-200">{formatText(exp.description)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {education.length > 0 && (
            <div>
              <h3 className="inline-block px-2 py-1 font-bold text-sm uppercase mb-4 text-gray-900" style={{ backgroundColor: themeColor + '80' }}>
                Education
              </h3>
              <div className="space-y-4">
                {education.map((edu, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-sm text-gray-900">{edu.degree}</h4>
                    <div className="text-xs text-gray-600 mb-1 font-medium">{edu.institution} | {edu.year}</div>
                    {edu.score && <div className="text-xs text-gray-700">GPA/Score: {edu.score}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TemplateCanvaWave = ({ data }) => {
  const { personal, experience, education, skills, themeColor } = data;
  
  return (
    <div className="w-full h-full relative bg-white text-gray-800 font-sans overflow-hidden" style={{ minHeight: '1122px' }}>
      {/* Top Wave Graphic */}
      <svg className="absolute top-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '180px' }}>
        <path fill={themeColor} fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,154.7C1248,149,1344,107,1392,85.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
      </svg>

      {/* Bottom Wave Graphic */}
      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 320" preserveAspectRatio="none" style={{ height: '140px' }}>
        <path fill={themeColor} fillOpacity="1" d="M0,256L48,229.3C96,203,192,149,288,154.7C384,160,480,224,576,250.7C672,277,768,267,864,234.7C960,203,1056,149,1152,138.7C1248,128,1344,160,1392,176L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
      </svg>

      {/* Header Info */}
      <div className="relative z-10 pt-10 px-12 flex items-center gap-8 mb-8">
        {personal.photo ? (
          <img src={personal.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
        ) : (
          <div className="w-32 h-32 rounded-full bg-white/50 border-4 border-white shadow-lg flex items-center justify-center text-gray-500 font-bold">Photo</div>
        )}
        <div className="pt-8">
          <h1 className="text-4xl font-serif font-bold uppercase text-gray-800 tracking-wider" style={{ color: themeColor }}>{personal.name || 'Your Name'}</h1>
          <h2 className="text-sm font-bold tracking-widest text-gray-600 uppercase mt-2">{personal.jobTitle || 'Professional Title'}</h2>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="relative z-10 px-12 grid grid-cols-12 gap-10">
        
        {/* Left Column */}
        <div className="col-span-5 space-y-6">
          {personal.summary && (
            <div>
              <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>About Me</h3>
              <p className="text-[11px] text-gray-700 leading-relaxed text-justify">{personal.summary}</p>
            </div>
          )}

          <div>
            <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Contact</h3>
            <div className="text-[11px] text-gray-700 space-y-2">
              <div className="flex items-center gap-2 font-medium">📞 {personal.phone}</div>
              <div className="flex items-center gap-2 font-medium">✉️ {personal.email}</div>
              <div className="flex items-center gap-2 font-medium">📍 {personal.location}</div>
            </div>
          </div>

          {education.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Education</h3>
              <div className="space-y-3 text-[11px] text-gray-700">
                {education.map((edu, i) => (
                  <div key={i}>
                    <strong className="block text-gray-900 text-xs mb-0.5">{edu.degree}</strong>
                    <span className="block font-medium">{edu.institution}</span>
                    <span className="block text-gray-500">{edu.year}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-3 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Skills</h3>
              <ul className="text-[11px] text-gray-700 space-y-1 font-medium list-disc list-inside">
                {skills.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="col-span-7 space-y-6">
          {experience.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-[10px] px-3 py-1 uppercase mb-4 inline-block rounded tracking-wider" style={{ backgroundColor: themeColor }}>Experience</h3>
              <div className="space-y-5">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <h4 className="font-bold text-sm text-gray-900">{exp.position}</h4>
                    <div className="text-[11px] text-gray-600 font-semibold mb-2">{exp.company} | {exp.startDate} - {exp.endDate}</div>
                    <div className="text-[11px] text-gray-700 leading-relaxed space-y-1">
                      {formatText(exp.description)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
