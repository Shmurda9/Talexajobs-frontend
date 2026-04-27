import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero'; 
import Features from '../components/Features'; 

function Home() {
  const token = localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* Subtle Premium Background Mesh for the Light Section */}
      <div className="absolute top-[600px] left-[-10%] w-[600px] h-[600px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[1000px] right-[-10%] w-[600px] h-[600px] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="relative z-10">
        <Hero />
        <Features />

        {/* --- PREMIUM INDUSTRY CATEGORIES --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center mb-16 md:mb-20 relative z-10">
            <span className="text-blue-600 font-extrabold tracking-wider uppercase text-sm mb-3 block">Explore Sectors</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-6">
              Opportunities Across <br className="hidden md:block" /> Every Industry
            </h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
              From the corporate boardroom to the construction site, we connect elite talent with the companies building our world.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
            
            {/* 1. Tech & Corporate */}
            <Link to="/jobs?category=Technology" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Corporate Office" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-blue-300 transition-colors duration-300">Tech & Corporate</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Software engineering, finance, human resources, and executive leadership roles.</p>
                <div className="flex items-center text-blue-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            {/* 2. Construction & Trades */}
            <Link to="/jobs?category=Construction" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1531834685032-c34bf0d84c77?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Construction Worker" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-amber-400 transition-colors duration-300">Construction</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Skilled labor, heavy machinery operation, contracting, and site management.</p>
                <div className="flex items-center text-amber-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            {/* 3. Logistics & Supply Chain */}
            <Link to="/jobs?category=Logistics" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Warehouse Logistics" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-slate-300 transition-colors duration-300">Logistics</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Commercial driving, warehouse operations, dispatch, and global supply chain.</p>
                <div className="flex items-center text-slate-300 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            {/* 4. Healthcare & Medical */}
            <Link to="/jobs?category=Healthcare" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-emerald-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Medical Professionals" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300">Healthcare</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Nursing, specialized medicine, clinical research, and healthcare administration.</p>
                <div className="flex items-center text-emerald-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            {/* 5. Agriculture & Farming */}
            <Link to="/jobs?category=Agriculture" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-green-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1628352081506-83c43123ed6d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Farming Agriculture" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-green-400 transition-colors duration-300">Agriculture</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Farming, agricultural science, equipment operation, and food production.</p>
                <div className="flex items-center text-green-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

            {/* 6. Retail & Hospitality */}
            <Link to="/jobs?category=Retail" className="group relative h-72 md:h-[340px] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-rose-900/20 transition-all duration-500 block bg-slate-900">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Retail and Hospitality" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700 ease-out" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end">
                <h3 className="text-2xl md:text-3xl font-black text-white mb-2 group-hover:text-rose-400 transition-colors duration-300">Retail & Hospitality</h3>
                <p className="text-slate-300 text-sm md:text-base font-medium line-clamp-2 mb-4">Customer service, culinary arts, hotel management, and retail leadership.</p>
                <div className="flex items-center text-rose-400 font-bold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                  Explore Roles <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
              </div>
            </Link>

          </div>
        </div>

        {/* --- ENTERPRISE CALL TO ACTION --- */}
        <div className="relative py-20 md:py-32 overflow-hidden bg-slate-900 rounded-t-[3rem] mt-10 shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight mb-6">
              Ready to Take the <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">Next Step?</span>
            </h2>
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-12 max-w-2xl mx-auto">
              Join thousands of professionals and top-tier companies building the future together on TalexaJobs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/jobs" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-10 rounded-2xl shadow-lg shadow-blue-600/30 transition-all duration-300 transform hover:-translate-y-1 text-lg">
                Search Opportunities
              </Link>
              
              {!token && (
                <Link to="/register" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 text-lg">
                  Create an Account
                </Link>
              )}
              
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;