import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

function EmployerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  
  // Privacy Toggle State
  const [isEmailHidden, setIsEmailHidden] = useState(false);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);

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
          headers: { 
            token: token, 
            Authorization: "Bearer " + token 
          }
        });
        
        if (response.data && response.data.user) {
          setProfileData(response.data.user);
          if (response.data.user.hideEmail === true) {
              setIsEmailHidden(true);
          }
        } else if (response.data && !response.data.user) {
           setProfileData(response.data);
           if (response.data.hideEmail === true) { setIsEmailHidden(true); }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Could not load employer profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, token, navigate]);

  const toggleEmailPrivacy = async function() {
    setIsSavingPrivacy(true);
    try {
      const newPrivacyStatus = !isEmailHidden;
      await axios.put("https://talexajobs.onrender.com/api/users/update-privacy", 
        { hideEmail: newPrivacyStatus },
        { headers: { token: token, Authorization: "Bearer " + token } }
      );
      
      setIsEmailHidden(newPrivacyStatus);
      toast.success(newPrivacyStatus ? "Email is now hidden from candidates." : "Email is now visible to candidates.");
    } catch (error) {
      toast.error("Failed to update privacy settings.");
    } finally {
      setIsSavingPrivacy(false);
    }
  };

  const handleMessageRedirect = () => {
    navigate('/messages', { state: { prefilledContact: profileData } });
  };

  const getAvatarSrc = () => {
    if (profileData && profileData.profilePictureUrl) {
      const cleanPath = profileData.profilePictureUrl.replace(/\\/g, '/');
      if (cleanPath.startsWith('http')) return cleanPath;
      if (cleanPath.startsWith('/')) return "https://talexajobs.onrender.com" + cleanPath;
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
        <p className="text-slate-500 font-medium animate-pulse tracking-wide text-sm">Loading Profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-[#f4f6f8] flex items-center justify-center flex-col p-4 text-center">
        <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 border border-slate-100">
            <svg className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
        <p className="text-slate-500 text-sm sm:text-base mb-6 font-normal">This user may have deleted their account.</p>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white font-medium py-2.5 px-6 rounded-xl hover:bg-blue-700 transition shadow-sm text-sm sm:text-base">Go Back</button>
      </div>
    );
  }

  const avatarUrl = getAvatarSrc();
  
  // Safe Variable Extraction without || operators
  let companyName = "Independent Employer";
  let location = ""; 
  let personalBio = "";
  let portfolioWebsite = "";
  
  if (profileData.location) { location = profileData.location; }
  if (profileData.bio) { personalBio = profileData.bio; }
  if (profileData.portfolioUrl) { portfolioWebsite = profileData.portfolioUrl; }
  else if (profileData.website) { portfolioWebsite = profileData.website; }
  
  if (profileData.employerInfo) {
      if (profileData.employerInfo.companyName) { companyName = profileData.employerInfo.companyName; }
      if (location === "" && profileData.employerInfo.location) { location = profileData.employerInfo.location; }
      if (personalBio === "" && profileData.employerInfo.bio) { personalBio = profileData.employerInfo.bio; }
      
      if (portfolioWebsite === "" && profileData.employerInfo.personalWebsite) { portfolioWebsite = profileData.employerInfo.personalWebsite; }
      else if (portfolioWebsite === "" && profileData.employerInfo.website) { portfolioWebsite = profileData.employerInfo.website; }
      
  } else if (profileData.candidateInfo) {
      if (profileData.candidateInfo.headline) { companyName = profileData.candidateInfo.headline; }
      else { companyName = "Job Seeker"; }
      if (location === "" && profileData.candidateInfo.location) { location = profileData.candidateInfo.location; }
  }

  let firstName = "Employer";
  if (profileData.fullName) {
      firstName = profileData.fullName.split(' ')[0];
  }

  let joinedYear = new Date().getFullYear();
  if (profileData.createdAt) {
      joinedYear = new Date(profileData.createdAt).getFullYear();
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] py-6 sm:py-10 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Back */}
        <button onClick={() => navigate(-1)} className="mb-4 sm:mb-6 flex items-center text-slate-500 hover:text-slate-800 transition-colors font-semibold text-xs sm:text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm w-fit group">
          <svg className="w-4 h-4 mr-2 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 h18" /></svg>
          Back to previous page
        </button>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 sm:mb-8 relative">
          
          {/* Cover Banner */}
          <div className="bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 h-32 sm:h-40 relative">
             <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          </div>
          
          <div className="px-5 sm:px-8 md:px-10 pb-6 sm:pb-8 relative">
            
            {/* 🚨 FIXED MARGINS HERE: Text stays low, only avatar floats up! */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 w-full sm:w-auto text-center sm:text-left">
                
                <div className="-mt-14 sm:-mt-16 h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center flex-shrink-0 z-10 relative">
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
                
                <div className="mt-2 sm:mt-0 mb-1 sm:mb-2 flex-1 min-w-0 pt-2 sm:pt-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 break-words leading-tight">{profileData.fullName}</h1>
                  <p className="text-base sm:text-lg text-blue-600 font-extrabold mt-1 truncate">
                    {profileData.role === 'employer' ? "Hiring Manager at " + companyName : companyName}
                  </p>
                </div>
              </div>
              
              <div className="mt-3 sm:mt-0 w-full sm:w-auto flex-shrink-0 z-10 pt-2 sm:pt-0">
                {isMyProfile ? (
                  <Link 
                    to="/settings" 
                    className="w-full bg-white border border-slate-200 text-slate-700 font-extrabold py-3.5 px-8 rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <button 
                    onClick={handleMessageRedirect} 
                    className="w-full bg-blue-600 text-white font-extrabold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03-8-9-8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    Message {firstName}
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-6 mt-6 sm:mt-8 border-t border-slate-100 pt-5 sm:pt-6">
              
              {/* Email Badge */}
              <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-full">
                {isEmailHidden && !isMyProfile ? (
                  <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                ) : (
                  <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
                )}
                <span className="font-bold text-xs sm:text-sm break-all">
                  {isEmailHidden && !isMyProfile ? "Hidden for privacy" : profileData.email}
                </span>
              </div>
              
              {/* Location Badge */}
              {location !== "" && (
                <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-full">
                    <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <span className="font-bold text-xs sm:text-sm truncate">{location}</span>
                </div>
              )}
              
              {/* Joined Badge */}
              <div className="flex items-center text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-fit max-w-full">
                <svg className="w-4 h-4 mr-2 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="font-bold text-xs sm:text-sm truncate">Joined {joinedYear}</span>
              </div>

            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          
          {/* LEFT COLUMN: About Employer */}
          <div className="md:col-span-2 space-y-5 sm:space-y-6">
            
            {profileData.role === 'employer' ? (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
                  <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    About {firstName}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                    {personalBio !== "" ? personalBio : "This hiring manager hasn't added a personal bio yet. Message them directly to learn more!"}
                  </p>

                  {/* Bridge to the Company Profile */}
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-center sm:text-left">
                      <h4 className="font-bold text-indigo-900 mb-1">Company Profile</h4>
                      <p className="text-xs sm:text-sm text-indigo-700 font-medium">Learn more about the team, culture, and active job openings at {companyName}.</p>
                    </div>
                    <Link 
                      to={"/employer/" + id} 
                      className="whitespace-nowrap inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold transition shadow-sm text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      View Company
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                <p className="text-slate-500 font-bold">This is an employer account.</p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Settings / Links */}
          <div className="space-y-5 sm:space-y-6">
            
            {/* Employer Website / Portfolio */}
            {portfolioWebsite !== "" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                  Links
                </h3>
                
                <a 
                  href={portfolioWebsite.startsWith('http') ? portfolioWebsite : "https://" + portfolioWebsite} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-3 rounded-xl font-bold transition shadow-sm text-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Employer Website / Portfolio
                </a>
              </div>
            )}

            {/* Privacy Section - ONLY VISIBLE IF VIEWING OWN PROFILE */}
            {isMyProfile && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                <h3 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Contact Privacy
                </h3>
                
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 font-medium">
                    {isEmailHidden ? "Your email is currently hidden from candidates." : "Your email is visible to candidates."}
                  </p>

                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Hide Email</span>
                    <button 
                      onClick={toggleEmailPrivacy} 
                      disabled={isSavingPrivacy}
                      className={"relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none " + (isEmailHidden ? "bg-amber-500" : "bg-slate-300")}
                    >
                      <span className={"pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out " + (isEmailHidden ? "translate-x-5" : "translate-x-0")}></span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployerProfile;