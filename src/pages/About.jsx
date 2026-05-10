import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* Hero Section */}
      <div className="bg-blue-600 py-24 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-6">
            Welcome to TalexaJobs
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-blue-100 leading-relaxed">
            More than just a job board. We are a secure, community-driven ecosystem designed to bridge the gap between world-class talent and trusted employers.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-12 mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Our Story</h2>
          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            TalexaJobs was built from a simple observation: the modern hiring process is broken. Job seekers send their resumes into black holes, while companies struggle to find genuine, qualified talent amidst the noise. We realized that what was missing wasn't more jobs—it was <strong className="text-slate-800">trust and communication.</strong>
          </p>
          <p className="text-slate-600 text-lg leading-relaxed">
            We launched this platform to fix that. We set out to create a space that feels professional yet human, where you aren't just a resume on a screen, but a professional ready to make an impact.
          </p>
        </div>

        {/* The TalexaJobs Difference - Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          
          {/* Safety Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 hover:shadow-md transition">
            <div className="h-14 w-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Uncompromising Safety</h3>
            <p className="text-slate-600 leading-relaxed text-[17px]">
              Your security is our top priority. Unlike open job boards where anyone can post a scam, TalexaJobs employs a dedicated <strong className="text-slate-800">Admin Trust & Safety Team</strong>. Every single employer must upload official verification documents and pass a strict manual review before they are allowed to post a job or contact you. You can apply with total peace of mind.
            </p>
          </div>

          {/* Messaging Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 hover:shadow-md transition">
            <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Connect Before You Apply</h3>
            <p className="text-slate-600 leading-relaxed text-[17px]">
              Have a question about a company's culture? Need to know if a job offers remote flexibility? We built a powerful, real-time <strong className="text-slate-800">Peer-to-Peer Messaging System</strong> right into the platform. We encourage job seekers to message employers to learn more about the role <em>before</em> clicking apply. It’s hiring, made conversational.
            </p>
          </div>

        </div>

        {/* Call to Action */}
        <div className="bg-slate-900 rounded-2xl p-10 text-center text-white shadow-lg">
          <h3 className="text-3xl font-bold mb-4">Ready to elevate your career?</h3>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Whether you are looking to hire top-tier talent or find your next great opportunity, you belong here.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/jobs" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full transition">
              Find a Job
            </Link>
            <Link to="/login" className="bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-8 rounded-full transition">
              Create an Account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;