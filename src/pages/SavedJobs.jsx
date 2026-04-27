import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSavedJobs = async () => {
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const response = await axios.get('http://localhost:5000/api/bookmarks/my-bookmarks', {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        if (response.data.success && response.data.savedJobs) {
          setSavedJobs(response.data.savedJobs);
        }
      } catch (error) {
        console.error("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSavedJobs();
  }, [token]);

  const handleRemove = async (jobId) => {
    try {
      await axios.post("http://localhost:5000/api/bookmarks/toggle/" + jobId, {}, {
        headers: { token: token, Authorization: "Bearer " + token }
      });
      setSavedJobs(savedJobs.filter(function(job) { return job._id !== jobId; }));
      toast.success("Removed from Saved Jobs");
    } catch (error) {
      toast.error("Failed to remove job.");
    }
  };

  const handleApply = async (jobId) => {
    const coverLetter = window.prompt("Please provide a brief cover letter or introduction (Optional):");
    if (coverLetter === null) return; 

    const loadingToast = toast.loading("Submitting application...");
    try {
      await axios.post('http://localhost:5000/api/applications/apply', 
        { jobId: jobId, coverLetter: coverLetter }, 
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      toast.dismiss(loadingToast);
      toast.success("Application submitted successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to apply. You may have already applied for this position.");
    }
  };

  // 🚨 SMART LOGO CHECKER
  const getLogoUrl = (user) => {
    if (!user) return null;
    let rawUrl = null;
    
    if (user.employerInfo && user.employerInfo.logoUrl) {
      rawUrl = user.employerInfo.logoUrl;
    } else if (user.profilePictureUrl) {
      rawUrl = user.profilePictureUrl;
    }

    if (!rawUrl) return null;

    const cleanPath = rawUrl.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.startsWith('/')) return "http://localhost:5000" + cleanPath;
    return "http://localhost:5000/" + cleanPath;
  };

  const getAvatarLetter = (user) => {
    if (!user) return "C";
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName.charAt(0).toUpperCase();
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    return "C";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading your saved opportunities...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-10 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6 sm:mb-8 text-center sm:text-left border-b border-slate-200 pb-4 sm:pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Saved Jobs</h1>
          <p className="mt-2 text-slate-500 font-medium text-sm sm:text-base">Review and apply to the opportunities you bookmarked.</p>
        </div>

        {savedJobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 sm:p-16 text-center shadow-sm">
            <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No saved jobs yet</h3>
            <p className="text-slate-500 font-medium text-sm sm:text-base mb-6">Jobs you bookmark on the Job Board will appear here.</p>
            <Link to="/jobs" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-sm text-sm sm:text-base">
              Browse Job Board
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5">
            {savedJobs.map(function(job) {
              const uniqueKey = job._id ? job._id : Math.random().toString();
              const logoUrl = getLogoUrl(job.user);

              let compName = "Confidential Employer";
              if (job.user && job.user.employerInfo && job.user.employerInfo.companyName) {
                compName = job.user.employerInfo.companyName;
              } else if (job.user && job.user.fullName) {
                compName = job.user.fullName;
              }

              const jobTitle = job.title ? job.title : "Confidential Role";
              const jobLocation = job.location ? job.location : "Location not specified";
              const jobSalary = job.salary ? job.salary.toLocaleString() : "Competitive";
              const jobDescription = job.description ? job.description : "No description provided.";
              const jobType = job.employmentType ? job.employmentType : "Full-time";

              return (
                <div key={uniqueKey} className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition duration-200 overflow-hidden">
                  
                  {/* TOP SECTION: Logo & Title */}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 mb-4">
                    
                    {/* 🚨 BULLETPROOF IMAGE HANDLING */}
                    <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0 shadow-sm relative">
                      {logoUrl ? (
                        <>
                          <img 
                            src={logoUrl} 
                            alt="Company Logo" 
                            className="h-full w-full object-cover z-10 relative" 
                            onError={(e) => { e.target.style.display = 'none'; }} 
                          />
                          <span className="absolute inset-0 flex items-center justify-center font-extrabold text-slate-400 text-xl sm:text-2xl z-0">
                            {getAvatarLetter(job.user)}
                          </span>
                        </>
                      ) : (
                        <span className="font-extrabold text-slate-400 text-xl sm:text-2xl z-0">
                          {getAvatarLetter(job.user)}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 leading-snug break-words mb-1">{jobTitle}</h3>
                      <Link to={job.user ? "/employer/" + job.user._id : "#"} className="text-blue-600 hover:text-blue-800 transition font-bold text-xs sm:text-sm inline-block truncate max-w-full">
                        {compName}
                      </Link>
                    </div>
                  </div>
                  
                  {/* MIDDLE SECTION: Badges & Description */}
                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap">
                      {jobType}
                    </span>
                    <span className="bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      {jobLocation}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2.5 py-1 rounded-md text-[10px] sm:text-xs font-bold whitespace-nowrap flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ${jobSalary}
                    </span>
                  </div>
                  
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 mb-4">
                    {jobDescription}
                  </p>

                  {/* BOTTOM SECTION: Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-4 border-t border-slate-100">
                    <button onClick={() => handleRemove(job._id)} className="w-full sm:w-auto flex-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold py-2.5 rounded-xl transition shadow-sm text-xs sm:text-sm text-center">
                      Remove
                    </button>
                    <Link to={job.user ? "/employer/" + job.user._id : "#"} className="w-full sm:w-auto flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold py-2.5 rounded-xl transition shadow-sm text-xs sm:text-sm flex items-center justify-center">
                      View Employer
                    </Link>
                    <button onClick={() => handleApply(job._id)} className="w-full sm:w-auto flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs sm:text-sm text-center">
                      Apply Now
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SavedJobs;