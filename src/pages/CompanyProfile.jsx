import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

function CompanyProfile() {
  const { id } = useParams();
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false); 

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/users/employer/" + id);
        if (response.data.success) {
          setEmployer(response.data.employer);
          
          const activeJobs = response.data.jobs.filter(function(job) {
            return job.adminStatus === 'approved';
          });
          setJobs(activeJobs);
        }
      } catch (error) {
        console.error("Failed to fetch company profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Company Dossier...</p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-4 text-center">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Company Not Found</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-6">This employer profile may have been removed or deactivated.</p>
        <Link to="/jobs" className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base">Return to Job Board</Link>
      </div>
    );
  }

  // DATA MAPPING
  const info = employer.employerInfo || {};
  const companyName = info.companyName || "Confidential Employer";
  const industry = info.industry || "Professional Services";
  
  // Checking both old and new backend fields so it never breaks
  const location = info.location || info.companyLocation || "Global";
  const size = info.companySize || "Not Disclosed";
  const description = info.companyDescription || info.bio || "";
  const mission = info.companyMission || info.mission || "";
  const culture = info.companyCulture || info.culture || "";
  const website = info.personalWebsite || info.website || "";
  
  let logoUrl = null;
  if (info.logoUrl) {
    const cleanPath = info.logoUrl.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) {
      logoUrl = cleanPath;
    } else if (cleanPath.startsWith('/')) {
      logoUrl = "https://talexajobs.onrender.com" + cleanPath;
    } else {
      logoUrl = "https://talexajobs.onrender.com/" + cleanPath;
    }
  }
  const avatarLetter = companyName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HEADER HERO SECTION */}
      <div className="relative h-40 sm:h-64 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-blue-800 via-slate-900 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-100 pb-6 sm:pb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto text-center md:text-left">
              
              {/* COMPANY LOGO WITH BULLETPROOF FALLBACK */}
              <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl border-4 border-white shadow-md bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {logoUrl && !imgError ? (
                  <img 
                    src={logoUrl} 
                    alt={companyName} 
                    className="h-full w-full object-cover" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span className="font-extrabold text-slate-400 text-3xl sm:text-5xl">{avatarLetter}</span>
                )}
              </div>
              
              {/* COMPANY INFO */}
              <div className="flex-1 min-w-0 max-w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{companyName}</h1>
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-3 mt-2 sm:mt-3 max-w-full">
                  <span className="bg-blue-50 text-blue-700 font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md uppercase tracking-widest border border-blue-100 truncate max-w-full inline-block">
                    {industry}
                  </span>
                  {website && (
                    <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-blue-600 font-bold text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5 transition bg-slate-50 hover:bg-blue-50 px-3 py-1.5 rounded-md border border-slate-200 hover:border-blue-200 truncate max-w-full">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      <span className="truncate">Website</span>
                    </a>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* QUICK STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Location
              </p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate" title={location}>{location}</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Team Size
                </p>
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate" title={size}>{size}</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                Open Roles
              </p>
              <p className="font-extrabold text-blue-600 text-xs sm:text-sm md:text-base truncate">{jobs.length} Active</p>
            </div>
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex flex-col justify-center min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 truncate">Company Status</p>
              <div className="flex items-center justify-center gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg shadow-sm w-fit mx-auto md:mx-0">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: ABOUT & CULTURE */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Overview
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium">
                {description ? description : "This company has not provided a detailed overview yet."}
              </p>
            </div>

            {mission && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl shadow-md p-5 sm:p-6 md:p-8 text-white relative overflow-hidden">
                <svg className="absolute -right-4 -top-4 sm:-right-6 sm:-top-6 w-24 h-24 sm:w-32 sm:h-32 opacity-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 opacity-80 flex items-center gap-1.5 sm:gap-2">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Our Mission
                </h3>
                <p className="text-sm sm:text-base md:text-lg font-medium italic leading-relaxed relative z-10">
                  "{mission}"
                </p>
              </div>
            )}

            {culture && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                  Culture & Values
                </h3>
                <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium">
                  {culture}
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: JOBS */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 sm:mb-6 border-b border-slate-200 pb-3 sm:pb-4">
              <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900">Current Opportunities</h3>
              <span className="bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md border border-blue-100">{jobs.length} Available</span>
            </div>
            
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-12 md:p-16 text-center shadow-sm">
                <div className="h-12 w-12 sm:h-16 sm:w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No Active Listings</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">This employer hasn't posted any jobs recently. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4 md:gap-5">
                {jobs.map(function(job) {
                  return (
                    <div key={job._id} className="bg-white border border-slate-200 p-4 sm:p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                        
                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="text-base sm:text-lg md:text-xl font-extrabold text-slate-900 mb-2 sm:mb-2.5 leading-snug break-words">{job.title ? job.title : "Professional Role"}</h4>
                          
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                            <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-bold whitespace-nowrap">
                              {job.employmentType ? job.employmentType : "Full-time"}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 sm:px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              {job.salary ? job.salary.toLocaleString() : "Negotiable"}
                            </span>
                            <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-md text-[9px] sm:text-[10px] md:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                              <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              <span className="truncate max-w-[120px] sm:max-w-[150px]">{job.location ? job.location : "Remote"}</span>
                            </span>
                          </div>
                        </div>

                        <Link to="/jobs" className="w-full sm:w-auto text-center bg-blue-600 text-white hover:bg-blue-700 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex-shrink-0 flex items-center justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-0">
                          View on Board
                          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </Link>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
