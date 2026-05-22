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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Company Dossier...</p>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-4 text-center font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Company Not Found</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-6">This employer profile may have been removed or deactivated.</p>
        <Link to="/jobs" className="bg-slate-900 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-600 transition shadow-sm text-sm sm:text-base">Return to Job Board</Link>
      </div>
    );
  }

  // DATA MAPPING
  const info = employer.employerInfo || {};
  const companyName = info.companyName || "Confidential Employer";
  const industry = info.industry || "Professional Services";
  
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
    <div className="min-h-screen bg-slate-50 pb-20 font-sans" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* HEADER HERO SECTION */}
      <div className="relative h-40 sm:h-64 bg-slate-900 overflow-hidden">
      
<img 
  src={logoUrl} 
  alt={companyName} 
  className="h-full w-full object-contain p-3" // Changed object-cover to object-contain and added p-3
  onError={() => setImgError(true)} 
/>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10">
          
          {/* LEFT COLUMN: Logo, About, & Jobs */}
          <div className="w-full lg:w-2/3">
            
            {/* COMPACT OVERLAPPING LOGO & NAME */}
            <div className="mb-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 text-center sm:text-left">
              <div className="-mt-12 sm:-mt-16 h-24 w-24 sm:h-32 sm:w-32 rounded-2xl border-4 border-slate-50 shadow-md bg-white flex items-center justify-center overflow-hidden flex-shrink-0 relative z-20">
                {logoUrl && !imgError ? (
                  <img 
                    src={logoUrl} 
                    alt={companyName} 
                    className="h-full w-full object-contain p-2" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span className="font-extrabold text-slate-300 text-4xl sm:text-5xl">{avatarLetter}</span>
                )}
              </div>
              
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                  {companyName}
                </h1>
                <span className="bg-blue-50 text-blue-700 font-bold text-[10px] sm:text-xs px-2.5 py-1.5 rounded-md uppercase tracking-widest border border-blue-100 inline-block">
                  {industry}
                </span>
              </div>
            </div>

            {/* OVERVIEW SECTION */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 mb-6 sm:mb-8">
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                Company Overview
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium">
                {description ? description : "This company has not provided a detailed overview yet."}
              </p>
            </div>

            {/* MISSION & CULTURE SECTION */}
            {(mission || culture) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-10">
                {mission && (
                  <div className="bg-slate-900 rounded-2xl shadow-sm p-5 sm:p-6 text-white relative overflow-hidden">
                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 text-blue-300">
                      Our Mission
                    </h3>
                    <p className="text-sm sm:text-base font-medium italic leading-relaxed relative z-10 text-slate-200">
                      "{mission}"
                    </p>
                  </div>
                )}

                {culture && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                    <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-3 text-slate-900">
                      Culture & Values
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium whitespace-pre-wrap">
                      {culture}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* JOB LISTINGS SECTION */}
            <div className="mb-4 sm:mb-6 border-b border-slate-200 pb-3 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">Current Opportunities</h3>
              <span className="bg-slate-100 text-slate-600 text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200">{jobs.length} Active</span>
            </div>
            
            {jobs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-sm">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1">No Active Listings</h3>
                <p className="text-slate-500 text-xs sm:text-sm font-medium">This employer hasn't posted any jobs recently. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:gap-4">
                {jobs.map(function(job) {
                  return (
                    <div key={job._id} className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                        
                        <div className="flex-1 min-w-0 w-full">
                          <h4 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2 leading-snug break-words">{job.title ? job.title : "Professional Role"}</h4>
                          
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                            <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
                              {job.employmentType ? job.employmentType : "Full-time"}
                            </span>
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                              ${job.salary ? job.salary.toLocaleString() : "Negotiable"}
                            </span>
                            <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2 sm:px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                              <span className="truncate max-w-[120px] sm:max-w-[150px]">{job.location ? job.location : "Remote"}</span>
                            </span>
                          </div>
                        </div>

                        <Link to="/jobs" className="w-full sm:w-auto text-center bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex-shrink-0 mt-1 sm:mt-0">
                          View Job
                        </Link>
                        
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Sidebar Stats */}
          <div className="w-full lg:w-1/3 mt-2 sm:mt-4 lg:mt-0">
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-28">
              
              <div className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-2 rounded-lg shadow-sm mb-6 w-full">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Verified Employer</span>
              </div>

              <div className="space-y-4 sm:space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    Location
                  </p>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{location}</p>
                </div>
                
                <div className="border-t border-slate-100 pt-4 sm:pt-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    Team Size
                  </p>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{size}</p>
                </div>
                
                <div className="border-t border-slate-100 pt-4 sm:pt-5">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    Industry
                  </p>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">{industry}</p>
                </div>
              </div>

              {website && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noreferrer" className="w-full text-center bg-slate-900 text-white hover:bg-blue-600 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-sm flex items-center justify-center gap-1.5">
                    Visit Website
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CompanyProfile;
