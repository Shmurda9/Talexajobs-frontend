import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-10 mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
        
        {/* Brand Section */}
        <div className="mb-6 md:mb-0">
          <h2 className="font-bold text-[22px] tracking-tight text-white lowercase" style={{ fontFamily: "'Poppins', sans-serif" }}>
  talexajobs
</h2>
          <p className="text-sm mt-2 text-slate-400 max-w-sm">
            Connecting top global talent with the best worldwide employers. Build your future today.
          </p>
        </div>

        {/* Links Section */}
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link to="/privacy" className="hover:text-blue-400 transition duration-200 text-sm">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-blue-400 transition duration-200 text-sm">Terms of Service</Link>
          <a href="mailto:support@TalexaJobs.com" className="hover:text-blue-400 transition duration-200 text-sm">Contact Us</a>
        </div>
      </div>
      
      {/* Copyright */}
      <div className="text-center text-sm text-slate-500 mt-8 border-t border-slate-800 pt-6">
        &copy; {new Date().getFullYear()} TalexaJobs Platform. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;