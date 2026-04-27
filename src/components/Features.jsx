import React from 'react';

function Features() {
  return (
    <div className="py-16 md:py-24 bg-slate-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-extrabold tracking-wider uppercase text-sm mb-3">Why Choose Us</h2>
          <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
            Built for the Modern Workforce
          </h3>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            We provide the tools, security, and global reach you need to accelerate your career or build your ultimate dream team.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Feature 1: Global Reach */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 hover:shadow-2xl hover:shadow-blue-900/5 hover:-translate-y-2 hover:border-blue-200 transition-all duration-300 ease-out group">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-blue-100 group-hover:border-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4">Global Reach</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
              Access opportunities across borders. Whether you want to work remotely for a tech giant or relocate, we connect you to the world.
            </p>
          </div>

          {/* Feature 2: Smart Profiles */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 hover:shadow-2xl hover:shadow-indigo-900/5 hover:-translate-y-2 hover:border-indigo-200 transition-all duration-300 ease-out group">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-sm border border-indigo-100 group-hover:border-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4">Digital Resumes</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
              Ditch the paper. Create a stunning, modern profile that highlights your skills, experience, and instantly catches the eye of recruiters.
            </p>
          </div>

          {/* Feature 3: Verified Security */}
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-slate-200 hover:shadow-2xl hover:shadow-emerald-900/5 hover:-translate-y-2 hover:border-emerald-200 transition-all duration-300 ease-out group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-8 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 shadow-sm border border-emerald-100 group-hover:border-emerald-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4">Enterprise Security</h3>
            <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
              Every employer and job posting is strictly vetted by our moderation team to guarantee a safe, scam-free ecosystem for your job hunt.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Features;