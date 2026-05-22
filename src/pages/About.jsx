import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* 🚨 PREMIUM HERO SECTION */}
      <div className="bg-slate-900 pt-24 pb-32 px-4 sm:px-6 lg:px-8 text-center relative">
        {/* Soft Background Depth */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto mt-8">
          <span className="text-blue-400 font-bold tracking-widest uppercase text-xs sm:text-sm mb-4 block">The Global Talent Network</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
            Elevating How the World Hires
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed font-medium">
            We are a curated ecosystem connecting elite professionals with verified, industry-leading employers. No noise, just meaningful career advancement.
          </p>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-24">
        
        {/* 🚨 REWRITTEN STORY SECTION */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 p-8 sm:p-12 mb-8">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Our Story</h2>
          </div>
          
          <div className="space-y-5 text-slate-600 text-sm sm:text-[16px] leading-relaxed font-medium">
            <p>
              The professional landscape has evolved aggressively, yet the tools we use to navigate it have remained stagnant. We observed a fundamental disconnect in the industry: brilliant candidates were losing their voices in algorithmic black holes, while visionary companies were struggling to find authentic talent amidst a sea of unverified applications.
            </p>
            <p>
              TalexaJobs was not built to be another open job board. It was engineered to be a bridge. We realized that solving the modern hiring crisis did not require more job listings; it required <strong className="text-slate-900 font-bold">transparency, verified connections, and mutual trust.</strong>
            </p>
            <p>
              We launched this platform to bring the human element back to professional growth. Here, you are not a metric on a dashboard. You are a professional stepping into a secure, meticulously curated workspace designed to accelerate your trajectory.
            </p>
          </div>
        </div>

        {/* 🚨 REWRITTEN FEATURES GRID */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-12">
          
          {/* Uncompromising Trust Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 sm:p-10 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mb-6 group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Uncompromising Verification</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-[15px] font-medium">
              Your career is your most valuable asset, and protecting it is our core mandate. We do not permit open, unmoderated recruiting. Every employer on our platform is required to pass a rigorous compliance review by our internal trust team. We ensure that every opportunity you view is real, active, and backed by a legitimate organization.
            </p>
          </div>

          {/* Direct Access Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 sm:p-10 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="h-14 w-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-700 mb-6 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">Direct Access to Decision Makers</h3>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-[15px] font-medium">
              The days of applying and simply hoping are over. We engineered a proprietary communication infrastructure that allows you to initiate conversations directly with hiring teams. Ask critical questions about company culture, clarify role expectations, and build rapport before you ever submit an application.
            </p>
          </div>

        </div>

        {/* 🚨 PREMIUM CALL TO ACTION */}
        <div className="bg-slate-900 rounded-[2rem] p-10 sm:p-14 text-center text-white shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-transparent"></div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">Step Inside the Network.</h3>
            <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto font-medium">
              Whether you are an enterprise looking to hire top-tier talent, or a professional seeking your next great opportunity, you belong here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl transition shadow-lg shadow-blue-600/30 text-sm">
                Create an Account
              </Link>
              <Link to="/jobs" className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold py-3.5 px-8 rounded-xl transition text-sm">
                Explore Opportunities
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;
