import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

function CandidateProfile() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false); 
  
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/users/" + id, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        
        if (response.data.success) {
          setCandidate(response.data.user);
        }
      } catch (error) {
        console.error("Error fetching profile", error);
        toast.error("Could not load candidate profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, navigate]);

  const handleMessageRedirect = () => {
    navigate('/messages', { state: { prefilledContact: candidate } });
  };

  const getAvatarSrc = () => {
    if (candidate && candidate.profilePictureUrl) {
      const cleanPath = candidate.profilePictureUrl.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) return cleanPath;
      if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return null;
  };

  const getAvatarFallback = () => {
    if (candidate && candidate.fullName) return candidate.fullName.charAt(0).toUpperCase();
    return "C";
  };

  const getResumeUrl = (url) => {
    if (!url) return "#";
    let cleanPath = String(url).trim().replace(/\\/g, '/');
    
    if (cleanPath.includes('http')) {
      return cleanPath.substring(cleanPath.indexOf('http'));
    }
    
    if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
    return "https://talexajobs.onrender.com/" + cleanPath;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Candidate Dossier...</p>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-4 text-center">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
           <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-6">This candidate may have deleted their account.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base">Go Back</button>
      </div>
    );
  }

  // DATA EXTRACTION & STRICT FALLBACKS
  const cInfo = candidate.candidateInfo ? candidate.candidateInfo : {};
  const avatarUrl = getAvatarSrc();
  
  const rawBio = cInfo.bio || "";
  const displayBio = rawBio.trim() !== "" ? rawBio : "This candidate hasn't added a professional summary yet.";
  
  const hasExperience = cInfo.workExperience && cInfo.workExperience.length > 0;
  const hasEducation = cInfo.education && cInfo.education.length > 0;
  const hasSkills = cInfo.skills && cInfo.skills.length > 0;

  const headline = cInfo.headline || "Professional Candidate";
  const location = cInfo.location || "Location not specified";
  const portfolioLink = cInfo.portfolioLink || cInfo.portfolioUrl || "";
  
  const contactEmail = cInfo.contactEmail && cInfo.contactEmail.trim() !== "" ? cInfo.contactEmail : "Contact not specified";

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HERO SECTION: Premium Deep Blue/Slate matching Employer & Navbar */}
      <div className="relative h-40 sm:h-64 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-blue-800 via-slate-900 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        
        {/* PREMIUM LEFT-ALIGNED HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
          
          <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center text-slate-500 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all group w-fit">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-100 pb-6 sm:pb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto text-center md:text-left">
              
              {/* AVATAR */}
              <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-md bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl && !imgError ? (
                  <img 
                    src={avatarUrl} 
                    alt={candidate.fullName} 
                    className="h-full w-full object-cover" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span className="font-extrabold text-slate-400 text-3xl sm:text-5xl">{getAvatarFallback()}</span>
                )}
              </div>
              
              {/* USER INFO */}
              <div className="flex-1 min-w-0 max-w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{candidate.fullName}</h1>
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-3 mt-2 sm:mt-3 max-w-full">
                  <span className="bg-blue-50 text-blue-700 font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md uppercase tracking-widest border border-blue-100 truncate max-w-full inline-block">
                    {headline}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS & BADGE (Perfectly Stacked) */}
            <div className="flex-shrink-0 mt-4 md:mt-0 w-full md:w-auto flex flex-col items-center md:items-end gap-2">
              
              {/* STATUS BADGE */}
              {cInfo.openToWork !== false && (
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm w-fit mb-1">
                   <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                   <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Open to Work</span>
                </div>
              )}
              
              {/* ACTION BUTTON */}
              <button onClick={handleMessageRedirect} className="bg-blue-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base w-full md:w-auto flex items-center justify-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                Message {candidate.fullName.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* QUICK STATS GRID (Balloons removed, 3-column Premium layout applied) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Location
              </p>
              {location !== "Location not specified" && location !== "" ? (
                 <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate" title={location}>{location}</p>
              ) : (
                 <p className="font-bold text-slate-400 text-xs sm:text-sm md:text-base italic truncate">Not specified</p>
              )}
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                Member Since
              </p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate">{new Date(candidate.createdAt).getFullYear()}</p>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0 col-span-2 md:col-span-1">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                Public Contact
              </p>
              {contactEmail !== "Contact not specified" ? (
                 <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate">{contactEmail}</p>
              ) : (
                 <p className="font-bold text-slate-400 text-xs sm:text-sm md:text-base italic truncate">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Professional Summary
              </h3>
              <p className={`leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium ${rawBio.trim() === "" ? "text-slate-400 italic" : "text-slate-600"}`}>
                {displayBio}
              </p>
            </div>

            {hasExperience && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                  Work Experience
                </h3>
                
                <div className="space-y-6">
                  {cInfo.workExperience.map((exp, index) => (
                    <div key={index} className="relative pl-5 sm:pl-6 border-l-2 border-slate-100">
                      <div className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-indigo-500 rounded-full -left-[7px] sm:-left-[9px] top-1 sm:top-1.5 ring-4 ring-white"></div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-lg">{exp.jobTitle}</h4>
                      <p className="text-xs sm:text-sm font-bold text-indigo-600 mb-1 sm:mb-2">
                        {exp.companyName} <span className="text-slate-400 font-medium ml-1 sm:ml-2 block sm:inline">• {exp.startDate} - {exp.endDate}</span>
                      </p>
                      {exp.description && (
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasEducation && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  Education & Training
                </h3>
                
                <div className="space-y-6">
                  {cInfo.education.map((edu, index) => (
                    <div key={index} className="relative pl-5 sm:pl-6 border-l-2 border-slate-100">
                      <div className="absolute w-3 h-3 sm:w-3.5 sm:h-3.5 bg-emerald-500 rounded-full -left-[7px] sm:-left-[9px] top-1 sm:top-1.5 ring-4 ring-white"></div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-lg">{edu.degree}</h4>
                      <p className="text-xs sm:text-sm font-bold text-slate-500 mt-0.5">{edu.schoolName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h5 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                 Professional Skills
              </h5>
              
              {hasSkills ? (
                <div className="flex flex-wrap gap-2">
                  {cInfo.skills.map((skill, index) => (
                    <span key={index} className="bg-slate-50 text-slate-700 border border-slate-200 px-3 py-2 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm flex items-center gap-2">
                      {typeof skill === 'object' ? skill.name : skill}
                      {typeof skill === 'object' && skill.level && (
                        <span className="text-[8px] sm:text-[9px] bg-white text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider border border-slate-100">
                          {skill.level}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="w-full text-center text-slate-400 font-medium text-xs sm:text-sm italic bg-slate-50 py-2.5 sm:py-3 rounded-xl border border-slate-100">
                  No skills listed
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h5 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 Requirements & Links
              </h5>
              
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Salary</p>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {cInfo.salaryExpectation ? "$" + cInfo.salaryExpectation.toLocaleString() : <span className="text-slate-400 italic font-bold">Negotiable</span>}
                  </p>
                </div>
                
                <div className="pt-1">
                  {portfolioLink ? (
                    <a 
                      href={portfolioLink.startsWith('http') ? portfolioLink : "https://" + portfolioLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-900 border border-slate-200 px-4 py-2.5 sm:py-3 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      Professional Portfolio
                    </a>
                  ) : (
                    <div className="w-full text-center text-slate-400 font-medium text-xs sm:text-sm italic bg-slate-50 py-2.5 sm:py-3 rounded-xl border border-slate-100">
                      No professional link provided
                    </div>
                  )}
                </div>
                
                <div className="pt-1">
                  {cInfo.resumeUrl ? (
                    <a 
                      href={getResumeUrl(cInfo.resumeUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2.5 sm:py-3 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View Full Resume
                    </a>
                  ) : (
                    <div className="w-full text-center text-slate-400 font-medium text-xs sm:text-sm italic bg-slate-50 py-2.5 sm:py-3 rounded-xl border border-slate-100">
                      No resume uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;
