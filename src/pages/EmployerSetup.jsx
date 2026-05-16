import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";

function EmployerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  const token = localStorage.getItem("token");
  let currentUserId = null;

  if (token && token.length > 10) {
    try {
      const decoded = JSON.parse(atob(token.split(".")[1]));
      if (decoded.id) { currentUserId = decoded.id; }
      else if (decoded._id) { currentUserId = decoded._id; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  let isMyProfile = false;
  if (currentUserId === id) {
      isMyProfile = true;
  }

  useEffect(function() {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async function() {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/users/" + id, {
          headers: { token: token, Authorization: "Bearer " + token }
        });
        
        if (response.data && response.data.user) {
          setProfileData(response.data.user);
        } else if (response.data && !response.data.user) {
           setProfileData(response.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, navigate]);

  const handleMessageRedirect = () => {
    navigate('/messages', { state: { prefilledContact: profileData } });
  };

  const getAvatarSrc = () => {
    if (profileData && profileData.profilePictureUrl) {
      const cleanPath = profileData.profilePictureUrl.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) return cleanPath;
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return null;
  };

  const getAvatarFallback = () => {
    if (profileData && profileData.fullName) return profileData.fullName.charAt(0).toUpperCase();
    return "E";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center">
        <p className="text-slate-500 font-medium animate-pulse tracking-wide text-sm">Loading Recruiter Profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center flex-col p-4">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-medium py-2 px-6 rounded-xl">Go Back</button>
      </div>
    );
  }

  const avatarUrl = getAvatarSrc();
  
  // 🚨 SAFE EXTRACTION (NO || OPERATORS)
  let fName = "Employer";
  if (profileData.fullName) { fName = profileData.fullName; }
  let firstName = fName.split(' ')[0];

  let jTitle = "Hiring Manager";
  let cName = "Company";
  let loc = "";
  let tz = "";
  let pBio = "This recruiter hasn't added a personal bio yet.";
  let pWebsite = "";
  let bEmail = ""; 
  
  if (profileData.employerInfo) {
      const ei = profileData.employerInfo;
      if (ei.posterJobTitle) { jTitle = ei.posterJobTitle; }
      if (ei.companyName) { cName = ei.companyName; }
      
      if (ei.location) { loc = ei.location; }
      else if (ei.companyLocation) { loc = ei.companyLocation; }
      else if (profileData.location) { loc = profileData.location; }
      
      if (ei.timezone) { tz = ei.timezone; }
      if (ei.bio) { pBio = ei.bio; }
      else if (profileData.bio) { pBio = profileData.bio; }
      
      if (ei.personalWebsite) { pWebsite = ei.personalWebsite; }
      else if (profileData.portfolioUrl) { pWebsite = profileData.portfolioUrl; }
      
      if (ei.businessEmail) { bEmail = ei.businessEmail; }
  } else {
      if (profileData.location) { loc = profileData.location; }
      if (profileData.bio) { pBio = profileData.bio; }
      if (profileData.portfolioUrl) { pWebsite = profileData.portfolioUrl; }
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-6 sm:py-10 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-bold text-xs sm:text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm group">
          <svg className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Back
        </button>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 sm:mb-8 relative">
          <div className="bg-slate-900 h-32 sm:h-40 relative">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-5 sm:px-8 md:px-10 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-4 sm:mb-6 gap-4">
              
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
                <div className="-mt-14 sm:-mt-16 h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 z-10 relative">
                  {avatarUrl && !imgError ? (
                     <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" onError={() => setImgError(true)} />
                  ) : (
                    <span className="font-extrabold text-slate-400 text-4xl sm:text-5xl">{getAvatarFallback()}</span>
                  )}
                </div>
                
                <div className="mt-2 sm:mt-0 mb-1 sm:mb-2 flex-1 min-w-0 pt-2 sm:pt-0">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 break-words">{fName}</h1>
                  <p className="text-sm sm:text-base text-blue-600 font-extrabold mt-1 truncate">
                    {jTitle} at {cName}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0 z-10 pt-2 sm:pt-0">
                {isMyProfile ? (
                  <Link to="/settings" className="w-full bg-white border border-slate-200 text-slate-700 font-extrabold py-3.5 px-8 rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2">
                    Edit Settings
                  </Link>
                ) : (
                  <button onClick={handleMessageRedirect} className="w-full bg-blue-600 text-white font-extrabold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message {firstName}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mt-6 sm:mt-8 border-t border-slate-100 pt-5 sm:pt-6">
              
              {/* Only show business email. NEVER show registration email. */}
              {bEmail !== "" && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                    <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                  <span className="font-bold text-xs sm:text-sm">{bEmail}</span>
                </div>
              )}
              
              {loc !== "" && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="font-bold text-xs sm:text-sm">{loc}</span>
                </div>
              )}

              {tz !== "" && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit">
                  <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="font-bold text-xs sm:text-sm">{tz}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* LEFT COLUMN: About Recruiter */}
          <div className="md:col-span-2 space-y-5 sm:space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                About {firstName}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                {pBio}
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN: Company Call To Action */}
          <div className="space-y-5 sm:space-y-6">
            
            <div className="bg-slate-900 rounded-2xl p-6 sm:p-8 flex flex-col items-center text-center shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
               
               <div className="h-16 w-16 bg-white rounded-xl shadow-md flex items-center justify-center mb-4 relative z-10">
                  <span className="text-2xl font-black text-slate-900">{cName.charAt(0).toUpperCase()}</span>
               </div>
               
               <h4 className="font-black text-white text-lg relative z-10 mb-2">{cName}</h4>
               <p className="text-slate-400 text-xs font-medium mb-6 relative z-10">View company mission, culture, and active job listings.</p>
               
               {/* 🚨 THIS BUTTON TAKES THEM TO THE COMPANY PAGE */}
               <Link to={"/employer/" + id} className="relative z-10 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-500 transition shadow-md flex items-center justify-center gap-2 text-sm">
                 View Company Profile
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </Link>
               </div>

            {pWebsite !== "" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                <a href={pWebsite.startsWith('http') ? pWebsite : "https://" + pWebsite} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold transition shadow-sm text-sm">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Personal Portfolio
                </a>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerProfile;