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
      else if (decoded.userId) { currentUserId = decoded.userId; }
    } catch (e) {
      console.error("Token error", e);
    }
  }

  let isMyProfile = false;
  if (currentUserId === id) { isMyProfile = true; }

  useEffect(function() {
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchProfile = async function() {
      try {
        const response = await axios.get("https://talexajobs.onrender.com/api/users/" + id, {
          headers: { Authorization: "Bearer " + token }
        });
        
        if (response.data && response.data.success) {
          setProfileData(response.data.user);
        } else if (response.data) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold tracking-wide animate-pulse">Loading Recruiter Dossier...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col p-4 text-center">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-6">This employer profile may have been removed or deactivated.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base">Go Back</button>
      </div>
    );
  }

// DATA EXTRACTION (Bulletproof logic)
  let ei = profileData.employerInfo;
  if (!ei) { ei = {}; }
  
  let fullName = "Hiring Manager";
  if (profileData.fullName) { fullName = profileData.fullName; }
  
  let firstName = fullName.split(' ')[0];
  
  let jobTitle = "Recruiter";
  if (ei.posterJobTitle) { jobTitle = ei.posterJobTitle; }
  
  let companyName = "Company";
  if (ei.companyName) { companyName = ei.companyName; }
  
  let rawBio = "";
  if (ei.bio) { rawBio = ei.bio; }
  else if (profileData.bio) { rawBio = profileData.bio; }
  
  let bio = "This hiring manager hasn't added a personal bio yet.";
  if (rawBio !== "") { bio = rawBio; }
  
  let portfolio = "";
  if (ei.personalWebsite) { portfolio = ei.personalWebsite; }
  else if (profileData.portfolioUrl) { portfolio = profileData.portfolioUrl; }
  else if (profileData.personalWebsite) { portfolio = profileData.personalWebsite; }
  else if (ei.portfolioUrl) { portfolio = ei.portfolioUrl; }
  
  let businessEmail = "";
  if (ei.businessEmail) { businessEmail = ei.businessEmail; }
  else if (profileData.businessEmail) { businessEmail = profileData.businessEmail; }
  
  let location = "Remote";
  if (ei.location) { location = ei.location; }
  else if (ei.companyLocation) { location = ei.companyLocation; }
  else if (profileData.location) { location = profileData.location; }
  
  let companyDesc = "No company description provided.";
  if (ei.companyDescription) { companyDesc = ei.companyDescription; }
  
  let companyWebsite = "";
  if (ei.website) { companyWebsite = ei.website; }

  let avatarUrl = null;
  if (profileData.profilePictureUrl) {
      let pUrl = profileData.profilePictureUrl;
      if (pUrl.indexOf("http") === 0) { 
          avatarUrl = pUrl; 
      } else {
          let cleanPath = pUrl.split('\\').join('/');
          avatarUrl = "https://talexajobs.onrender.com/" + cleanPath;
      }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* HEADER HERO SECTION (Matching CompanyProfile) */}
      <div className="relative h-40 sm:h-64 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-blue-800 via-slate-900 to-indigo-900"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20 relative z-10">
        
        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 md:p-10 mb-6 sm:mb-8">
          
          <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center text-slate-500 hover:text-slate-900 font-bold text-xs sm:text-sm transition-all group w-fit">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back
          </button>

          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-8 border-b border-slate-100 pb-6 sm:pb-8">
            <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto text-center md:text-left">
              
              {/* INDIVIDUAL PROFILE AVATAR (Rounded-full instead of rounded-2xl for people) */}
              <div className="h-20 w-20 sm:h-28 sm:w-28 rounded-full border-4 border-white shadow-md bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {avatarUrl && !imgError ? (
                  <img 
                    src={avatarUrl} 
                    alt={fullName} 
                    className="h-full w-full object-cover" 
                    onError={() => setImgError(true)} 
                  />
                ) : (
                  <span className="font-extrabold text-slate-400 text-3xl sm:text-5xl">{fullName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              {/* USER INFO */}
              <div className="flex-1 min-w-0 max-w-full">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight break-words">{fullName}</h1>
                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-2 sm:gap-3 mt-2 sm:mt-3 max-w-full">
                  <span className="bg-blue-50 text-blue-700 font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-md uppercase tracking-widest border border-blue-100 truncate max-w-full inline-block">
                    {jobTitle} at {companyName}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS & BADGE (Flex column layout) */}
            <div className="flex-shrink-0 mt-4 md:mt-0 w-full md:w-auto flex flex-col items-center md:items-end gap-2">
              
              {/* THE ACTIVE RECRUITER BADGE */}
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1.5 rounded-xl shadow-sm w-fit mb-1">
                 <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                 <span className="font-black uppercase text-[9px] sm:text-[10px] tracking-widest">Active Recruiter</span>
              </div>
              
              {/* ACTION BUTTON */}
              {isMyProfile ? (
                <Link to="/settings" className="bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl hover:bg-slate-200 transition shadow-sm text-sm sm:text-base w-full md:w-auto text-center">Edit Settings</Link>
              ) : (
                <button onClick={() => navigate('/messages', { state: { prefilledContact: profileData } })} className="bg-blue-600 text-white font-bold py-2.5 sm:py-3 px-6 sm:px-8 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base w-full md:w-auto flex items-center justify-center gap-2">
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
  Message {firstName}
</button>
              )}
            </div>
          </div>

          {/* QUICK STATS GRID (Matching CompanyProfile layout) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Location
              </p>
              {location !== "Remote" && location !== "" ? (
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
              <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate">{new Date(profileData.createdAt).getFullYear()}</p>
            </div>
            
            <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 min-w-0 col-span-2 md:col-span-1">
              <p className="text-[9px] sm:text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5 truncate">
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                Business Contact
              </p>
              {businessEmail !== "" ? (
                 <p className="font-extrabold text-slate-900 text-xs sm:text-sm md:text-base truncate">{businessEmail}</p>
              ) : (
                 <p className="font-bold text-slate-400 text-xs sm:text-sm md:text-base italic truncate">Not specified</p>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          
          {/* LEFT COLUMN: ABOUT SECTIONS */}
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                About {firstName}
              </h3>
              <p className={`leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium ${bio.includes("hasn't added") ? "text-slate-400 italic" : "text-slate-600"}`}>
                {bio}
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 md:p-8">
              <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 border-b border-slate-100 pb-2.5 sm:pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                About {companyName}
              </h3>
              <p className={`leading-relaxed text-xs sm:text-sm whitespace-pre-wrap font-medium ${companyDesc.includes("description provided") ? "text-slate-400 italic" : "text-slate-600"}`}>
                {companyDesc}
              </p>
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR LINKS */}
          <div className="lg:col-span-1 space-y-5 sm:space-y-6">
            
            {/* COMPANY HUB CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-md p-6 sm:p-8 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl"></div>
               
               <div className="h-16 w-16 sm:h-20 sm:w-20 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4 sm:mb-5 relative z-10">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">{companyName.charAt(0).toUpperCase()}</span>
               </div>
               
               <h4 className="font-extrabold text-white text-lg sm:text-xl mb-1 sm:mb-2 relative z-10">{companyName}</h4>
               <p className="text-slate-400 text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 uppercase tracking-widest relative z-10">Corporate Hub</p>
               
               <Link to={"/employer/" + id} className="w-full bg-blue-600 text-white font-bold py-3 sm:py-3.5 px-4 rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm mb-3 sm:mb-4 relative z-10">
                 View Company Profile
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </Link>

               {companyWebsite !== "" ? (
                 <a href={companyWebsite.indexOf('http') === 0 ? companyWebsite : "https://" + companyWebsite} target="_blank" rel="noreferrer" className="text-blue-400 text-[10px] sm:text-xs font-bold hover:underline relative z-10 transition">
                    Visit External Website
                 </a>
               ) : (
                 <span className="text-slate-500 text-[10px] sm:text-xs font-bold relative z-10 italic">No Website Added</span>
               )}
            </div>

            {/* PORTFOLIO LINKS CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
              <h5 className="text-[10px] sm:text-xs font-black text-slate-900 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                 Professional Links
              </h5>
              {portfolio !== "" ? (
                <a href={portfolio.indexOf('http') === 0 ? portfolio : "https://" + portfolio} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-200 px-4 py-2.5 sm:py-3 rounded-xl font-bold transition shadow-sm text-xs sm:text-sm">
                  Portfolio Website
                </a>
              ) : (
                <div className="w-full flex items-center justify-center gap-2 bg-slate-50 text-slate-400 border border-slate-100 px-4 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm italic">
                  No portfolio link provided
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerProfile;