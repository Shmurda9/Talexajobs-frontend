import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  return (
    // Enforced Poppins, added border-b, mb-10 for better breathing room below hero.
    <div className="relative bg-slate-900 pt-28 pb-32 lg:pt-36 lg:pb-36 px-4 sm:px-6 lg:px-8 text-center rounded-b-[3rem] shadow-2xl mb-10 overflow-hidden border-b border-slate-800" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Premium Background Meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[500px] bg-blue-600/10 blur-[130px] rounded-full pointer-events-none"></div>
      <div className="absolute -top-24 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto mt-8 sm:mt-12">
        
        {/* Subtitle Tag - Increased margin-bottom for better mobile spacing */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 backdrop-blur-sm text-blue-400 text-xs sm:text-sm font-bold tracking-wide uppercase mb-10 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          The Global Talent Network
        </div>

        {/* --- Headline Fixed --- */}
        {/* Swapped text-5xl for text-4xl on mobile. Changed font-black to font-extrabold. Changed tracking-tight to tracking-normal to prevent the "squeezing." */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-8 tracking-normal leading-[1.2] max-w-4xl mx-auto">
          Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 font-extrabold">Dream Job</span> <br className="hidden md:block" /> Worldwide
        </h1>
        
        {/* --- Description Fixed --- */}
        {/* Swapped text-lg for text-slate-400 for better premium contrast. Increased space below. */}
        <p className="text-base sm:text-lg md:text-xl text-slate-400 mb-14 max-w-2xl mx-auto font-medium leading-relaxed">
          Connect with elite global employers. Whether you are looking for a remote startup or a corporate headquarters, your next career move starts right here.
        </p>
        
        {/* Dynamic Buttons - Updated padding/roundedness */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-24">
          
          {!userRole && (
            <>
              <Link to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 text-lg">
                Find a Job
              </Link>
              <Link to="/register" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 hover:border-white/20 text-white font-extrabold py-4 px-10 rounded-2xl transition-all duration-300 text-lg transform hover:-translate-y-1">
                Hire Talent
              </Link>
            </>
          )}

          {userRole === 'jobSeeker' && (
            <Link to="/jobs" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 text-lg">
              Browse Open Jobs
            </Link>
          )}

          {userRole === 'employer' && (<Link to="/post-job" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/30 transform hover:-translate-y-1 text-lg">
              Post a New Job
            </Link>
          )}

          {userRole === 'admin' && (
            <Link to="/admin" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-extrabold py-4 px-10 rounded-2xl transition-all duration-300 shadow-lg shadow-purple-600/30 transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              Enter Command Center
            </Link>
          )}

        </div>

        {/* --- Analytics Scattering Fixed --- */}
        {/* 1. Entire container is max-w-4xl and max-w-sm on true mobile so they are stacked but narrow. */}
        {/* 2. Reduced padding (p-6) so they are sleeker. */}
        {/* 3. md:grid-cols-3 keeps them stacked on mobile, perfectly horizontal on desktop. */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-sm mx-auto md:max-w-4xl relative z-20">
          
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl hover:bg-slate-800/60 transition duration-300 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-1.5 tracking-tight">601<span className="text-blue-500">+</span></h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Jobs</p>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl hover:bg-slate-800/60 transition duration-300 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-1.5 tracking-tight">450<span className="text-indigo-400">+</span></h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Top Employers</p>
          </div>
          
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl backdrop-blur-md shadow-2xl hover:bg-slate-800/60 transition duration-300 text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-1.5 tracking-tight">47k<span className="text-emerald-400">+</span></h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Candidates Hired</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Hero;