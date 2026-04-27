import React from "react";
import { Link } from "react-router-dom";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          
          {/* PREMIUM HEADER */}
          <div className="bg-slate-900 px-8 py-12 border-b border-slate-800 relative overflow-hidden text-center">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-emerald-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
                <p className="text-emerald-200 font-medium text-sm md:text-base">Last Updated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>

          <div className="p-8 sm:p-12 text-slate-600 space-y-8 text-sm sm:text-base leading-relaxed">
            
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">1. Information We Collect</h2>
              <p>
                When you register on Talexajobs, we collect personal information necessary to provide our services. For <strong>Job Seekers</strong>, this includes your name, email, professional experience, uploaded resumes (CVs), and application history. For <strong>Employers</strong>, this includes company details, verification documents, and posted job data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>To connect Job Seekers with prospective Employers.</li>
                <li>To send critical account notifications, application updates, and security alerts.</li>
                <li>To analyze platform usage and improve our services.</li>
                <li>To verify employer legitimacy and maintain platform security.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">3. Data Sharing and Disclosure</h2>
              <p>
                Talexajobs strictly protects your data. We only share Job Seeker profiles and resumes with Employers when you explicitly choose to submit an application. We do not sell your personal data to third-party marketing agencies. We may disclose information if legally required by law enforcement or to protect the safety and rights of our users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">4. Security of Your Data</h2>
              <p>
                We implement industry-standard security measures, including encryption and secure server hosting, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">5. Your Rights</h2>
              <p>
                You have the right to access, update, or delete your personal information at any time through your Profile Dashboard. If you wish to permanently delete your account and all associated data from our servers, please contact our support team.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 mt-8 text-center">
              <p className="text-slate-500 font-medium mb-4">Privacy Concerns?</p>
              <a href="mailto:support@Talexajobs.com" className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-800 transition shadow-md">
                Email Our Privacy Team
              </a>
            </div>
            </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;