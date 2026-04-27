import React from "react";
import { Link } from "react-router-dom";

function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-slate-200">
          
          {/* PREMIUM HEADER */}
          <div className="bg-slate-900 px-8 py-12 border-b border-slate-800 relative overflow-hidden text-center">
             <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             <div className="relative z-10">
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">Terms of Service</h1>
                <p className="text-blue-200 font-medium text-sm md:text-base">Last Updated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>

          <div className="p-8 sm:p-12 text-slate-600 space-y-8 text-sm sm:text-base leading-relaxed">
            
            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using TalexaJobs (the "Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. TalexaJobs reserves the right to update or modify these terms at any time without prior notice.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">2. User Accounts & Responsibilities</h2>
              <p className="mb-2"><strong>For Job Seekers:</strong> You agree to provide accurate, current, and complete information regarding your professional experience, education, and qualifications. TalexaJobs is not responsible for the outcome of any job application.</p>
              <p><strong>For Employers:</strong> You are strictly prohibited from posting fraudulent, discriminatory, or misleading job opportunities. All job postings are subject to review and approval by TalexaJobs Administration. We reserve the right to remove any posting or ban any employer violating these terms.</p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">3. Platform Usage Rules</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>Users may not use the Platform to transmit spam, malware, or unsolicited communications.</li>
                <li>Scraping, data mining, or automated extraction of job postings or candidate profiles is strictly prohibited.</li>
                <li>Employers may not share candidate data (including resumes and contact details) with third parties without the explicit consent of the candidate.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">4. Limitation of Liability</h2>
              <p>
                TalexaJobs acts solely as a venue for employers to post job opportunities and candidates to post resumes. We are not involved in the actual transaction between employers and candidates. TalexaJobs shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-extrabold text-slate-900 mb-3">5. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account and access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users of the Platform, us, or third parties, or for any other reason.
              </p>
            </section>

            <div className="pt-8 border-t border-slate-100 mt-8 text-center">
              <p className="text-slate-500 font-medium mb-4">Questions about these Terms?</p>
              <a href="mailto:support@TalexaJobs.com" className="inline-block bg-blue-50 text-blue-700 font-bold px-6 py-3 rounded-xl border border-blue-100 hover:bg-blue-100 transition">
                Contact Support
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;