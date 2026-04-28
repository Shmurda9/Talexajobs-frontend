import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client'; 
import axios from 'axios';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);
  
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState('English'); 
  const [currentFlag, setCurrentFlag] = useState('🇺🇸'); 
  const [searchQuery, setSearchQuery] = useState('');

  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [socket, setSocket] = useState(null);

  const location = useLocation(); 
  const token = localStorage.getItem('token');

  const languages = [
    { code: 'af', name: 'Afrikaans', flag: '🇿🇦' }, { code: 'sq', name: 'Albanian', flag: '🇦🇱' },
    { code: 'am', name: 'Amharic', flag: '🇪🇹' }, { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hy', name: 'Armenian', flag: '🇦🇲' }, { code: 'az', name: 'Azerbaijani', flag: '🇦🇿' },
    { code: 'bn', name: 'Bengali', flag: '🇧🇩' }, { code: 'bs', name: 'Bosnian', flag: '🇧🇦' },
    { code: 'bg', name: 'Bulgarian', flag: '🇧🇬' }, { code: 'ca', name: 'Catalan', flag: '🇪🇸' },
    { code: 'zh-CN', name: 'Chinese (Simplified)', flag: '🇨🇳' }, { code: 'hr', name: 'Croatian', flag: '🇭🇷' },
    { code: 'cs', name: 'Czech', flag: '🇨🇿' }, { code: 'da', name: 'Danish', flag: '🇩🇰' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' }, { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fi', name: 'Finnish', flag: '🇫🇮' }, { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' }, { code: 'el', name: 'Greek', flag: '🇬🇷' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' }, { code: 'hu', name: 'Hungarian', flag: '🇭🇺' },
    { code: 'id', name: 'Indonesian', flag: '🇮🇩' }, { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' }, { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'no', name: 'Norwegian', flag: '🇳🇴' }, { code: 'pl', name: 'Polish', flag: '🇵🇱' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' }, { code: 'ro', name: 'Romanian', flag: '🇷🇴' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' }, { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'sv', name: 'Swedish', flag: '🇸🇪' }, { code: 'th', name: 'Thai', flag: '🇹🇭' },
    { code: 'tr', name: 'Turkish', flag: '🇹🇷' }, { code: 'uk', name: 'Ukrainian', flag: '🇺🇦' },
    { code: 'vi', name: 'Vietnamese', flag: '🇻🇳' }
  ];

  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!token) return;
      const currentPath = window.location.pathname;
      if (currentPath.indexOf('/messages') !== -1) {
        setHasNewMessage(false);
        return; 
      }

      try {
        const res = await axios.get('https://talexajobs.onrender.com/api/messages/inbox', {
          headers: { Authorization: "Bearer " + token, token: token }
        });
        if (res.data.success) {
          let unreadFound = false;
          for (let i = 0; i < res.data.contacts.length; i++) {
            if (res.data.contacts[i].unreadCount > 0) {
              unreadFound = true;
              break;
            }
          }
          setHasNewMessage(unreadFound);
        }
      } catch (error) {
        console.error("Silent inbox check failed", error);
      }
    };

    checkUnreadMessages(); 
    const intervalId = setInterval(checkUnreadMessages, 15000); 
    
    return () => clearInterval(intervalId);
  }, [token, location.pathname]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        let myId = decoded.id;
        if (!myId) myId = decoded._id;
        if (!myId) myId = decoded.userId;
        
        if (myId) {
          const newSocket = io("https://talexajobs.onrender.com", { transports: ['websocket', 'polling'] });
          setSocket(newSocket);
          newSocket.emit("addUser", myId);

          newSocket.on("getMessage", (message) => {
            const currentPath = window.location.pathname;
            if (currentPath.indexOf('/messages') === -1) {
              setHasNewMessage(true);
            }
          });

          return () => newSocket.disconnect();
        }
      } catch (e) {
        console.error("Token decode error in Navbar", e);
      }
    }
  }, [token]);

  useEffect(() => {
    if (!document.getElementById('google-translate-script')) {
      const addScript = document.createElement('script');
      addScript.id = 'google-translate-script';
      addScript.setAttribute('src', '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit');
      document.body.appendChild(addScript);

      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false
        }, 'google_translate_element');
      };
    }

    if (document.cookie.includes("googtrans=")) {
      const match = document.cookie.match(/googtrans=\/en\/([a-zA-Z-]+)/);
      if (match && match[1]) {
        const found = languages.find(l => l.code === match[1]);
        if (found) {
          setCurrentLang(found.name);
          setCurrentFlag(found.flag);
        }
      }
    }
  }, [languages]);

  useEffect(() => {
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);

        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userObj = JSON.parse(userStr);
          setUserData(userObj);
          
          let isSetupComplete = false;
          if (userObj.role === 'admin') {
            isSetupComplete = true; 
          } else if (userObj.role === 'employer' && userObj.employerInfo && userObj.employerInfo.companyDescription) {
            isSetupComplete = true;
          } else if (userObj.role === 'jobSeeker' && userObj.candidateInfo && userObj.candidateInfo.headline) {
            isSetupComplete = true;
          }

          const currentPath = window.location.pathname;
          if (!isSetupComplete && currentPath !== '/profile-setup' && currentPath !== '/login' && currentPath !== '/register') {
            window.location.href = '/profile-setup';
          }
        }
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, [token]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user'); 
    window.location.href = '/login'; 
  };

  const getProfilePicUrl = () => {
    if (userData && userData.profilePictureUrl) {
      if (userData.profilePictureUrl.startsWith('http')) {
        return userData.profilePictureUrl;
      }
      const cleanPath = userData.profilePictureUrl.split('\\').join('/');
      return "https://talexajobs.onrender.com/" + cleanPath;
    }
    return null;
  };

  const getAvatarFallback = () => {
    if (userRole === 'admin') return "AD";
    if (userData && userData.fullName) return userData.fullName.charAt(0).toUpperCase();
    return "U";
  };

  const changeLanguage = (code, name, flag) => {
    document.cookie = "googtrans=/en/" + code + "; path=/; domain=" + window.location.hostname;
    document.cookie = "googtrans=/en/" + code + "; path=/"; 
    setCurrentLang(name);
    setCurrentFlag(flag);
    setShowLangModal(false);
    setSearchQuery('');
    toast.success("Translating platform to " + name + "...");
    setTimeout(() => { window.location.reload(); }, 1000);
  };

  const resetLanguage = () => {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    setCurrentLang('English');
    setCurrentFlag('🇺🇸');
    setShowLangModal(false);
    setSearchQuery('');
    toast.success("Reverting to English...");
    setTimeout(() => { window.location.reload(); }, 1000);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <style>{`
        body { top: 0px !important; position: static !important; }
        .skiptranslate iframe, .goog-te-banner-frame { display: none !important; }
        #goog-gt-tt, .goog-te-balloon-frame { display: none !important; opacity: 0 !important; visibility: hidden !important; }
        .goog-text-highlight { background-color: transparent !important; box-shadow: none !important; }
        .goog-tooltip { display: none !important; }
        .goog-tooltip:hover { display: none !important; }
      `}</style>

      <div id="google_translate_element" style={{ display: 'none' }}></div>

      <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50 font-sans transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-[72px] items-center">
            
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 max-w-[40%] group">
              <img 
                src="/logo.png" 
                alt="" 
                className="h-8 sm:h-10 w-auto object-contain" 
                style={{ minWidth: '32px' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <span className="font-black text-lg sm:text-2xl tracking-wide text-white truncate w-full">
                TalexaJobs
              </span>
            </Link>
            
            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-6">
                
                {userRole === 'admin' ? (
                  <>
                    <Link to="/admin" className={"text-sm font-bold transition-all " + (isActive('/admin') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Command Center</Link>
                    <Link to="/" className="text-sm font-bold text-blue-100 hover:text-white transition">View Live Site</Link>
                  </>
                ) : (
                  <>
                    <Link to="/" className={"text-sm font-bold transition-all " + (isActive('/') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Home</Link>
                    <Link to="/jobs" className={"text-sm font-bold transition-all " + (isActive('/jobs') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Find Jobs</Link>
                    
                    {userRole === 'employer' && (
                      <>
                        <Link to="/employer-dashboard" className={"text-sm font-bold transition-all " + (isActive('/employer-dashboard') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>My Jobs</Link>
                        <Link to="/manage-applicants" className={"text-sm font-bold transition-all " + (isActive('/manage-applicants') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Manage Applicants</Link>
                        <Link to="/post-job" className={"text-sm font-bold transition-all " + (isActive('/post-job') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Post a Job</Link>
                      </>
                    )}
                    
                    {token && userRole === 'jobSeeker' && (
                      <>
                      <Link to="/dashboard" className={"text-sm font-bold transition-all " + (isActive('/dashboard') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Dashboard</Link>
                      <Link to="/saved-jobs" className={"text-sm font-bold transition-all " + (isActive('/saved-jobs') ? "text-white border-b-2 border-white pb-1" : "text-blue-100 hover:text-white")}>Saved Jobs</Link>
                      </>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-5 pl-6 border-l border-blue-600">
                
                {token && userRole !== 'admin' && (
                  <Link to="/messages" className="relative group flex items-center justify-center">
                    <div className="p-2 text-blue-100 hover:text-white hover:bg-blue-600 rounded-full transition">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    </div>
                    {hasNewMessage && (
                      <span className="absolute top-1 right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-slate-900"></span>
                      </span>
                    )}
                  </Link>
                )}

                <button 
                  onClick={() => { setShowLangModal(true); setSearchQuery(''); }} 
                  className="flex items-center gap-2 text-xs font-bold text-blue-100 hover:text-white transition bg-blue-800 hover:bg-blue-900 px-3 py-1.5 rounded-full"
                >
                  <span className="text-base leading-none">{currentFlag}</span>
                  <span className="max-w-[80px] truncate">{currentLang}</span>
                </button>

                {!token ? (
                  <div className="flex items-center gap-3">
                    <Link to="/login" className="text-sm font-bold text-blue-100 hover:text-white transition px-3 py-2">Log in</Link>
                    <Link to="/register" className="bg-white text-blue-700 hover:bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-extrabold transition shadow-sm">
                      Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-blue-800 pr-2 pl-1 py-1 rounded-full max-w-[180px]">
                    <Link to={userRole === 'admin' ? "/admin" : "/my-profile"} className="h-8 w-8 shrink-0 rounded-full border border-blue-600 overflow-hidden bg-blue-900 flex items-center justify-center hover:border-white transition cursor-pointer">
                      {userRole !== 'admin' && getProfilePicUrl() ? (
                        <img src={getProfilePicUrl()} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-blue-100 text-xs">{getAvatarFallback()}</span>
                      )}
                    </Link>
                    <div className="flex flex-col justify-center min-w-0 flex-1">
                      <span className="text-[11px] font-bold text-white truncate block w-full">{userData ? userData.fullName.split(' ')[0] : 'User'}</span>
                    </div>
                    <button onClick={handleLogout} className="text-blue-300 hover:text-white transition ml-1 shrink-0 p-1" title="Logout">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:hidden flex items-center gap-3 pr-1">
              
              {token && userRole !== 'admin' && (
                <Link to="/messages" className="relative text-blue-200 hover:text-white p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                  {hasNewMessage && (
                    <span className="absolute top-1 right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-slate-900"></span>
                    </span>
                  )}
                </Link>
              )}

              <button onClick={() => { setShowLangModal(true); setSearchQuery(''); }} className="text-blue-200 hover:text-white p-2 flex items-center gap-1">
                 <span className="text-lg leading-none">{currentFlag}</span>
              </button>
              
              <button onClick={toggleMenu} className="text-white p-2 focus:outline-none">
                {isOpen ? <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg> : <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden bg-slate-800 border-t border-slate-700 shadow-2xl">
            <div className="px-4 py-4 space-y-1">
              
              {token && userData && (
                <div className="flex items-center justify-between px-3 py-4 mb-4 border-b border-blue-700">
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    <div className="h-10 w-10 shrink-0 rounded-full border border-blue-500 overflow-hidden bg-blue-900 flex items-center justify-center">
                      {userRole !== 'admin' && getProfilePicUrl() ? (
                        <img src={getProfilePicUrl()} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-bold text-white text-sm">{getAvatarFallback()}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-sm truncate block w-full">{userData.fullName}</p>
                      <p className="text-[10px] text-blue-200 font-extrabold mt-0.5 uppercase tracking-wider">{userRole}</p>
                    </div>
                  </div>
                  <button onClick={handleLogout} className="text-blue-200 hover:text-white p-2 bg-blue-700 rounded-lg shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              )}

              {userRole === 'admin' ? (
                <>
                  <Link to="/admin" className="block px-4 py-3 rounded-xl text-sm font-bold text-white hover:bg-blue-700">Command Center</Link>
                  <Link to="/" className="block px-4 py-3 rounded-xl text-sm font-bold text-blue-100 hover:bg-blue-700 hover:text-white">View Live Site</Link>
                </>
              ) : (
                <>
                <Link to="/" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Home</Link>
                  <Link to="/jobs" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/jobs') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Find Jobs</Link>
                  
                  {userRole === 'employer' && (
                    <>
                      <Link to="/employer-dashboard" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/employer-dashboard') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>My Jobs</Link>
                      <Link to="/manage-applicants" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/manage-applicants') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Manage Applicants</Link>
                      <Link to="/post-job" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/post-job') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Post a Job</Link>
                    </>
                  )}
                  
                  {token && userRole === 'jobSeeker' && (
                    <>
                      <Link to="/dashboard" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/dashboard') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Dashboard</Link>
                      <Link to="/saved-jobs" className={"block px-4 py-3 rounded-xl text-sm font-bold " + (isActive('/saved-jobs') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>Saved Jobs</Link>
                    </>
                  )}

                  {token && (
                    <Link to="/messages" className={"block px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-between " + (isActive('/messages') ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-700 hover:text-white")}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        Messages
                      </div>
                      {hasNewMessage && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">NEW</span>
                      )}
                    </Link>
                  )}
                </>
              )}
              
              {!token && (
                <div className="pt-4 border-t border-blue-700 flex flex-col gap-3 mt-4">
                  <Link to="/login" className="block text-center px-4 py-3 rounded-xl text-sm font-bold text-white bg-blue-800 hover:bg-blue-700 border border-blue-600">Log in</Link>
                  <Link to="/register" className="block text-center px-4 py-3 rounded-xl text-sm font-bold bg-white text-blue-700 shadow-lg">Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {showLangModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col font-sans overflow-hidden border border-slate-200">
            
            <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center z-20">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Select Region & Language</h3>
                <p className="text-slate-500 text-sm font-medium mt-1">Translate the entire platform instantly.</p>
              </div>
              <button onClick={() => setShowLangModal(false)} className="text-slate-400 hover:text-rose-500 transition bg-slate-50 hover:bg-rose-50 rounded-full p-2 border border-slate-100 hover:border-rose-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 z-10">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search for a language (e.g. Spanish, Hindi)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm transition"
                />
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              
              <button onClick={resetLanguage} className="w-full mb-6 bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-slate-800 transition shadow-md flex items-center justify-center gap-2 group">
                <span className="text-lg">🇺🇸</span> 
                Restore Original English
              </button>
              
              {filteredLanguages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-3">🌍</div>
                  <h3 className="text-lg font-bold text-slate-900">No languages found</h3>
                  <p className="text-slate-500 text-sm">Try searching for a different language.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {filteredLanguages.map((lang) => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code, lang.name, lang.flag)} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50 hover:shadow-md transition text-left group">
                      <span className="text-2xl leading-none shadow-sm rounded-sm">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{lang.name}</span>
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mt-0.5">{lang.code}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;