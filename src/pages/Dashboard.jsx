import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function Dashboard() {
  const [applications, setApplications] = useState([]); 
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidateData = async () => {
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      if (!token) {
        navigate("/login");
        return;
      }

      if (userStr) {
        setUserData(JSON.parse(userStr));
      }

      try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        if (decoded.role === "employer") {
          navigate("/employer-dashboard");
          return;
        }
      } catch (e) {
        console.error("Error decoding token", e);
      }

      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/applications/my-applications", {
          headers: { Authorization: "Bearer " + token }
        });
        
        if (response.data && response.data.applications) {
          setApplications(response.data.applications);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidateData();
  }, [navigate]);

  const handleWithdraw = async (applicationId) => {
    const isConfirmed = window.confirm("Are you sure you want to withdraw your application? This cannot be undone.");
    if (!isConfirmed) return;

    const loadingToast = toast.loading("Withdrawing application...");
    const token = localStorage.getItem("token");
    
    try {
      await axios.delete("https://talexajobs.onrender.com/api/applications/delete/" + applicationId, {
        headers: { Authorization: "Bearer " + token }
      });
      
      setApplications(applications.filter(function(app) {
        return app._id !== applicationId;
      }));
      
      toast.dismiss(loadingToast);
      toast.success("Application withdrawn.");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to withdraw application.");
    }
  };

  // 🚨 SMART LOGO & AVATAR EXTRACTORS ADDED!
  const getLogoUrl = (user) => {
    if (!user) return null;
    let rawUrl = null;
    if (user.employerInfo && user.employerInfo.logoUrl) rawUrl = user.employerInfo.logoUrl;
    else if (user.profilePictureUrl) rawUrl = user.profilePictureUrl;
    if (!rawUrl) return null;

    const cleanPath = rawUrl.replace(/\\/g, '/');
    if (cleanPath.startsWith('http')) return cleanPath;
    if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
    return "https://talexajobs.onrender.com/" + cleanPath;
  };

  const getAvatarLetter = (user) => {
    if (!user) return "C";
    if (user.employerInfo && user.employerInfo.companyName) return user.employerInfo.companyName.charAt(0).toUpperCase();
    if (user.fullName) return user.fullName.charAt(0).toUpperCase();
    return "C";
  };

  const getJobTitle = (app) => {
    if (app && app.job && app.job.title) return app.job.title;
    return "Position Closed";
  };
  
  const getCompany = (app) => {
    if (app && app.job && app.job.user && app.job.user.employerInfo && app.job.user.employerInfo.companyName) {
      return app.job.user.employerInfo.companyName;
    }
    return "Confidential Employer";
  };
  
  const getLocation = (app) => {
    if (app && app.job && app.job.location) return app.job.location;
    return "Remote / Unspecified";
  };
  
  const getAppDate = (app) => {
    if (app && app.createdAt) return new Date(app.createdAt).toLocaleDateString();
    return "Unknown Date";
  };

  // 🚨 PREMIUM STATUS BADGES
  const getStatusDisplay = (status) => {
    const safeStatus = status ? status.toLowerCase() : "pending";
    
    if (safeStatus === "accepted") {
      return {
        text: "OFFER RECEIVED",
        colors: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm",
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      };
    }
    if (safeStatus === "interviewing") {
      return {
        text: "INTERVIEWING",
        colors: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm",
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
      };
    }
    if (safeStatus === "reviewed") {
      return {
        text: "REVIEWED",
        colors: "bg-blue-50 text-blue-700 border border-blue-200",
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
      };
    }
    if (safeStatus === "rejected") {
      return {
        text: "NOT SELECTED",
        colors: "bg-rose-50 text-rose-700 border border-rose-200",
        icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      };
    }
    
    // Default Pending
    return {
      text: "APPLICATION SENT",
      colors: "bg-amber-50 text-amber-700 border border-amber-200",
      icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };
  };

  const calculateProfileCompletion = () => {
    if (!userData) return 0;
    let score = 0;
    if (userData.fullName) score += 10;
    if (userData.profilePictureUrl) score += 10;
    if (userData.candidateInfo) {
      if (userData.candidateInfo.headline) score += 10;
      if (userData.candidateInfo.location) score += 10;
      if (userData.candidateInfo.bio) score += 20;
      if (userData.candidateInfo.skills && userData.candidateInfo.skills.length > 0) score += 10;
      if (userData.candidateInfo.workExperience && userData.candidateInfo.workExperience.length > 0) score += 10;
      if (userData.candidateInfo.resumeUrl) score += 20;
    }
    return score;
  };

  const completionPercentage = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">

        {/* PREMIUM HEADER */}
        <div className="mb-6 sm:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-lg gap-5 sm:gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-3">
              <svg className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              Command Center
            </h1>
            <p className="text-slate-300 mt-2 font-medium text-sm sm:text-base">
              Welcome back, {userData && userData.fullName ? userData.fullName.split(" ")[0] : "Candidate"}. Monitor your job hunting progress below.
            </p>
          </div>
          <Link to="/jobs" className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 sm:px-8 rounded-xl transition shadow-md whitespace-nowrap relative z-10 text-sm sm:text-base">
            Find New Opportunities
          </Link>
        </div>

        {/* TWO-COLUMN LAYOUT */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          
          {/* LEFT SIDE: PROFILE WIDGET */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-800 uppercase tracking-wider">Profile Strength</h3>
                </div>
                <span className="text-xl sm:text-2xl font-extrabold text-blue-600">{completionPercentage}%</span>
              </div>
              
              <div className="w-full bg-slate-100 rounded-full h-2.5 sm:h-3 mb-4 overflow-hidden border border-slate-200">
                <div 
                  className={"h-full rounded-full transition-all duration-1000 ease-out " + (completionPercentage === 100 ? "bg-emerald-500" : "bg-blue-600")}
                  style={{ width: completionPercentage + "%" }}
                ></div>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-500 font-medium mb-5 sm:mb-6 leading-relaxed">
                {completionPercentage === 100 
                  ? "Your profile is fully optimized! You are ready to stand out to top employers." 
                  : "Employers prefer candidates with complete profiles. Add your resume and skills to boost your chances."}
              </p>

              <Link to="/my-profile" className="block w-full text-center bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:text-blue-700 text-slate-700 font-bold py-2.5 rounded-xl transition text-xs sm:text-sm">
                Edit Digital Resume
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE: APPLICATIONS GRID */}
          <div className="w-full lg:w-2/3">
            <div className="flex items-center justify-between mb-4 sm:mb-5 border-b border-slate-200 pb-3 sm:pb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">Active Pipelines</h2>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-bold border border-blue-100">
                {applications.length} Applications
              </span>
            </div>

            {applications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 sm:p-16 text-center shadow-sm">
                <div className="mx-auto h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                  <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">No Applications Yet</h3>
                <p className="text-slate-500 mb-6 font-medium text-sm sm:text-base">You haven't sent out any applications. Start applying to build your pipeline!</p>
                <Link to="/jobs" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-8 rounded-xl transition shadow-md text-sm sm:text-base">
                  Browse Job Board
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:gap-5">
                {applications.map(function(app) {
                  const statusUI = getStatusDisplay(app.status);
                  const logoUrl = app.job && app.job.user ? getLogoUrl(app.job.user) : null;
                  
                  return (
                    <div key={app._id} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition overflow-hidden">
                      
                      {/* Top Row: Date & Status */}
                      <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 border-b border-slate-100 pb-4">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" /></svg>
                          Applied: {getAppDate(app)}
                        </span>
                        <div className={"flex w-fit items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-wide uppercase " + statusUI.colors}>
                          {statusUI.icon}
                          {statusUI.text}
                        </div>
                      </div>

                      {/* Middle Row: Job & Company Info with Unified Cards */}
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5 mb-5">
                        
                        {/* COMPANY LOGO */}
                        <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-xl border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center flex-shrink-0 shadow-sm relative">
                          {logoUrl ? (
                            <>
                              <img src={logoUrl} alt="Logo" className="h-full w-full object-cover z-10 relative" onError={(e) => { e.target.style.display = 'none'; }} />
                              <span className="absolute inset-0 flex items-center justify-center font-extrabold text-slate-400 text-xl sm:text-2xl z-0">
                                {getAvatarLetter(app.job ? app.job.user : null)}
                              </span>
                            </>
                          ) : (
                            <span className="font-extrabold text-slate-400 text-xl sm:text-2xl z-0">
                              {getAvatarLetter(app.job ? app.job.user : null)}
                            </span>
                          )}
                        </div>

                        {/* JOB DETAILS */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug break-words mb-1">
                            {getJobTitle(app)}
                          </h3>
                          <p className="text-blue-600 font-bold text-xs sm:text-sm mb-2 truncate">
                            {getCompany(app)}
                          </p>
                          <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5 font-medium">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <span className="truncate">{getLocation(app)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Bottom Row: Actions */}
                      <div className="flex justify-end pt-3 border-t border-slate-50">
                        <button 
                          onClick={() => handleWithdraw(app._id)}
                          className="w-full sm:w-auto text-xs sm:text-sm font-bold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          Withdraw Application
                        </button>
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

export default Dashboard;