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

  const handleMessage = async () => {
    const initialText = window.prompt("Send a message to " + candidate.fullName + ":");
    let hasText = false;
    if (initialText) {
      if (initialText.trim() !== '') hasText = true;
    }
    
    if (!hasText) return; 

    const loadingToast = toast.loading("Sending message...");
    try {
      await axios.post('https://talexajobs.onrender.com/api/messages/send', 
        { receiverId: candidate._id, text: initialText }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Message sent!");
      navigate('/messages'); 
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to send message.");
    }
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
        <p className="text-slate-500 font-bold animate-pulse">Loading Profile...</p>
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

  const cInfo = candidate.candidateInfo ? candidate.candidateInfo : {};
  const avatarUrl = getAvatarSrc();
  // 🚨 THE FIX: Extracting logic here prevents VS Code JSX syntax errors
  const hasBio = !!cInfo.bio;
  const hasExperience = cInfo.workExperience && cInfo.workExperience.length > 0;
  const hasEducation = cInfo.education && cInfo.education.length > 0;
  const hasSkills = cInfo.skills && cInfo.skills.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center text-slate-500 hover:text-slate-800 transition font-bold text-xs sm:text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm w-fit">
          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back to previous page
        </button>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 sm:mb-8">
          <div className="bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 h-32 sm:h-40 relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-5 sm:px-8 md:px-10 pb-6 sm:pb-8 relative">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-14 sm:-mt-16 mb-4 sm:mb-6 gap-4">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
                
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 z-10 relative">
                  {avatarUrl && !imgError ? (
                     <img 
                       src={avatarUrl} 
                       alt="Profile" 
                       className="h-full w-full object-cover" 
                       onError={() => setImgError(true)}
                     />
                  ) : (
                    <span className="font-extrabold text-slate-400 text-4xl sm:text-5xl">{getAvatarFallback()}</span>
                  )}
                </div>
                
                <div className="mt-2 sm:mt-0 mb-1 sm:mb-2 flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 break-words leading-tight">{candidate.fullName}</h1>
                  <p className="text-base sm:text-lg text-blue-600 font-extrabold mt-1 truncate">{cInfo.headline ? cInfo.headline : "Professional Candidate"}</p>
                </div>
              </div>
              
              <div className="mt-2 sm:mt-0 w-full sm:w-auto flex-shrink-0 z-10">
                <button 
                  onClick={handleMessage}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 sm:py-3 rounded-xl font-bold shadow-md transition flex items-center gap-2 w-full sm:w-auto justify-center text-sm sm:text-base"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Message
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-8 border-t border-slate-100 pt-5 sm:pt-6">
              <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-full">
                <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                <span className="font-bold text-xs sm:text-sm truncate">{candidate.email}</span>
              </div>
              
              {cInfo.location && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-full">
                  <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="font-bold text-xs sm:text-sm truncate">{cInfo.location}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* LEFT COLUMN: Bio, Work, Education */}
          <div className="md:col-span-2 space-y-5 sm:space-y-6">
            
            {hasBio && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Professional Summary
                </h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                  {cInfo.bio}
                </p>
              </div>
            )}

            {hasExperience && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                  Work Experience
                </h3>
                
                <div className="space-y-6">
                  {cInfo.workExperience.map((exp, index) => (
                    <div key={index} className="relative pl-5 sm:pl-6 border-l-2 border-slate-100">
                      <div className="absolute w-3.5 h-3.5 bg-indigo-500 rounded-full -left-[9px] top-1.5 ring-4 ring-white"></div>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">{exp.jobTitle}</h4>
                      <p className="text-sm font-bold text-indigo-600 mb-2">
                        {exp.companyName} <span className="text-slate-400 font-medium ml-1 sm:ml-2 block sm:inline">• {exp.startDate} - {exp.endDate}</span>
                      </p>
                      {exp.description && (
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasEducation && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-6 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                  Education & Training
                </h3>
                
                <div className="space-y-6">
                  {cInfo.education.map((edu, index) => (
                    <div key={index} className="relative pl-5 sm:pl-6 border-l-2 border-slate-100">
                      <div className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full -left-[9px] top-1.5 ring-4 ring-white"></div>
                      <h4 className="font-bold text-slate-900 text-base sm:text-lg">{edu.degree}</h4>
                      <p className="text-sm font-bold text-slate-500 mt-0.5">{edu.schoolName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasBio && !hasExperience && !hasEducation && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-500 font-bold">This candidate has not provided a bio, work experience, or education history.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Skills & Requirements */}
          <div className="space-y-5 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Professional Skills
              </h3>
              
              {hasSkills ? (
                <div className="flex flex-wrap gap-2">
                  {cInfo.skills.map((skill, index) => (
                    <span key={index} className="bg-amber-50 text-amber-800 border border-amber-200 px-3 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm flex items-center gap-2">
                      {typeof skill === 'object' ? skill.name : skill}
                      {typeof skill === 'object' && skill.level && (
                        <span className="text-[9px] bg-white text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {skill.level}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm font-medium">No skills listed yet.</p>
              )}
            </div>

            {/* Requirements & Resume */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Requirements
              </h3>
              
              <div className="space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Expected Salary</p>
                  <p className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {cInfo.salaryExpectation ? "$" + cInfo.salaryExpectation.toLocaleString() : "Negotiable"}
                  </p>
                </div>
                
                {cInfo.resumeUrl && (
                  <div className="pt-2">
                    <a 
                      href={getResumeUrl(cInfo.resumeUrl)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-3 rounded-xl font-bold transition shadow-sm text-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      View Full Resume
                    </a>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default CandidateProfile;